var _ = require('underscore');
var Q = require('q');
var error = require('../error');

exports.create = function(graph) {

	function passwordIsHashed(password) {
		var sha256 = /[a-f0-9]{64}/;
		return sha256.test(password);
	}

	return {

		create: function(email, password) {

			if(!passwordIsHashed(password)) {
				return error.promise({ name: 'badrequest', message: 'Invalid password' });
			}

			return graph.users.getByEmail(email)
			.then(function(user) {
				if (user) {
					return error.promise({ name: 'duplicate', message: 'Email address already taken' });
				}

				return graph.users.create({ email: email, password: password })
				.then(function(user) {
					delete user.password;
					return user;
				});
			});
		},

		get: function(id) {
			return graph.readNode(id)
			.then(function(user) {
				if (user.email) {
					delete user.password;
					return user;
				} else {
					return error.promise({name: 'notfound'});
				}
			});
		},

		verify: function(email, password) {
			return graph.users.getByEmail(email)
			.then(function(user) {
				if (user.password === password) {
					delete user.password;
					return user;
				} else {
					return error.promise('Invalid credentials');
				}
			});
		}

	};

};
