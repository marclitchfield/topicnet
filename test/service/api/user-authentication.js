var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');
var crypto = require('crypto');
require('../test-utils');

function getUniqueEmail() {
	return guid.raw() + '@' + guid.raw() + '.com';
}

function getHashedPassword() {
	sha256 = crypto.createHash('sha256');
	sha256.update(guid.raw());
	return sha256.digest('hex');
}

describe('User Authentication', function() {

	describe('POST to /user with valid email and hashed password', function() {
		var postResult;

		before(function() {
			return api.post('/user', { email: getUniqueEmail(), password: getHashedPassword() })
			.then(function(res) {
				postResult = res;
			});
		});

		it('returns status 200', function() {
			assert.equal(200, postResult.statusCode);
		});

		it('returns the user data, minus the password', function() {
			var user = JSON.parse(postResult.body);
			assert.ok(user.id && user.id > 0);
			assert.ok(user.email && user.email.length > 0);
		});
	});

	describe('POST to /login with valid credentials', function() {

		var email = getUniqueEmail();
		var password = getHashedPassword();
		var loginResponse;

		before(function() {
			return api.post('/user', { email: email, password: password })
			.then(function(res) {
				return api.post('/login', { email: email, password: password });
			})
			.then(function(res) {
				loginResponse = res;
			});
		});

		it('returns status 200', function() {
			assert.equal(loginResponse.statusCode, 200);
		});

		it('user is authenticated', function() {
			return api.get('/user').then(function(res) {
				assert.equal(200, res.statusCode);
				var user = api.parseBody(res.body);
				assert.equal(email, user.email);
			});
		});

		describe('then POST to /logout', function() {
			before(function() {
				return api.post('/logout');
			});

			it('user is not authenticated', function() {
				return api.get('/user').then(function(res) {
					assert.equal(204, res.statusCode);
					assert.equal('', res.body);
				});
			});
		});

	});

});
