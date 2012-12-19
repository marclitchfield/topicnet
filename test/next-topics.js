var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Next Topics', function() {

	describe('POST to /topics/:id/next', function() {

		var postPrev = api.request();
		var postNext = api.request();
		var makeNextResponse;

		before(function(done) {
			postPrev.postTopic(function() {
				postNext.postTopic(function() {
					api.post('/topics/' + postPrev.returnedTopic.id + '/next',
						{ toid: postNext.returnedTopic.id }, function(err, res) {
						makeNextResponse = res;
						done();
					});
				});
			});
		});

		it('returns status 200', function() {
			assert.equal(makeNextResponse.statusCode, 200);
		});

		describe('then GET /topics/:id/next', function() {

			var getNextResponse;		
	
			before(function(done) {
				api.get('/topics/' + postPrev.returnedTopic.id + '/next', function(err, res) {
					getNextResponse = res;
					done();
				});
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
			postPrev.postTopic(function() {
				postNext.postTopic(function() {
					api.post('/topics/' + postPrev.returnedTopic.id + '/next', { toid: postNext.returnedTopic.id }, 
						function(err, results) {
							done(err);
						}
					);
				});
			});
		});

		it('returns status 200', function(done) {
			api.del('/topics/' + postPrev.returnedTopic.id + '/next/' + postNext.returnedTopic.id, 
				function(err, results) {
					assert.equal(results.statusCode, 200);
					done(err);
				}
			);
		});

		describe('then GET /topics/:id/next', function() {

			it('does not include the topic whose next relationship was deleted', function(done) {
				api.get('/topics/' + postPrev.returnedTopic.id + '/next', function(err, results) {
					var nextTopics = api.parseBody(results.body);
					assert.ok(!_.any(nextTopics, function(t) {
						return t.id === postNext.returnedTopic.id;
					}));
					done();
				});
			});

		});

	});

});
