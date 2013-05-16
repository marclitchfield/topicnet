var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(topicnetGraph) {

	var validRelationships = ['sub', 'next', 'root'];
	var DEFAULT_RESULTS_PER_PAGE = 10;


	return {

		get: function(id) {
			return topicnetGraph.topics.get(id)
			.then(function(topic) {
				if (topic === undefined) {
					return Q.reject({name: 'notfound', message: 'topic with id ' + id + ' not found'});
				} else {
					return topic;
				}
			});
		},

		search: function(params) {
			var searchString = params.q || '';
			var page = helper.parsePositiveInt(params.p) || 1;
			var perPage = helper.parsePositiveInt(params.pp) || DEFAULT_RESULTS_PER_PAGE;

			return topicnetGraph.topics.searchByName(searchString, page, perPage);
		},

		getLinkedTopics: function(fromId, relationshipType) {
			if (!_.include(validRelationships, relationshipType)) {
				return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
			}

			return topicnetGraph.topics.getRelated(fromId, relationshipType);
		},

		create: function(topicData) {
			if (!topicData.hasOwnProperty('name') || !topicData.name) {
				return Q.reject('name is required');
			}

			return topicnetGraph.topics.getByName(topicData.name)
			.then(function(existing) {
				if(existing !== undefined) {
					return Q.reject({ name: 'duplicate', message: 'A topic with the specified name already exists' });
				}
			})
			.then(function() {
				return topicnetGraph.topics.create(topicData);
			});
		},

		update: function(id, topicData) {
			if (!topicData.hasOwnProperty('name') || !topicData.name) {
				return Q.reject('name is required');
			}

			return topicnetGraph.topics.getByName(topicData.name)
			.then(function(existing) {
				if(existing !== undefined && existing.id !== id) {
					return Q.reject({ name: 'duplicate', message: 'Another topic exists with the specified name' });
				}
			})
			.then(function() {
				return topicnetGraph.topics.update(id, topicData);
			});
		},

		deleteTopic: function(id) {
			return topicnetGraph.topics.destroy(id);
		},

		getLink: function(fromId, toId, relationshipType) {
			return topicnetGraph.relationships.get(fromId, toId, relationshipType)
			.then(function(link) {
				if(link === undefined) {
					return Q.reject({name: 'notfound', message: 'Relationship \'' + relationshipType + '\' was not found between ' + fromId + ' and ' + toId});
				} else {
					link.fromId = parseInt(fromId, 10);
					link.toId = parseInt(toId, 10);
					link.relationshipType = relationshipType;
					link.upVotes = link.upVotes || 0;
					link.downVotes = link.downVotes || 0;
					link.score = link.score || 0;
					return link;
				}
			});
		},

		linkTopic: function(fromId, toId, relationshipType) {
			if (!_.include(validRelationships, relationshipType)) {
				return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
			}

			return topicnetGraph.relationships.get(fromId, toId, relationshipType)
			.then(function(rel) {
				if(rel !== undefined) {
					return Q.reject({name: 'duplicate', message: 'Relationship \'' + relationshipType + '\' already exists between ' + fromId + ' and ' + toId});
				}
			})
			.then(function() {
				return topicnetGraph.relationships.create(fromId, toId, relationshipType, {});
			})
			.then(function() {
				return { score: 0 };
			});
		},

		unlinkTopic: function(fromId, toId, relationshipType) {
			if(!_.include(validRelationships, relationshipType)) {
				return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
			}
			return topicnetGraph.relationships.get(fromId, toId, relationshipType)
			.then(function(rel) {
				if (rel === undefined) {
					return Q.reject({name: 'notfound'});
				} else {
					return topicnetGraph.relationships.destroy(rel.id);
				}
			});
		},

		linkResource: function(topicId, resId) {
			return topicnetGraph.relationships.get(topicId, resId, 'resources')
			.then(function(rel) {
				if(rel !== undefined) {
					return Q.reject({name: 'duplicate', message: 'Relationship to resource already exists between ' + topicId + ' and ' + resId});
				}
			})
			.then(function() {
				return topicnetGraph.relationships.create(topicId, resId, 'resources', {});
			})
			.then(function() {
				return { score: 0 };
			});
		},

		unlinkResource: function(topicId, resId) {
			return topicnetGraph.relationships.get(topicId, resId, 'resources')
			.then(function(rel) {
				if (rel === undefined) {
					return Q.reject({name: 'notfound'});
				} else {
					return topicnetGraph.relationships.destroy(rel.id);
				}
			});
		}
	};
};
