var Q = require('q');
var helper = require('../../service-helper');
var _ = require('underscore');

exports.create = function(neo4jGraph) {

	return {

		create: function(userData) {
			return neo4jGraph.createNode(userData)
			.then(function(user) {
				return neo4jGraph.updateIndex(user.id, 'user_email', 'email', user.email)
				.then(function() {
					return user;
				});
			});
		},

		get: function(id) {
			return neo4jGraph.readNode(id)
			.fail(function(err) {
				if (err.name === 'notfound') {
					return Q.resolve(undefined);
				}
				throw err;
			});
		},

		getByEmail: function(email) {
			var query = helper.escapeLuceneSpecialChars(email.toLowerCase());
			return neo4jGraph.queryNodeIndex('user_email', 'email:' + query)
			.then(function(results) {
				return results.length === 0 ? undefined : results[0];
			});
		}

	};
};