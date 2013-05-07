var Q = require('q');

exports.create = function(graph) {

	return {

		createRelationship: function(fromId, toId, relationshipType) {
			return graph.createRelationshipBetween(fromId, toId, relationshipType, {});
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
