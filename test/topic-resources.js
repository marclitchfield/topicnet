var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Topic Resources', function() {

	describe('POST to /topics/:id/resources with invalid id', function() {

		it('returns status 404', function(done) {
			api.post('/topics/-9999999/resources', {})
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('POST to /topics/:id/resources with invalid resid', function() {

		var p = api.request();

		before(function(done) {
			p.postTopic()
			.then(function() {
				done();
			})
			.done();
		});		
		
		it('returns status 404', function(done) {
			api.post('/topics/' + p.returnedTopic.id + '/resources')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('POST to /topics/:id/resources with duplicate resource', function() {

		var topicPost = api.request();
		var resPost = api.request();

		it('returns status 200', function(done) {
			topicPost.postTopic()
			.then(function() {
				return resPost.postResource();
			})
			.then(function() {
				return api.post('/topics/' + topicPost.returnedTopic.id + '/resources', { resid: resPost.returnedResource.id });
			})
			.then(function() {
				return api.post('/topics/' + topicPost.returnedTopic.id + '/resources', { resid: resPost.returnedResource.id });
			})
			.then(function(res) {
				assert.equal(res.statusCode, 400);
				done();
			})
			.done();
		});
	});

	describe('POST to /topics/:id/resources with valid data', function() {

		var topicPost = api.request();
		var resPost = api.request();

		it('returns status 200', function(done) {
			topicPost.postTopic()
			.then(function() {
				return resPost.postResource();
			})
			.then(function() {
				return api.post('/topics/' + topicPost.returnedTopic.id + '/resources', 
					{ resid: resPost.returnedResource.id });
			})
			.then(function(res) {
				assert.equal(res.statusCode, 200);
				done();	
			})
			.done();
		});

		describe('then GET /topics/:id', function() {

			it('returns the topic with the newly associated resource', function(done) {
				api.get('/topics/' + topicPost.returnedTopic.id)
				.then(function(res) {
					assert.equal(res.statusCode, 200);
					var topic = api.parseBody(res.body);
					assert.ok(_.any(topic.resources, function(r) {
						return r.id === resPost.returnedResource.id;
					}));
					done();
				})
				.done();
			});

		});

	});

	describe('DELETE /topics/:id/resources/:resid with invalid id', function() {

		it('returns status 404', function(done) {
			api.del('/topics/-9999999/resources/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('DELETE /topics/:id/resources/:resid with invalid resid', function() {

		var p = api.request();
		
		before(function(done) {
			p.postTopic()
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 404', function(done) {
			api.del('/topics/' + p.returnedTopic.id + '/resources/-9999999')
			.then(function(res) {	
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('DELETE /topics/:id/resources/:resid', function() {

		var topicPost = api.request();
		var resourcePost = api.request();

		before(function(done) {
			topicPost.postTopic()
			.then(function() {
				return resourcePost.postResource();
			})
			.then(function() {
				return api.post('/topics/' + topicPost.returnedTopic.id + '/resources',
					{ resid: resourcePost.returnedResource.id });
			})
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 200', function(done) {
			api.del('/topics/' + topicPost.returnedTopic.id + '/resources/' + resourcePost.returnedResource.id)
			.then(function(res) {
				assert.equal(res.statusCode, 200);
				done();
			})
			.done();
		});

		describe('then GET /topics/:id', function() {

			it('does not include the unlinked resource', function(done) {
				var g = api.request();
				g.getTopic(topicPost.returnedTopic.id)
				.then(function() {
					assert.ok(g.returnedTopic.resources === undefined || 
						!_.any(g.returnedTopic.resources, function(r) {
							return r.id === resourcePost.returnedResource.id;
						}));
					done();		
				})
				.done();
			});

		});

	});

});
