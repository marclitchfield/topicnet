var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Root Topics', function() {

	describe('POST to /topics/:id/root', function() {

		var p = api.request();
		var rootResponse;

		before(function(done) {
			p.postTopic(function() {
				api.post('/topics/' + p.returnedTopic.id + '/root', {}, function(err, res) {
					rootResponse = res;
					done();
				});
			});
		});

		it('returns status 200', function() {
			assert.equal(rootResponse.statusCode, 200);
		});

		describe('then GET /topics', function() {

			var rootTopicsResponse;

			before(function(done) {
				api.get('/topics', function(err, res) {
					rootTopicsResponse = res;
					done();
				});
			});

			it('returns status 200', function() {
				assert.equal(rootTopicsResponse.statusCode, 200);
			});

			it('returns all root topics including our topic', function() {
				var rootTopics = JSON.parse(rootTopicsResponse.body);
				assert.ok(_.any(rootTopics, function(t) {
					return t.id === p.returnedTopic.id;
				}));
			});

		});

	});

	describe('DELETE /topics/:id/root', function() {

		var rootPost = api.request();

		before(function(done) {
			rootPost.postTopic(function() {
				api.post('/topics/' + rootPost.returnedTopic.id + '/root', {}, 
					function(err, results) {
						done(err);
					}
				);
			});
		});

		it('returns status 200', function(done) {
			api.del('/topics/' + rootPost.returnedTopic.id + '/root', {}, 
				function(err, results) {
					assert.equal(results.statusCode, 200);
					done(err);
				}
			);
		});

		describe('then GET /topics/:id/root', function() {

			it('does not include the topic in the root relationships', function(done) {
				api.get('/topics', function(err, results) {
					var rootTopics = JSON.parse(results.body);
					assert.ok(!_.any(rootTopics, function(t) {
						return t.id === rootPost.returnedTopic.id;
					}));
					done();
				});
			});

		});
	});

});
