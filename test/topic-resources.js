var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Topic Resources', function() {

	describe('POST to /topics/:id/resources with invalid id', function() {

		it('returns status 404', function(done) {
			api.post('/topics/-9999999/resources', {}, function(err, res) {
				assert.equal(res.statusCode, 404);
				done(err);
			});
		});

	});

	describe('POST to /topics/:id/resources with invalid resid', function() {

		var p = api.request();

		before(function(done) {
			p.postTopic(done);
		});		
		
		it('returns status 404', function(done) {
			api.post('/topics/' + p.returnedTopic.id + '/resources', { resid: -9999999 },
				function(err, res) {
				assert.equal(res.statusCode, 404);
				done(err);
			});
		});

	});

	describe('POST to /topics/:id/resources with valid data', function() {

		var topicPost = api.request();
		var resPost = api.request();

		it('returns status 200', function(done) {
			topicPost.postTopic(function(err, res) {
				resPost.postResource(function(err, res) {
					api.post('/topics/' + topicPost.returnedTopic.id + '/resources', 
						{ resid: resPost.returnedResource.id },
						function(err, res) {
							assert.equal(res.statusCode, 200);
							done();	
						});
				});
			});
		});

		describe('then GET /topics/:id', function() {

			it('returns the topic with the newly associated resource', function(done) {
				api.get('/topics/' + topicPost.returnedTopic.id, function(err, res) {
					assert.equal(res.statusCode, 200);
					var topic = JSON.parse(res.body);
					assert.ok(_.any(topic.resources, function(r) {
						return r.id === resPost.returnedResource.id;
					}));
					done();
				});
			});

		});

	});

	describe('DELETE /topics/:id/resources with invalid id', function() {

		it('returns status 404', function(done) {
			api.del('/topics/-9999999/resources', {}, function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
			});
		});

	});

	describe('DELETE /topics/:id/resources with invalid resid', function() {

		var p = api.request();
		
		before(function(done) {
			p.postTopic(done);
		});

		it('returns status 404', function(done) {
			api.del('/topics/' + p.returnedTopic.id + '/resources', { resid: -9999999 }, 
				function(err, res) {
					assert.equal(res.statusCode, 404);
					done();
				}
			);
		});

	});

	describe('DELETE /topics/:id/resources with valid data', function() {

		var topicPost = api.request();
		var resourcePost = api.request();

		before(function(done) {
			topicPost.postTopic(function() {
				resourcePost.postResource(function() {
					api.post('/topics/' + topicPost.returnedTopic.id + '/resources',
						{ resid: resourcePost.returnedResource.id },
						function(err, res) {
							done();
						}
					);
				});
			});
		});

		it('returns status 200', function(done) {
			api.del('/topics/' + topicPost.returnedTopic.id + '/resources',
				{ resid: resourcePost.returnedResource.id },
				function(err, res) {
					assert.equal(res.statusCode, 200);
					done();
				}
			);
		});

		describe('then GET /topics/:id', function() {

			it('does not include the unlinked resource', function(done) {
				var g = api.request();
				g.getTopic(topicPost.returnedTopic.id, function() {
					assert.ok(g.returnedTopic.resources === undefined || 
						!_.any(g.returnedTopic.resources, function(r) {
							return r.id === resourcePost.returnedResource.id;
						}));
					done();		
				});
			});

		});

	});

});
