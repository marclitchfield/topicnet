var Q = require('q');
var _ = require('underscore');

exports.create = function() {

	var relationships = {};
	var id = 1;

	return {

		createRelationship: function(fromId, toId, relationshipType, data) {
			var relationship = { id: id++ };
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
