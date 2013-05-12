var Q = require('q');
var _ = require('underscore');

exports.create = function() {

	var topics = {};
	var relationships = {};
	var id = 1;

	return {

		createTopic: function(topicData) {
			var topic = { id: id++ };
			_.extend(topic, topicData);
			topics[topic.id] = topic;
			return Q.resolve(topic);
		},

		updateTopic: function(id, topicData) {
			if (!(id in topics)) {
				return Q.reject({ name: 'notfound' });
			}
			topicData.id = id;
			topics[id] = topicData;
			return Q.resolve(topics[id]);
		},

		getTopic: function(id) {
			return Q.resolve(topics[id]);
		},

		getTopicByName: function(name) {
			var found = _.find(topics, function(t) { return t.name === name.toLowerCase(); });
			return Q.resolve(found);
		},

		getRelatedTopics: function(fromId, relationshipType) {
			if (!(fromId in topics)) {
				return Q.reject({ name: 'notfound' });
			}
			var keys = _.filter(_.keys(relationships), function(r) { return r.indexOf(relationshipType + ':' + fromId) === 0; });
			var related = _.map(keys, function(k) { return topics[relationships[k].toId]; });
			return Q.resolve(related);
		},

		searchTopicsByName: function(searchString, page, perPage) {
			return Q.resolve(_.filter(topics, function(t) {
				return t.name.indexOf(searchString) > -1;
			}));
		},

		deleteTopic: function(id) {
			if (!(id in topics)) {
				return Q.reject({ name: 'notfound' });
			}
			delete topics[id];
			return Q.resolve();
		},

		createRelationship: function(fromId, toId, relationshipType, data) {
			var relationship = { id: id++, fromId: fromId, toId: toId };
			_.extend(relationship, data || {});
			relationships[relationshipType + ':' + fromId + '->' + toId] = relationship;
			return Q.resolve(relationship);
		},

		getRelationship: function(fromId, toId, relationshipType) {
			return Q.resolve(relationships[relationshipType + ':' + fromId + '->' + toId]);
		},

		deleteRelationship: function(relationshipId) {
			var k = _.find(_.keys(relationships), function(r) { return relationships[r].id === relationshipId; });
			delete relationships[k];
			return Q.resolve();
		}

	};

};
