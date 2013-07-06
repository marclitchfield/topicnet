var assert = require('assert'),
	sinon = require('sinon'),
	express = require('express'),
	supertest = require('supertest'),
	Q = require('q');

describe('Resource routes', function() {

	var app = express.createServer();
	app.use(express.bodyParser());

	app.use(function(req, res, next) {
		req.user = { id: 1111 };
		next();
	});

	var request;
	var resourceService = {};
	require('../../../service/api/resource-routes')(app, resourceService);

	beforeEach(function() {
		request = supertest(app);
	});

	describe('GET /resources?title', function() {
		it('should call searchByTitle', function(done) {
			resourceService.searchByTitle = sinon.stub().returns(Q.resolve());

			request.get('/resources?title=abc')
			.expect(200, function(err, res) {
				assert.ok(resourceService.searchByTitle.calledWith('abc'));
				done();
			});
		});
	});

	describe('GET /resources?url', function() {
		it('should call searchByUrl', function(done) {
			resourceService.searchByUrl = sinon.stub().returns(Q.resolve());

			request.get('/resources?url=the_url')
			.expect(200, function(err, res) {
				assert.ok(resourceService.searchByUrl.calledWith('the_url'));
				done();
			});
		});
	});

	describe('GET /resources?q', function() {
		it('should call search', function(done) {
			resourceService.search = sinon.stub().returns(Q.resolve());

			request.get('/resources?q=abc')
			.expect(200, function(err, res) {
				assert.ok(resourceService.search.calledWith({ q: 'abc' }));
				done();
			});
		});
	});

	describe('GET /resources/:id', function() {
		it('should call get', function(done) {
			resourceService.get = sinon.stub().returns(Q.resolve());

			request.get('/resources/999')
			.expect(200, function(err, res) {
				assert.ok(resourceService.get.calledWith(999));
				done();
			});
		});
	});

	describe('POST /resources', function() {
		it('should call create', function(done) {
			var newResource = { title: 'abc' };
			resourceService.create = sinon.stub().returns(Q.resolve());

			request.post('/resources')
			.send(newResource)
			.expect(200, function(err, res) {
				assert.ok(resourceService.create.calledWith(newResource));
				done();
			});
		});
	});

	describe('PUT /resources/:id', function() {
		it('should call update', function(done) {
			var updatedResource = { title: 'abc' };
			resourceService.update = sinon.stub().returns(Q.resolve());

			request.put('/resources/999')
			.send(updatedResource)
			.expect(200, function(err, res) {
				assert.ok(resourceService.update.calledWith(999, updatedResource));
				done();
			});
		});
	});

	describe('DELETE /resources/:id', function() {
		it('should call destroy', function(done) {
			resourceService.destroy = sinon.stub().returns(Q.resolve());

			request.del('/resources/999')
			.expect(200, function(err, res) {
				assert.ok(resourceService.destroy.calledWith(999));
				done();
			});
		});
	});
});