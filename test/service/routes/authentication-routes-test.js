var assert = require('assert'),
	sinon = require('sinon'),
	express = require('express'),
	supertest = require('supertest'),
	Q = require('q');

require('../test-utils');

describe('Authentication routes', function() {

	var app = express.createServer();
	app.use(express.bodyParser());

	var user = { email: 'email', password: 'password' };
	app.use(function(req, res, next) {
		req.user = user;
		next();
	});

	var request;
	var userService = {};
	require('../../../service/api/authentication-routes')(app, userService);

	beforeEach(function() {
		request = supertest(app);
	});

	describe('GET /user', function() {
		it('returns logged in user', function(done) {
			request.get('/user')
			.expect(200, function(err, res) {
				assert.deepEqual(res.body, user);
				done();
			});
		});
	});

	describe('POST /user', function() {
		it('should call create', function(done) {
			userService.create = sinon.stub().returns(Q.resolve());

			request.post('/user')
			.send(user)
			.expect(200, function(err, res) {
				assert.ok(userService.create.calledWith('email', 'password'));
				done();
			});
		});
	});

});