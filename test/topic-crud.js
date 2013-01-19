var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');

describe('Topic CRUD', function() {

	describe('POST to /topics with no name', function() {
		it('returns status 500 and error message', function(done) {
			api.postPromise('/topics', {})
			.then(function(res) {
				assert.equal(500, res.statusCode);
				assert.notEqual(-1, res.body.indexOf('name is required'));
				done();
			})
			.done();
		});
	});

	describe('POST to /topics with valid data', function() {

		var p = api.request();

		before(function(done) {
			p.postTopicPromise()
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(p.response.statusCode, 200);
		});

		it('returns new topic with the name specified', function() {
			assert.equal(p.returnedTopic.name, p.postedTopic.name);
		});

		it('returns new topic with a valid generated id', function() {
			assert.ok(p.returnedTopic.id > 0);
		});

	});

	describe('POST to /topics with duplicate topic name', function() {

		var p = api.request();
		var duplicatePostResponse;		

		before(function(done) {
			p.postTopicPromise()
			.then(function() {
				return api.postPromise('/topics', p.postedTopic);
			})
			.then(function(res) {
				duplicatePostResponse = res;
				done();
			})
			.done();
		});

		it('returns status 400', function() {
			assert.equal(duplicatePostResponse.statusCode, 400);
		});

		it('returns an appropriate error message', function() {
			assert.notEqual(-1, duplicatePostResponse.body.indexOf('A topic with the specified name already exists'));
		});

	});

	describe('GET /topics/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.getPromise('/topics/-99999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('GET /topics/:id with valid id', function() {
		
		var p = api.request();
		var g = api.request();
	
		before(function(done) {
			p.postTopicPromise()
			.then(function() {
				return g.getTopicPromise(p.returnedTopic.id);
			})
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(g.response.statusCode, 200);
		});

		it('returns existing topic with the expected name', function() {
			assert.equal(g.returnedTopic.name, p.postedTopic.name);
		});

		it('returns existing topic with the expected id', function() {
			assert.equal(g.returnedTopic.id, p.returnedTopic.id);
		});

	});

	describe('PUT /topics/:id', function() {

		var p = api.request();
		var updatedTopic = { name: 'updated ' + guid.raw() };

		before(function(done) {
			p.postTopicPromise()
			.then(function() {
				return api.putPromise('/topics/' + p.returnedTopic.id, updatedTopic);
			})
			.then(function() {
				done();
			})
			.done();
		});

		describe('then GET /topics/:id', function() {

			var g = api.request();
			
			before(function(done) {
				g.getTopicPromise(p.returnedTopic.id)
				.then(function() {
					done();
				})
				.done();
			});

			it('topic name has been updated', function() {
				assert.equal(g.returnedTopic.name, updatedTopic.name);
			});
		});
	});

	describe('PUT /topics/:id with name that would be a duplicate', function() {

		var p1 = api.request();
		var p2 = api.request();
		var putResponse;

		before(function(done) {
			p1.postTopicPromise()
			.then(function() {
				return p2.postTopicPromise();
			})
			.then(function() {
				return api.putPromise('/topics/' + p2.returnedTopic.id, { name: p1.returnedTopic.name });
			})
			.then(function(res) {
				putResponse = res;
				done();
			})
			.done();
		});

		it('returns status 400', function() {
			assert.equal(putResponse.statusCode, 400);
		});

		it('returns an appropriate error message', function() {
			assert.notEqual(-1, putResponse.body.indexOf('Another topic exists with the specified name'));
		});

	});

	describe('DELETE /topics/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.delPromise('/topics/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('DELETE /topics/:id when the topic has an associated resource', function() {

		var pTopic = api.request();
		var pResource = api.request();
		var delResponse;
		
		before(function(done) {
			pTopic.postTopicPromise()
			.then(function() {
				return pResource.postResourcePromise();
			})
			.then(function() {
				return api.postPromise('/topics/' + pTopic.returnedTopic.id + '/resources/',
					{ resid: pResource.returnedResource.id });
			})
			.then(function() {
				return api.delPromise('/topics/' + pTopic.returnedTopic.id);
			})
			.then(function(res) {
				delResponse = res;
				done();
			})
			.done();
		});

		it('returns status 500', function() {
			assert.equal(delResponse.statusCode, 500);
		});

		describe('then GET /topics/:id', function() {

			it('returns the topic', function(done) {
				api.getPromise('/topics/' + pTopic.returnedTopic.id)
				.then(function(res) {
					var topic = api.parseBody(res.body);
					assert.equal(topic.id, pTopic.returnedTopic.id);
					done();
				})
				.then();
			});

		});

	});

	describe('DELETE /topics/:id with no relationships', function() {

		var p = api.request();

		before(function(done) {
			p.postTopicPromise()
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 200', function(done) {
			api.delPromise('/topics/' + p.returnedTopic.id)
			.then(function(res) {
				assert.equal(res.statusCode, 200);
				done();
			})
			.done();
		});

		describe('then GET /topics/:id with the deleted id', function() {

			it('returns status 404', function(done) {
				api.getPromise('/topics/' + p.returnedTopic.id)
				.then(function(res) {
					assert.equal(res.statusCode, 404);
					done();
				})
				.done();
			});

		});

	});

});
