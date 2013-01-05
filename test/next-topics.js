var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Next Topics', function() {

	describe('POST to /topics/:id/next', function() {

		var postPrev = api.request();
		var postNext = api.request();
		var makeNextResponse;

		before(function(done) {
			postPrev.postTopicPromise()
			.then(function() {
				return postNext.postTopicPromise();
			})
			.then(function() {
				return api.postPromise('/topics/' + postPrev.returnedTopic.id + '/next',
					{ toid: postNext.returnedTopic.id });
			})
			.then(function(res) {
				makeNextResponse = res;
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(makeNextResponse.statusCode, 200);
		});

		describe('then GET /topics/:id/next', function() {

			var getNextResponse;		
	
			before(function(done) {
				api.getPromise('/topics/' + postPrev.returnedTopic.id + '/next')
				.then(function(res) {
					getNextResponse = res;
					done();
				})
				.done();
			});

			it('returns status 200', function() {
				assert.equal(getNextResponse.statusCode, 200);
			});

			it('returns the next topic', function() {
				var returnedTopics = api.parseBody(getNextResponse.body);
				assert.ok(_.any(returnedTopics, function(t) {
					return t.id === postNext.returnedTopic.id;
				}));
			});

		});

	});

	describe('DELETE /topics/:id/next/:toid with valid data', function() {

		var postPrev = api.request();
		var postNext = api.request();

		before(function(done) {
			postPrev.postTopicPromise()
			.then(function() {
				return postNext.postTopicPromise();
			})
			.then(function() {
				return api.postPromise('/topics/' + postPrev.returnedTopic.id + '/next', { toid: postNext.returnedTopic.id });
			})
			.then(function(results) {
				done();
			})
			.done();
		});

		it('returns status 200', function(done) {
			api.delPromise('/topics/' + postPrev.returnedTopic.id + '/next/' + postNext.returnedTopic.id)
			.then(function(results) {
				assert.equal(results.statusCode, 200);
				done();
			})
			.done();	
		});

		describe('then GET /topics/:id/next', function() {

			it('does not include the topic whose next relationship was deleted', function(done) {
				api.getPromise('/topics/' + postPrev.returnedTopic.id + '/next')
				.then(function(results) {
					var nextTopics = api.parseBody(results.body);
					assert.ok(!_.any(nextTopics, function(t) {
						return t.id === postNext.returnedTopic.id;
					}));
					done();
				})
				.done();
			});

		});

	});

});
