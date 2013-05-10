var Q = require('q');

exports.create = function(graph) {

	return {

		createTopic: function(topicData) {
			return graph.createNode(topicData)
			.then(function(createdTopic) {
				return graph.updateIndex(createdTopic.id, 'topics_name', 'name', topicData.name);
			})
			.then(function() {
				return createdTopic;
			});
		},

		getTopic: function(id) {
			return null;
		},

		topicExistsWithName: function(name) {
			var query = helper.escapeLuceneSpecialChars(name.toLowerCase());
			return graph.queryNodeIndex('topics_name', 'name:' + query)
			.then(function(results) {
				return results.length > 0;
			});
		},

		createRelationship: function(fromId, toId, relationshipType) {
			return graph.createRelationshipBetween(fromId, toId, relationshipType);
		},

		getRelationship: function(fromId, toId, relationshipType) {
			return graph.queryRelationship(fromId, toId, relationshipType)
			.then(function(results) {
				return results.length === 0 ? undefined : results[0].r;
			});
		},

		deleteRelationship: function(relationshipId) {
			return graph.deleteRelationship(relationshipId);
		}

	};

};
