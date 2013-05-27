var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
require('../test-utils');

describe('Root Topics', function() {

	describe('POST to /topics/:id/root', function() {

		var postTopic;
		var rootResponse;

		before(function() {
			return api.postTopic()
			.then(function(res) {
				postTopic = res;
				return api.post('/topics/' + postTopic.returnedData.id + '/root', {});
			})
			.then(function(res) {
				rootResponse = res;
			});
		});

		it('returns status 200', function() {
			assert.equal(rootResponse.statusCode, 200);
		});

		describe('then GET /topics', function() {

			var rootTopicsResponse;

			before(function() {
				return api.get('/topics')
				.then(function(res) {
					rootTopicsResponse = res;
				});
			});

			it('returns status 200', function() {
				assert.equal(rootTopicsResponse.statusCode, 200);
			});

			it('returns all root topics including our topic', function() {
				var rootTopics = api.parseBody(rootTopicsResponse.body);

				assert.ok(_.any(rootTopics, function(t) {
					return t.id === postTopic.returnedData.id;
				}));
			});

		});

	});

	describe('DELETE /topics/:id/root', function() {

		var postTopic;

		before(function() {
			return api.postTopic()
			.then(function(res) {
				postTopic = res;
				return api.post('/topics/' + postTopic.returnedData.id + '/root', {});
			});
		});

		it('returns status 200', function() {
			return api.del('/topics/' + postTopic.returnedData.id + '/root')
			.then(function(results) {
				assert.equal(results.statusCode, 200);
			});
		});

		describe('then GET /topics', function() {

			it('does not include the topic in the root topics', function() {
				return api.get('/topics')
				.then(function(results) {
					var rootTopics = api.parseBody(results.body);
					assert.ok(!_.any(rootTopics, function(t) {
						return t.id === postTopic.returnedData.id;
					}));
				});
			});

		});
	});

});
