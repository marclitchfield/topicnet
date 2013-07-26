var assert = require('assert');
var Q = require('q');
var userService = require('../../../service/lib/user-service');
var StubGraph = require('./graph/stub-graph');
var neo4jGraph = require('../../../service/lib/graph/neo4j-graph');
var RealGraph = require('../../../service/lib/graph/topicnet-graph');
var guid = require('guid');
require('../test-utils');

describe('User Service', function() {

	var service;

	function runUserServiceTests(graph) {

		beforeEach(function() {
			service = userService.create(graph);
		});

		describe('when user exists', function() {

			var user;

			beforeEach(function() {
				return graph.users.create({ email: guid.raw(), password: '0000000000000000000000000000000000000000000000000000000000000000' })
				.then(function(createdUser) {
					user = createdUser;
				});
			});

			describe('create', function() {
				it('should return a duplicate error given a duplicate email ', function() {
					return service.create(user.email, user.password)
					.then(assert.expectFail, function(error) {
						assert.equal('duplicate', error.name);
					});
				});
			});

			describe('verify', function() {
				it('should succeed when valid credentials are supplied', function() {
					return service.verify(user.email, user.password)
					.then(function(verifiedUser) {
						assert.equal(user.id, verifiedUser.id);
					});
				});

				it('should fail when invalid credentials are supplied', function() {
					return service.verify(user.email, 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
					.then(assert.expectFail, function(err) {
						assert.equal(err.message, 'Invalid credentials');
					});
				});
			});
		});

		describe('when user does not exist', function() {
			describe('create', function() {
				var createPromise;

				beforeEach(function() {
					createPromise = service.create(guid.raw(), '0000000000000000000000000000000000000000000000000000000000000000');
				});

				it('should return the created user', function() {
					createPromise.then(function(createdUser) {
						assert.notEqual(undefined, createdUser.id);
						assert.equal(createdUser.email, createdUser.email);
						assert.equal(undefined, createdUser.password);
					});
				});

				it('should create the user', function() {
					return createPromise
					.then(function(createdUser) {
						return graph.users.get(createdUser.id)
						.then(function(retrievedUser) {
							assert.equal(createdUser.id, retrievedUser.id);
						});
					});
				});
			});
		});

		describe('when the password is not hashed', function() {
			describe('create', function() {
				it('should return an error', function() {
					return service.create(guid.raw(), 'this is not a hashed password')
					.then(assert.expectFail, function(error) {
						assert.equal(error.message, 'Invalid password');
					});
				});
			});
		});
	}

	if (!process.env.TOPICNET_SKIP_INTEGRATION) {
		describe('with real graph', function() {
			runUserServiceTests(RealGraph.create(neo4jGraph));
		});
	}

	describe('with stub graph', function() {
		runUserServiceTests(StubGraph.create());
	});

});