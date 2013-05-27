var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.create = function(graph) {

	var validRelationships = ['sub', 'next', 'root'];
	var DEFAULT_RESULTS_PER_PAGE = 10;

	function linkTopic(fromId, toId, relationshipType) {
		if (!_.include(validRelationships, relationshipType)) {
			return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
		}

		return graph.relationships.get(fromId, toId, relationshipType)
		.then(function(rel) {
			if(rel !== undefined) {
				return Q.reject({name: 'duplicate', message: 'Relationship \'' +
					relationshipType + '\' already exists between ' + fromId + ' and ' + toId});
			}
		})
		.then(function() {
			console.log('about to create the root relationship');
			return graph.relationships.create(fromId, toId, relationshipType, {});
		})
		.then(function() {
			console.log('created the root relationship, returning it');
			return { score: 0 };
		});
	}

	function unlinkTopic(fromId, toId, relationshipType) {
		if(!_.include(validRelationships, relationshipType)) {
			return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
		}
		return graph.relationships.get(fromId, toId, relationshipType)
		.then(function(rel) {
			if (rel === undefined) {
				return Q.reject({name: 'notfound'});
			} else {
				return graph.relationships.destroy(rel.id);
			}
		});
	}

	return {

		get: function(id) {
			return graph.topics.get(id)
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

			return graph.topics.searchByName(searchString, page, perPage);
		},

		getLinkedTopics: function(fromId, relationshipType) {
			if (!_.include(validRelationships, relationshipType)) {
				return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
			}

			return graph.topics.getRelated(fromId, relationshipType);
		},

		create: function(topicData) {
			if (!topicData.hasOwnProperty('name') || !topicData.name) {
				return Q.reject('name is required');
			}

			return graph.topics.getByName(topicData.name)
			.then(function(existing) {
				if(existing !== undefined) {
					return Q.reject({ name: 'duplicate', message: 'A topic with the specified name already exists' });
				}
			})
			.then(function() {
				return graph.topics.create(topicData);
			});
		},

		update: function(id, topicData) {
			if (!topicData.hasOwnProperty('name') || !topicData.name) {
				return Q.reject('name is required');
			}

			return graph.topics.getByName(topicData.name)
			.then(function(existing) {
				if(existing !== undefined && existing.id !== id) {
					return Q.reject({ name: 'duplicate', message: 'Another topic exists with the specified name' });
				}
			})
			.then(function() {
				return graph.topics.update(id, topicData);
			});
		},

		destroy: function(id) {
			return graph.topics.destroy(id);
		},

		getLink: function(fromId, toId, relationshipType) {
			return graph.relationships.get(fromId, toId, relationshipType)
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

		linkTopic: linkTopic,

		linkRoot: function(topicId) {
			console.log('in linkRoot');
			return linkTopic(0, topicId, 'root');
		},

		unlinkTopic: unlinkTopic,

		unlinkRoot: function(topicId) {
			return unlinkTopic(0, topicId, 'root');
		},

		linkResource: function(topicId, resId) {
			return graph.relationships.get(topicId, resId, 'resources')
			.then(function(rel) {
				if(rel !== undefined) {
					return Q.reject({name: 'duplicate',
						message: 'Relationship to resource already exists between ' + topicId + ' and ' + resId});
				}
			})
			.then(function() {
				return graph.relationships.create(topicId, resId, 'resources', {});
			})
			.then(function() {
				return { score: 0 };
			});
		},

		unlinkResource: function(topicId, resId) {
			return graph.relationships.get(topicId, resId, 'resources')
			.then(function(rel) {
				if (rel === undefined) {
					return Q.reject({name: 'notfound'});
				} else {
					return graph.relationships.destroy(rel.id);
				}
			});
		},

		hideResource: function(topicId, resId, userId) {
			return graph.relationships.get(userId, topicId, 'opinion')
			.then(function(existingOpinion) {
				var opinion;
				if (existingOpinion === undefined) {
					opinion = { hidden: { resources: [resId] }};
					return graph.relationships.create(userId, topicId, 'opinion', opinion);
				} else {
					opinion = { hidden: { resources: [] } };
					_.extend(opinion, existingOpinion);

					if (_.contains(opinion.hidden.resources, resId)) {
						return Q.reject({ name: 'duplicate', message: 'resource has already been hidden'});
					}

					opinion.hidden.resources.push(resId);
					return graph.relationships.update(userId, topicId, 'opinion', opinion);
				}
			});
		}
	};
};
