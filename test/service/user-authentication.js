var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');

describe('User Authentication', function() {

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

		var username = guid.raw();
		var password = guid.raw();
		var loginResponse;

		before(function(done) {
			api.post('/user', { username: username, password: password })
			.then(function(res) {
				return api.post('/login', { username: username, password: password });
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
				assert.equal(username, user.username);
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
