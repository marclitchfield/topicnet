var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph) {

	var validRelationships = ['sub', 'next', 'root'];
	var DEFAULT_RESULTS_PER_PAGE = 10;

	function updateTopicIndex(node, topic) {
		return graph.updateIndex(node, 'topics_name', 'name', topic.name);
	}

	function findTopicByName(name) {
		var query = helper.escapeLuceneSpecialChars(name.toLowerCase());
		return graph.queryNodeIndex('topics_name', 'name:' + query);
	}

	function checkForDuplicateNew(updatedValues) {
		var deferred = Q.defer();

		return findTopicByName(updatedValues.name)
		.then(function(results) {
			if(results.length > 0)
				return Q.reject({ name: 'duplicate', message: 'A topic with the specified name already exists' });
		});
	}

	function checkForDuplicateUpdate(updatedValues, topicId) {
		
		return findTopicByName(updatedValues.name)
		.then(function(results) {
			var resultsOtherThanThis = _.reject(results, function(t) {
				return t.id === topicId;
			});

			if(resultsOtherThanThis.length > 0)
				return Q.reject({ name: 'duplicate', message: 'Another topic exists with the specified name' });
		});
	}

	function queryRelationship(fromId, toId, relationship) {
		var cypherQuery = 'START from=node(' + fromId +	'), to=node(' + toId + ') ' +
			'MATCH from-[r:' + relationship + ']->to RETURN r';

		return graph.queryGraph(cypherQuery);
	}

	return {

		get: function(id) {
			var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') MATCH n-[r?]->c RETURN n,r,c';

			return graph.queryGraph(cypherQuery)
			.then(function(results) {
				
				if (results === undefined) {
					return Q.reject({name: 'notfound', message: 'topic with id ' + id + ' not found'});
				} else {
					return helper.makeTopics(results)[0];
				}
			});
		},

		/*
		* query is an object like { q: 'search string', p: '1', pp: '5' }
		*   q: the search string
		*   p: page number (defaults to 1)
		*   pp: results per page (defaults to DEFAULT_RESULTS_PER_PAGE)
		*/
		search: function(query) {

			var page = 1;
			var per_page = DEFAULT_RESULTS_PER_PAGE;

			var search_string = query.q || '';
			if(query.p !== undefined) {
				page = parseInt(query.p, 10);
				if(page < 1)
					page = 1;
			}
			if(query.pp !== undefined) {
				per_page = parseInt(query.pp, 10);
				if(per_page < 1)
					per_page = DEFAULT_RESULTS_PER_PAGE;
			}

			search_string = helper.escapeLuceneSpecialChars(search_string);
			var cypherQuery = 'START n=node:topics_name({query}) RETURN n ' +
				'SKIP {s} LIMIT {l}';

			var params = {
				query: 'name:*' + search_string.toLowerCase() + '*',
				s: (page - 1) * per_page,
				l: per_page
			};

			return graph.queryGraph(cypherQuery, params)
			.then(function(results) {
				return helper.makeTopics(results);
			})
			.fail(function(error) {
				
				if (helper.isMissingIndexError(error)) {
					return [];
				}
				throw error;
			});
		},

		getRelated: function(fromid, relationship) {
			if (!_.include(validRelationships, relationship)) {
				fail('invalid relationship. must be one of: ' + validRelationships.join(', '));
				return;
			}

			var cypherQuery = 'START origin=node(' + parseInt(fromid, 10) + ') ' +
				'MATCH origin-[:' + relationship + ']->n RETURN n';

			return graph.queryGraph(cypherQuery)
			.then(function(results) {
				return helper.makeTopics(results);
			});
		},

		create: function(topic) {

			if (!topic.hasOwnProperty('name') || !topic.name) {
				return Q.reject('name is required');
			}
	
			return checkForDuplicateNew(topic)
			.then(function() {
				var node = graph.createNode(topic);
				
				return graph.saveNode(node)
				.then(function() {
					return updateTopicIndex(node, topic);
				})
				.then(function() {
					return helper.makeNode(node._data);
				});
			});
		},

		update: function(id, topic) {

			if (!topic.hasOwnProperty('name') || !topic.name) {
				return Q.reject('name is required');
			}

			return checkForDuplicateUpdate(topic, id)
			.then(function() {
				return graph.getNodeById(id);
			})
			.then(function(node) {
				node.data.name = topic.name;
				
				return graph.saveNode(node)
				.then(function() {
					return updateTopicIndex(node, topic);
				})
				.then(function() {
					return helper.makeNode(node._data);
				});
			});

		},

		createRelationship: function(fromid, toid, relationship) {
			if (!_.include(validRelationships, relationship)) {
				return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
			}

			return graph.getNodeById(fromid)
			.then(function(fromNode) {
				
				return graph.getNodeById(toid)
				.then(function(toNode) {

					return queryRelationship(fromid, toid, relationship)
					.then(function(results) {

						if(results && results.length > 0) {
							return Q.reject({name: 'duplicate', message: 'Relationship \'' + relationship + '\' already exists between ' + fromid + ' and ' + toid});
						}
					})
					.then(function() {
						return graph.createRelationshipBetween(fromNode, toNode, relationship, {});
					});
				});
			});

		},

		getRelationship: function(fromId, toId, relationship) {
			return queryRelationship(fromId, toId, relationship)
			.then(function(results) {
				if(results === undefined) {
					return Q.reject({name: 'notfound', message: 'Relationship \'' + relationship + '\' was not found between ' + fromId + ' and ' + toId});
				} else {
					var rel = helper.makeNode(results[0].r._data);
					rel.fromId = parseInt(fromId, 10);
					rel.toId = parseInt(toId, 10);
					rel.relationshipType = relationship;
					rel.upVotes = rel.upVotes || 0;
					rel.downVotes = rel.downVotes || 0;
					rel.score = rel.score || 0;
					return rel;
				}
			});
		},

		deleteRelationship: function(fromid, toid, relationship) {
			if(!_.include(validRelationships, relationship)) {
				return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
			}

			return queryRelationship(fromid, toid, relationship)
			.then(function(results) {

				if (results === undefined) {
					return Q.reject({name: 'notfound'});
				} else {
					rel = results[0].r;
					return graph.deleteRelationship(rel);
				}
			});
		},

		linkResource: function(id, resid) {

			return graph.getNodeById(id)
			.then(function(fromNode) {

				return graph.getNodeById(resid)
				.then(function(toNode) {

					return queryRelationship(id, resid, 'resources')
					.then(function(results) {

						if (results.length > 0) {
							return Q.reject({name: 'duplicate', message: 'Link to resource already exists'});
						}

						return graph.createRelationshipBetween(fromNode, toNode, 'resources', {});
					});
				});
			});
		},

		unlinkResource: function(id, resid) {

			return queryRelationship(id, resid, 'resources')
			.then(function(results) {

				if (results === undefined) {
					return Q.reject({name: 'notfound'});
				} else {
					var rel = results[0].r;
					return graph.deleteRelationship(rel);
				}
			});

		},

		deleteTopic: function(id) {
			var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') return n';
			return graph.queryGraph(cypherQuery)
			.then(function(results) {

				if(results === undefined) {
					return Q.reject({name: 'notfound'});
				} else {
					var topic = results[0].n;
					return graph.deleteNode(topic);
				}
			});
		}

	};
};
