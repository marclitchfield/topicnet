var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.create = function(graph) {

	function passwordIsHashed(password) {
		var sha256 = /[a-f0-9]{64}/;
		return sha256.test(password);
	}

	return {

		create: function(email, password) {

			if(!passwordIsHashed(password)) {
				return Q.reject({ name: 'badrequest', message: 'Invalid password' });
			}

			return graph.users.getByEmail(email)
			.then(function(user) {
				if (user) {
					return Q.reject({ name: 'duplicate', message: 'Email address already taken' });
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
					return Q.reject();
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
					return Q.reject('Invalid credentials');
				}
			});
		}

	};

};
