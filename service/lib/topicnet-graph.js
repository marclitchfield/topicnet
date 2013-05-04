var Q = require('q');

exports.create = function(graph) {

	return {

		getResourceRelationship: function(topicId, resourceId) {
			graph.queryRelationship(topicId, resourceId, 'resources')
			.then(function(results) {
				return results.length === 0 ? undefined : results[0];
			});
		},

		linkResource: function(topicId, resourceId) {
			return graph.createRelationshipBetween(topicId, resourceId, 'resources', {});
		}

	};

};
