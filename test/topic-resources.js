var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Topic Resources', function() {

	describe('POST /topics/:id/resources with invalid id', function() {

		it('returns status 404', function(done) {
			api.post('/topics/-9999999/resources', {}, function(err, res) {
				assert.equal(res.statusCode, 404);
				done(err);
			});
		})

	})

	describe('POST /topics/:id/resources with invalid resid', function() {

		var topicPost = api.request();

		before(function(done) {
			topicPost.postTopic(done);
		})		
		
		it('returns status 404', function(done) {
			api.post('/topics/' + topicPost.topic.id + '/resources', { resid: -9999999 },
				function(err, res) {
				assert.equal(res.statusCode, 404);
				done(err);
			});
		})

	})

	describe('POST /topics/:id/resources with valid data', function() {

		var topicPost = api.request();
		var resPost = api.request();

		it('returns status 200', function(done) {
			topicPost.postTopic(function(err, res) {
				resPost.postResource(function(err, res) {
					api.post('/topics/' + topicPost.topic.id + '/resources', { resid: resPost.resource.id },
						function(err, res) {
							assert.equal(res.statusCode, 200);
							done();	
						});
				});
			});
		})

		describe('then GET /topics/:id', function() {

			it('returns the topic with the newly associated resource', function(done) {
				api.get('/topics/' + topicPost.topic.id, function(err, res) {
					assert.equal(res.statusCode, 200);
					var topic = JSON.parse(res.body);
					assert.ok(_.any(topic.resources, function(r) {
						return r.id === resPost.resource.id;
					}));
					done();
				});
			})

		})

	})

})