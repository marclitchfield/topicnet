var Q = require('q');
var _ = require('underscore');

exports.create = function() {

	var links = {};
	var id = 0;

	return {

		getLinkedResource: function(topicId, resourceId) {
			var link = links[topicId + '->' + resourceId];
			return Q.resolve(link);
		},

		linkResource: function(topicId, resourceId) {
			links[topicId + '->' + resourceId] = { id: id++ };
		}

	};

};
