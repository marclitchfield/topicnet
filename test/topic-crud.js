var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Topic CRUD', function() {

	describe('POST to /topics with no name', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/topics', {}, function(err, res) {
				assert.equal(500, res.statusCode);
				assert.notEqual(-1, res.body.indexOf('name is required'));
				done();
			});
		})
	})

	describe('POST to /topics with valid data', function() {

		var r = api.request();

		before(function(done) {
			r.postTopic(done);
		})

		it('returns status 200', function() {
			assert.equal(r.response.statusCode, 200);
		})

		it('returns new topic with the name specified', function() {
			assert.equal(r.topic.name, 'testnode');
		})

		it('returns new topic with a valid generated id', function() {
			assert.ok(r.topic.id > 0);
		})

	})

	describe('GET /topics/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.get('/topics/-99999', function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
			});
		})

	})

	describe('GET /topics/:id with valid id', function() {
		
		var p = api.request();
		var g = api.request();
	
		before(function(done) {
			p.postTopic(function() {
				g.getTopic(p.topic.id, done);
			});
		})

		it('returns status 200', function() {
			assert.equal(g.response.statusCode, 200);
		})

		it('returns existing topic with the expected name', function() {
			assert.equal(g.topic.name, 'testnode');
		})

		it('returns existing topic with the expected id', function() {
			assert.equal(g.topic.id, p.topic.id);
		})

	})

	describe('PUT /topics/:id', function() {
		var post = api.request();

		before(function(done) {
			post.postTopic(function() {
				api.put('/topics/' + post.topic.id, {name: 'updated'}, done);
			});
		})

		describe('then GET /topics/:id', function() {
			var get = api.request();
			
			before(function(done) {
				get.getTopic(post.topic.id, done);
			})

			it('topic name has been updated', function() {
				assert.equal(get.topic.name, 'updated');
			})
		})
	})

	describe('DELETE /topics/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.del('/topics/-9999999', {}, function(err, res) {
				assert.equal(res.statusCode, 404);
				done(err);
			});
		})

	})

	describe('DELETE /topics/:id with valid id', function() {

		var topicPost = api.request();

		before(function(done) {
			topicPost.postTopic(done);
		})

		it('returns status 200', function(done) {
			api.del('/topics/' + topicPost.topic.id, {}, function(err, res) {
				assert.equal(res.statusCode, 200);
				done(err);
			});
		})

		describe('then GET /topics/:id with the deleted id', function() {

			it('returns status 404', function(done) {
				api.get('/topics/' + topicPost.topic.id, function(err, res) {
					assert.equal(res.statusCode, 404);
					done(err);
				});
			})

		})

	})

})
