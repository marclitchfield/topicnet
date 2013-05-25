var Q = require('q');
var _ = require('underscore');

exports.create = function() {

	var topics = {};
	var resources = {};
	var relationships = {};
	var users = {};
	var id = 1;

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
				var keys = _.filter(_.keys(relationships), function(r) { return r.indexOf(relationshipType + ':' + fromId) === 0; });
				var related = _.map(keys, function(k) { return topics[relationships[k].toId]; });
				return Q.resolve(related);
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
				var relationship = { id: id++, fromId: fromId, toId: toId };
				_.extend(relationship, data || {});
				relationships[relationshipType + ':' + fromId + '->' + toId] = relationship;
				return Q.resolve(relationship);
			},

			get: function(fromId, toId, relationshipType) {
				return Q.resolve(relationships[relationshipType + ':' + fromId + '->' + toId]);
			},

			exists: function(toId, relationshipTypes) {
				return Q.resolve(_.some(_.keys(relationships), function(r) {
					return _.some(relationshipTypes, function(t) {
						return r.indexOf(t + ':') === 0 && relationships[r].toId === toId;
					});
				}));
			},

			destroy: function(relationshipId) {
				var k = _.find(_.keys(relationships), function(r) { return relationships[r].id === relationshipId; });
				delete relationships[k];
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
