var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph, topicnetGraph) {

	var validRelationships = ['sub', 'next', 'root'];
	var DEFAULT_RESULTS_PER_PAGE = 10;

	function updateTopicIndex(nodeId, topicData) {
		return graph.updateIndex(nodeId, 'topics_name', 'name', topicData.name);
	}

	function findTopicByName(name) {
		var query = helper.escapeLuceneSpecialChars(name.toLowerCase());
		return graph.queryNodeIndex('topics_name', 'name:' + query);
	}

	function checkForDuplicateNew(updatedValues) {
		var deferred = Q.defer();

		return topicnetGraph.topicExistsWithName(updatedValues.name)
		.then(function(exists) {
			if(exists) {
				return Q.reject({ name: 'duplicate', message: 'A topic with the specified name already exists' });
			}
		});
	}

	function checkForDuplicateUpdate(updatedValues, topicId) {
		
		return findTopicByName(updatedValues.name)
		.then(function(results) {
			var resultsOtherThanThis = _.reject(results, function(t) {
				return t.id === topicId;
			});

			if(resultsOtherThanThis.length > 0) {
				return Q.reject({ name: 'duplicate', message: 'Another topic exists with the specified name' });
			}
		});
	}

	function queryRelationship(fromId, toId, relationshipType) {
		var cypherQuery = 'START from=node(' + fromId +	'), to=node(' + toId + ') ' +
			'MATCH from-[r:' + relationshipType + ']->to RETURN r';

		return graph.queryGraph(cypherQuery);
	}

	function makeTopics(queryResult) {
		var topics = [];

		_.each(queryResult, function(result) {
			var id = result.n.id;

			var topic = _.find(topics, function(t) {
				return t.id === id;
			});

			if (topic === undefined) {
				topic = result.n;
				topics.push(topic);
			}

			if (result.r && result.c) {
				var rel = result.r.type;
				if (!topic.hasOwnProperty(rel)) {
					topic[rel] = [];
				}

				result.c.score = result.r.score || 0;
				topic[rel].push(result.c);
			}
		});

		return topics;
	}

	return {

		get: function(id) {
			var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') MATCH n-[r?]->c RETURN n,r,c';

			return graph.queryGraph(cypherQuery)
			.then(function(results) {
				if (results.length < 1) {
					return Q.reject({name: 'notfound', message: 'topic with id ' + id + ' not found'});
				} else {
					return makeTopics(results)[0];
				}
			});
		},

		search: function(params) {

			var page = helper.parsePositiveInt(params.p) || 1;
			var perPage = helper.parsePositiveInt(params.pp) || DEFAULT_RESULTS_PER_PAGE;
			var searchString = params.q || '';

			var cypherQuery = 'START n=node:topics_name({query}) RETURN n ' +
				'SKIP {s} LIMIT {l}';

			var cypherQueryParams = {
				query: 'name:*' + helper.escapeLuceneSpecialChars(searchString.toLowerCase()) + '*',
				s: (page - 1) * perPage,
				l: perPage
			};

			return graph.queryGraph(cypherQuery, cypherQueryParams)
			.then(function(results) {
				return makeTopics(results);
			});
		},

		getRelated: function(fromId, relationshipType) {
			if (!_.include(validRelationships, relationshipType)) {
				fail('invalid relationship. must be one of: ' + validRelationships.join(', '));
				return;
			}

			var cypherQuery = 'START origin=node(' + parseInt(fromId, 10) + ') ' +
				'MATCH origin-[:' + relationshipType + ']->n RETURN n';

			return graph.queryGraph(cypherQuery)
			.then(function(results) {
				return makeTopics(results);
			});
		},

		create: function(topicData) {
			if (!topicData.hasOwnProperty('name') || !topicData.name) {
				return Q.reject('name is required');
			}
	
			return checkForDuplicateNew(topicData)
			.then(function() {
				return topicnetGraph.createTopic(topicData)
			});
		},

		update: function(id, topicData) {
			if (!topicData.hasOwnProperty('name') || !topicData.name) {
				return Q.reject('name is required');
			}

			return checkForDuplicateUpdate(topicData, id)
			.then(function() {
				var result;
				return graph.updateNode(id, topicData)
				.then(function(nodeData) {
					result = nodeData;
					return updateTopicIndex(id, topicData);
				})
				.then(function() {
					return result;
				});
			});

		},

		deleteTopic: function(id) {
			return graph.deleteNode(id);
		},

		getRelationship: function(fromId, toId, relationshipType) {
			return topicnetGraph.getRelationship(fromId, toId, relationshipType)
			.then(function(rel) {
				if(rel === undefined) {
					return Q.reject({name: 'notfound', message: 'Relationship \'' + relationshipType + '\' was not found between ' + fromId + ' and ' + toId});
				} else {
					rel.fromId = parseInt(fromId, 10);
					rel.toId = parseInt(toId, 10);
					rel.relationshipType = relationshipType;
					rel.upVotes = rel.upVotes || 0;
					rel.downVotes = rel.downVotes || 0;
					rel.score = rel.score || 0;
					return rel;
				}
			});
		},

		linkTopic: function(fromId, toId, relationshipType) {
			if (!_.include(validRelationships, relationshipType)) {
				return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
			}

			return topicnetGraph.getRelationship(fromId, toId, relationshipType)
			.then(function(rel) {
				if(rel !== undefined) {
					return Q.reject({name: 'duplicate', message: 'Relationship \'' + relationshipType + '\' already exists between ' + fromId + ' and ' + toId});
				}
			})
			.then(function() {
				return topicnetGraph.createRelationship(fromId, toId, relationshipType, {});
			})
			.then(function() {
				return { score: 0 };
			});
		},

		unlinkTopic: function(fromId, toId, relationshipType) {
			if(!_.include(validRelationships, relationshipType)) {
				return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
			}
			return topicnetGraph.getRelationship(fromId, toId, relationshipType)
			.then(function(rel) {
				if (rel === undefined) {
					return Q.reject({name: 'notfound'});
				} else {
					return topicnetGraph.deleteRelationship(rel.id);
				}
			});
		},

		linkResource: function(topicId, resId) {
			return topicnetGraph.getRelationship(topicId, resId, 'resources')
			.then(function(rel) {
				if(rel !== undefined) {
					return Q.reject({name: 'duplicate', message: 'Relationship to resource already exists between ' + topicId + ' and ' + resId});
				}
			})
			.then(function() {
				return topicnetGraph.createRelationship(topicId, resId, 'resources', {});
			})
			.then(function() {
				return { score: 0 };
			});
		},

		unlinkResource: function(topicId, resId) {
			return topicnetGraph.getRelationship(topicId, resId, 'resources')
			.then(function(rel) {
				if (rel === undefined) {
					return Q.reject({name: 'notfound'});
				} else {
					return topicnetGraph.deleteRelationship(rel.id);
				}
			});
		}
	};
};
