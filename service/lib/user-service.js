var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph) {

	function updateUserEmailIndex(nodeId, email) {
		return graph.updateIndex(nodeId, 'user_email', 'email', email);
	}

	function findUserByEmail(email) {
		var query = helper.escapeLuceneSpecialChars(email.toLowerCase());
		return graph.queryNodeIndex('user_email', 'email:' + query)
		.then(function(results) {
			return results[0];
		});
	}

	return {

		create: function(email, password) {
			return findUserByEmail(email)
			.then(function(user) {
				if (user) {
					return Q.reject({ name: 'duplicate', message: 'Email address already taken' });
				}

				return graph.createNode({ email: email, password: password })
				.then(function(user) { 
					return updateUserEmailIndex(user.id, email);
				});
			});
		},

		get: function(id) {
			return graph.readNode(id)
			.then(function(user) {
				if (user.email) {
					return user;
				} else {
					return Q.reject();
				}
			});
		},

		verify: function(email, password) {
			return findUserByEmail(email)
			.then(function(user) {
				if (user.password === password) {
					delete user.password;
					return user;
				} else {
					return Q.reject();
				}
			});
		}

	};

};
