var assert = require('assert');
var Q = require('q');
var userService = require('../../../service/lib/user-service');
var StubGraph = require('./graph/stub-graph');
var neo4jGraph = require('../../../service/lib/graph/neo4j-graph');
var RealGraph = require('../../../service/lib/graph/topicnet-graph');
var guid = require('guid');

describe('User Service', function() {

	var service;

	function runUserServiceTests(graph) {

		beforeEach(function() {
			service = userService.create(graph);
		});

		describe('when user exists', function() {

			var user;

			beforeEach(function(done) {
				graph.users.create({ email: guid.raw(), password: '0000000000000000000000000000000000000000000000000000000000000000' })
				.done(function(createdUser) {
					user = createdUser;
					done();
				});
			});

			it('create with same email returns a duplicate error', function(done) {
				service.create(user.email, user.password)
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(error) {
					assert.equal('duplicate', error.name);
					done();
				});
			});

			describe('when valid credentials are supplied', function() {
				it('verify succeeds', function(done) {
					service.verify(user.email, user.password)
					.done(function(verifiedUser) {
						assert.equal(user.id, verifiedUser.id);
						done();
					});
				});
			});

			describe('when invalid credentials are supplied', function() {
				it('verify fails', function(done) {
					service.verify(user.email, 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
					.done(function() {
						assert.ok(false, 'should have failed');
						done();
					}, function(error) {
						assert.equal(error, 'Invalid credentials');
						done();
					});
				});
			});
		});

		describe('when user does not exist', function() {
			it('create should create the user', function(done) {
				service.create(guid.raw(), '0000000000000000000000000000000000000000000000000000000000000000')
				.done(function(createdUser) {
					return graph.users.get(createdUser.id)
					.then(function(retrievedUser) {
						assert.equal(createdUser.email, retrievedUser.email);
						done();
					});
				});
			});
		});

		describe('when the password is not hashed', function() {
			it('create should return an error', function(done) {
				service.create(guid.raw(), 'this is not a hashed password')
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(error) {
					assert.equal(error.message, 'Invalid password');
					done();
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