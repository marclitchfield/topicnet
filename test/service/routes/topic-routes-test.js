var assert = require('assert'),
	sinon = require('sinon'),
	express = require('express'),
	supertest = require('supertest'),
	Q = require('q');

describe('Topic routes', function() {

	var app = express.createServer();
	app.use(express.bodyParser());

	app.use(function(req, res, next) {
		req.user = { id: 1111 };
		next();
	});

	var request;
	var topicService = {};
	require('../../../service/routes/topic-routes')(app, topicService);

	beforeEach(function() {
		request = supertest(app);
	});

	describe('GET /topics', function() {
		it('should call getRootTopics', function(done) {
			topicService.getRootTopics = sinon.stub().returns(Q.resolve());

			request.get('/topics')
			.expect(200, function(err, res) {
				assert.ok(topicService.getRootTopics.calledOnce);
				done();
			});
		});
	});

	describe('GET /topics?q', function() {
		it('should call search', function(done) {
			topicService.search = sinon.stub().returns(Q.resolve());

			request.get('/topics?q=abc')
			.expect(200, function(err, res) {
				assert.ok(topicService.search.calledWith({ q: 'abc' }));
				done();
			});
		});
	});

	describe('POST /topics', function() {
		it('should call create', function(done) {
			var newTopic = { name: 'new' };
			topicService.create = sinon.stub().returns(Q.resolve());

			request.post('/topics')
			.send(newTopic)
			.expect(200, function(err, res) {
				assert.ok(topicService.create.calledWith(newTopic));
				done();
			});
		});
	});

	describe('PUT /topics/:id', function() {
		it('should call update', function(done) {
			var updatedTopic = { name: 'updated' };
			topicService.update = sinon.stub().returns(Q.resolve());

			request.put('/topics/999')
			.send(updatedTopic)
			.expect(200, function(err, res) {
				assert.ok(topicService.update.calledWith(999, updatedTopic));
				done();
			});
		});
	});

	describe('GET /topics/:id', function() {
		it('should call get', function(done) {
			topicService.get = sinon.stub().returns(Q.resolve());

			request.get('/topics/999')
			.expect(200, function(err, res) {
				assert.ok(topicService.get.calledWith(999));
				done();
			});
		});
	});

	describe('GET /topics/:id/:rel', function() {
		it('should call getLinkedTopics', function(done) {
			topicService.getLinkedTopics = sinon.stub().returns(Q.resolve());

			request.get('/topics/999/sub')
			.expect(200, function(err, res) {
				assert.ok(topicService.getLinkedTopics.calledWith(999, 'sub'));
				done();
			});
		});
	});

	describe('GET /topics/:id/:rel/:toid', function() {
		it('should call getLink', function(done) {
			topicService.getLink = sinon.stub().returns(Q.resolve());

			request.get('/topics/999/sub/888')
			.expect(200, function(err, res) {
				assert.ok(topicService.getLink.calledWith(999, 888, 'sub'));
				done();
			});
		});
	});

	describe('POST /topics/:id/root', function() {
		it('should call linkRoot', function(done) {
			topicService.linkRoot = sinon.stub().returns(Q.resolve());

			request.post('/topics/999/root')
			.expect(200, function(err, res) {
				assert.ok(topicService.linkRoot.calledWith(999));
				done();
			});
		});
	});

	describe('POST /topics/:id/resources', function() {
		it('should call linkResource', function(done) {
			topicService.linkResource = sinon.stub().returns(Q.resolve());

			request.post('/topics/999/resources')
			.send({ resid: 888 })
			.expect(200, function(err, res) {
				assert.ok(topicService.linkResource.calledWith(999, 888));
				done();
			});
		});
	});

	describe('DELETE /topics/:id/resources/:resid', function() {
		it('should call unlinkResource', function(done) {
			topicService.unlinkResource = sinon.stub().returns(Q.resolve());

			request.del('/topics/999/resources/888')
			.expect(200, function(err, res) {
				assert.ok(topicService.unlinkResource.calledWith(999, 888));
				done();
			});
		});
	});

	describe('POST /topics/:id/:rel', function() {
		it('should call linkTopic', function(done) {
			topicService.linkTopic = sinon.stub().returns(Q.resolve());

			request.post('/topics/999/sub')
			.send({ toid: 888 })
			.expect(200, function(err, res) {
				assert.ok(topicService.linkTopic.calledWith(999, 888, 'sub'));
				done();
			});
		});
	});

	describe('POST /topics/:id/resources/:resid/hide', function() {
		it('should call hideResource', function(done) {
			topicService.hideResource = sinon.stub().returns(Q.resolve());

			request.post('/topics/999/resources/888/hide')
			.expect(200, function(err, res) {
				assert.ok(topicService.hideResource.calledWith(999, 888, 1111));
				done();
			});
		});
	});

	describe('DELETE /topics/:id/root', function() {
		it('should call unlinkRoot', function(done) {
			topicService.unlinkRoot = sinon.stub().returns(Q.resolve());

			request.del('/topics/999/root')
			.expect(200, function(err, res) {
				assert.ok(topicService.unlinkRoot.calledWith(999));
				done();
			});
		});
	});

	describe('DELETE /topics/:id/:rel/:toid', function() {
		it('should call unlinkTopic', function(done) {
			topicService.unlinkTopic = sinon.stub().returns(Q.resolve());

			request.del('/topics/999/sub/888')
			.expect(200, function(err, res) {
				assert.ok(topicService.unlinkTopic.calledWith(999, 888, 'sub'));
				done();
			});
		});
	});

	describe('DELETE /topics/:id', function() {
		it('should call destroy', function(done) {
			topicService.destroy = sinon.stub().returns(Q.resolve());

			request.del('/topics/999')
			.expect(200, function(err, res) {
				assert.ok(topicService.destroy.calledWith(999));
				done();
			});
		});
	});
});