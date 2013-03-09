var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

var postAndLinkTopics = function(relationshipType) {
	var response = {};
	return api.postTopic()
	.then(function(res) {
		response.postTopic = res;
		return api.postTopic();
	})
	.then(function(res) {
		response.postRelatedTopic = res;
		return api.post('/topics/' + response.postTopic.returnedData.id + '/' + relationshipType,
			{ toid: response.postRelatedTopic.returnedData.id });
	})
	.then(function(res) {
		response.response = res;
		return response;
	});
};

describe('Next Topics', function() {

	describe('POST to /topics/:id/next', function() {

		var postTopic;
		var postNextTopic;
		var makeNextResponse;

		before(function(done) {
			postAndLinkTopics('next')
			.then(function(res) {
				postTopic = res.postTopic;
				postNextTopic = res.postRelatedTopic;
				makeNextResponse = res.response;
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(makeNextResponse.statusCode, 200);
		});

		it('returns the initial score', function() {
			assert.ok(JSON.parse(makeNextResponse.body).score !== undefined);
		});

		describe('then GET /topics/:id/next', function() {

			var getNextResponse;		
	
			before(function(done) {
				api.get('/topics/' + postTopic.returnedData.id + '/next')
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
					return t.id === postNextTopic.returnedData.id;
				}));
			});

		});

	});

	describe('DELETE /topics/:id/next/:toid with valid data', function() {

		var postTopic;
		var postNextTopic;

		before(function(done) {
			postAndLinkTopics('next')
			.then(function(res) {
				postTopic = res.postTopic;
				postNextTopic = res.postRelatedTopic;
				done();
			})
			.done();
		});

		it('returns status 200', function(done) {
			api.del('/topics/' + postTopic.returnedData.id + '/next/' + postNextTopic.returnedData.id)
			.then(function(results) {
				assert.equal(results.statusCode, 200);
				done();
			})
			.done();	
		});

		describe('then GET /topics/:id/next', function() {

			it('does not include the topic whose next relationship was deleted', function(done) {
				api.get('/topics/' + postTopic.returnedData.id + '/next')
				.then(function(results) {
					var nextTopics = api.parseBody(results.body);
					assert.ok(!_.any(nextTopics, function(t) {
						return t.id === postNextTopic.returnedData.id;
					}));
					done();
				})
				.done();
			});

		});

	});

});
