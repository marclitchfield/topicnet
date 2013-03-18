var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph) {

	function updateUsernameIndex(node, username) {
		return graph.updateIndex(node, 'user_username', 'username', username);
	}

	function findUserByUsername(username) {
		var query = helper.escapeLuceneSpecialChars(username.toLowerCase());
		return graph.queryNodeIndex('user_username', 'username:' + query)
		.then(function(results) {
			return results[0];
		});
	}


	return {

		create: function(username, password) {
			var node = graph.createNode({ username: username, password: password });
			return graph.saveNode(node)
			.then(function() { 
				return updateUsernameIndex(node, username);
			});
		},

		get: function(id) {
			return graph.getNodeById(id)
			.then(function(user) {
				return helper.makeNode(user._data);
			})
			.then(function(user) {
				if (user.username) {
					return user;
				} else {
					return Q.reject();
				}
			});
		},

		verify: function(username, password) {
			return findUserByUsername(username)
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
