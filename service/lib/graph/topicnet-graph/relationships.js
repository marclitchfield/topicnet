var Q = require('q');
var _ = require('underscore');

exports.create = function(neo4jGraph) {

	function getMany(fromId, toId, relationshipType) {
		var cypherQuery = 'START from=node(' + fromId +	'), to=node(' + toId + ') ' +
			'MATCH from-[r:' + relationshipType + ']->to RETURN r';

		return neo4jGraph.readNode(fromId)
		.then(function() {
			return neo4jGraph.readNode(toId);
		})
		.then(function() {
			return neo4jGraph.queryGraph(cypherQuery);
		})
		.then(function(results) {
			return _.map(results, function(result) {
				return result.r;
			});
		});
	}

	return {
		create: function(fromId, toId, relationshipType, data) {
			return neo4jGraph.createRelationshipBetween(fromId, toId, relationshipType, data);
		},

		update: function(fromId, toId, relationshipType, data) {
		},

		get: function(fromId, toId, relationshipType) {
			return getMany()
			.then(function(results) {
				return results.length === 0 ? undefined : results[0];
			});
		},

		getMany: getMany,

		exists: function(nodeId, relationshipTypes) {
			return neo4jGraph.hasRelationships(nodeId, relationshipTypes);
		},

		destroy: function(relationshipId) {
			return neo4jGraph.deleteRelationship(relationshipId);
		}
	};

};
