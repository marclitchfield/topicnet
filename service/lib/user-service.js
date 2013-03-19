var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph) {

	function updateUserEmailIndex(node, email) {
		return graph.updateIndex(node, 'user_email', 'email', email);
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
			var node = graph.createNode({ email: email, password: password });
			return graph.saveNode(node)
			.then(function() { 
				return updateUserEmailIndex(node, email);
			}); 
		},

		get: function(id) {
			return graph.getNodeById(id)
			.then(function(user) {
				return helper.makeNode(user._data);
			})
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
