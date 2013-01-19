var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Root Topics', function() {

	describe('POST to /topics/:id/root', function() {

		var p = api.request();
		var rootResponse;

		before(function(done) {
			p.postTopic()
			.then(function() {
				return api.post('/topics/' + p.returnedTopic.id + '/root', {});
			})
			.then(function(res) {
				rootResponse = res;
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(rootResponse.statusCode, 200);
		});

		describe('then GET /topics', function() {

			var rootTopicsResponse;

			before(function(done) {
				api.get('/topics')
				.then(function(res) {
					rootTopicsResponse = res;
					done();
				})
				.done();
			});

			it('returns status 200', function() {
				assert.equal(rootTopicsResponse.statusCode, 200);
			});

			it('returns all root topics including our topic', function() {
				var rootTopics = api.parseBody(rootTopicsResponse.body);
				assert.ok(_.any(rootTopics, function(t) {
					return t.id === p.returnedTopic.id;
				}));
			});

		});

	});

	describe('DELETE /topics/:id/root', function() {

		var rootPost = api.request();

		before(function(done) {
			rootPost.postTopic()
			.then(function() {
				return api.post('/topics/' + rootPost.returnedTopic.id + '/root', {});
			})
			.then(function(results) {
				done();
			})
			.done();
		});

		it('returns status 200', function(done) {
			api.del('/topics/' + rootPost.returnedTopic.id + '/root')
			.then(function(results) {
				assert.equal(results.statusCode, 200);
				done();
			})
			.done();
		});

		describe('then GET /topics', function() {

			it('does not include the topic in the root topics', function(done) {
				api.get('/topics')
				.then(function(results) {
					var rootTopics = api.parseBody(results.body);
					assert.ok(!_.any(rootTopics, function(t) {
						return t.id === rootPost.returnedTopic.id;
					}));
					done();
				})
				.done();
			});

		});
	});

});
