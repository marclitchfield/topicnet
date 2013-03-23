var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');
var sha256 = require('crypto').createHash('sha256');

describe('User Authentication', function() {

	describe('POST to /user with valid email and hashed password', function() {
		var email = guid.raw();
		var hashedPassword = sha256.digest('secret');
		var postResult;

		before(function(done) {
			api.post('/user', { email: email, password: hashedPassword })
			.then(function(res) {
				postResult = res;
				done();
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

	describe('POST to /user with duplicate email', function() {
		var email = guid.raw();

		before(function(done) {
			api.post('/user', { email: email, password: guid.raw() })
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 400 duplicate', function(done) {
			api.post('/user', { email: email, password: guid.raw() })
			.then(function(res) {
				assert.equal(400, res.statusCode);
				done();
			})
			.done();
		});
	});

	describe('POST to /login with invalid credentials', function() {
		it('returns status 401 unauthorized', function(done) {
			api.post('/login', { email: guid.raw(), password: 'incorrect' })
			.then(function(res) {
				assert.equal(401, res.statusCode);
				done();
			})
			.done();
		});

		it('user is not authenticated', function(done) {
			api.get('/user').then(function(res) {
				assert.equal(204, res.statusCode);
				assert.equal(null, res.body);
				done();
			})
			.done();
		});
	});

	describe('POST to /login with valid credentials', function() {

		var email = guid.raw();
		var password = guid.raw();
		var loginResponse;

		before(function(done) {
			api.post('/user', { email: email, password: password })
			.then(function(res) {
				return api.post('/login', { email: email, password: password });
			})
			.then(function(res) {
				loginResponse = res;
				done();
			});
		});

		it('returns status 200', function() {
			assert.equal(loginResponse.statusCode, 200);
		});

		it('user is authenticated', function(done) {
			api.get('/user').then(function(res) {
				assert.equal(200, res.statusCode);
				var user = api.parseBody(res.body);
				assert.equal(email, user.email);
				done();
			})
			.done();				
		});


		describe('then POST to /logout', function() {
			before(function(done) {
				api.post('/logout').then(function(res) {
					done();
				})
			});

			it('user is not authenticated', function(done) {
				api.get('/user').then(function(res) {
					assert.equal(204, res.statusCode);
					assert.equal(null, res.body);
					done();
				})
				.done();	
			})
		});

	});

});
