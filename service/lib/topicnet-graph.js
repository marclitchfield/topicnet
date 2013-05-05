var Q = require('q');

exports.create = function(graph) {

	return {

		getLinkedResource: function(topicId, resourceId) {
			return graph.queryRelationship(topicId, resourceId, 'resources')
			.then(function(results) {
				return results.length === 0 ? undefined : results[0];
			});
		},

		linkResource: function(topicId, resourceId) {
			return graph.createRelationshipBetween(topicId, resourceId, 'resources', {});
		},

		unlinkResource: function(topicId, resourceId) {
			return graph.queryRelationship(topicId, resourceId, 'resources')
			.then(function(results) {
				if (results.length < 1) {
					return Q.reject({name: 'notfound'});
				} else {
					var rel = results[0].r;
					return graph.deleteRelationship(rel.id);
				}
			});
		}

	};

};
