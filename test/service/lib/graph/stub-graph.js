var Q = require('q');
var _ = require('underscore');

exports.create = function() {

	var topics = { '0': { name: 'root' } };
	var resources = {};
	var relationships = {};
	var users = {};
	var id = 1;

	function getRelationships(fromId, toId, relationshipType) {
		if (!(fromId in topics) && !(fromId in resources) && !(fromId in users)) {
			return Q.reject({ name: 'notfound' });
		}
		if (!(toId in topics) && !(toId in resources) && !(toId in users)) {
			return Q.reject({ name: 'notfound' });
		}
		var rels = _.filter(relationships, function(r) {
			return r.fromId === fromId && r.toId === toId &&
				r.relationshipType === relationshipType;
		});
		return Q.resolve(rels);
	}

	return {

		topics: {

			create: function(topicData) {
				var topic = { id: id++ };
				_.extend(topic, topicData);
				topics[topic.id] = topic;
				return Q.resolve(topic);
			},

			update: function(id, topicData) {
				if (!(id in topics)) {
					return Q.reject({ name: 'notfound' });
				}
				topicData.id = id;
				topics[id] = topicData;
				return Q.resolve(topics[id]);
			},

			get: function(id) {
				return Q.resolve(topics[id]);
			},

			getByName: function(name) {
				var found = _.find(topics, function(t) { return t.name === name.toLowerCase(); });
				return Q.resolve(found);
			},

			getRelated: function(fromId, relationshipType) {
				if (!(fromId in topics)) {
					return Q.reject({ name: 'notfound' });
				}
				var rels = _.filter(relationships, function(r) {
					return r.fromId === fromId && r.relationshipType === relationshipType;
				});
				var relatedTopics = _.map(rels, function(r) {
					return topics[r.toId];
				});
				return Q.resolve(relatedTopics);
			},

			searchByName: function(searchString, page, perPage) {
				return Q.resolve(_.filter(topics, function(t) {
					return t.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
				}));
			},

			destroy: function(id) {
				if (!(id in topics)) {
					return Q.reject({ name: 'notfound' });
				}
				delete topics[id];
				return Q.resolve();
			}
		},

		relationships: {

			create: function(fromId, toId, relationshipType, data) {
				var relationship = { id: id++, fromId: fromId, toId: toId,
					relationshipType: relationshipType };
				_.extend(relationship, data || {});
				relationships[relationship.id] = relationship;
				return Q.resolve(relationship);
			},

			//update: function(fromId, toId, relationshipType, data) {
				//var key = relationshipType + ':' + fromId + '->' + toId;
				//if (!(key in relationships)) {
					//return Q.reject({ name: 'notfound' });
				//}
				//_.extend(relationships[key], data || {});
				//return Q.resolve(relationships[key]);
			//},

			get: function(fromId, toId, relationshipType) {
				return getRelationships(fromId, toId, relationshipType)
				.then(function(results) {
					return results.length === 0 ? undefined : results[0];
				});
			},

			getMany: getRelationships,

			exists: function(toId, relationshipTypes) {
				var exists = _.some(relationships, function(r) {
					return r.toId === toId && _.contains(relationshipTypes, r.relationshipType);
				});
				return Q.resolve(exists);
			},

			destroy: function(relationshipId) {
				delete relationships[relationshipId];
				return Q.resolve();
			}
		},

		resources: {

			create: function(resourceData) {
				var resource = { id: id++ };
				_.extend(resource, resourceData);
				resources[resource.id] = resource;
				return Q.resolve(resource);
			},

			update: function(id, resourceData) {
				if (!(id in resources)) {
					return Q.reject({ name: 'notfound' });
				}
				resourceData.id = id;
				resources[id] = resourceData;
				return Q.resolve(resources[id]);
			},

			get: function(id) {
				return Q.resolve(resources[id]);
			},

			getByAttribute: function(attributeName, attributeValue) {
				var found = _.find(resources, function(r) { return r[attributeName].toLowerCase() === attributeValue.toLowerCase(); });
				return Q.resolve(found);
			},

			searchByTitle: function(searchString, page, perPage) {
				return Q.resolve(_.filter(resources, function(r) {
					return r.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
				}));
			},

			destroy: function(id) {
				if (!(id in resources)) {
					return Q.reject({ name: 'notfound' });
				}
				delete resources[id];
				return Q.resolve();
			}
		},

		users: {
			create: function(userData) {
				var user = { id: id++ };
				_.extend(user, userData);
				users[user.id] = user;
				return Q.resolve(user);
			},

			get: function(id) {
				return Q.resolve(users[id]);
			},

			getByEmail: function(email) {
				var found = _.find(users, function(u) { return u.email === email.toLowerCase(); });
				return Q.resolve(found);
			}
		}
	};
};
