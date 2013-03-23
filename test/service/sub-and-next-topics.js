var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

var testTopicRelationships = function(relationshipType) {

	describe('POST to /topics/:id/' + relationshipType, function() {

		var postTopic;
		var postRelatedTopic;
		var createRelationshipResponse;

		before(function(done) {
			api.postAndLinkTopics(relationshipType)
			.then(function(res) {
				postTopic = res.postTopic;
				postRelatedTopic = res.postRelatedTopic;
				createRelationshipResponse = res.response;
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(createRelationshipResponse.statusCode, 200);
		});

		it('returns the initial score', function() {
			assert.ok(JSON.parse(createRelationshipResponse.body).score !== undefined);
		});

		describe('then GET /topics/:id/' + relationshipType, function() {

			var getRelatedResponse;
	
			before(function(done) {
				api.get('/topics/' + postTopic.returnedData.id + '/' + relationshipType)
				.then(function(res) {
					getRelatedResponse = res;
					done();
				})
				.done();
			});

			it('returns status 200', function() {
				assert.equal(getRelatedResponse.statusCode, 200);
			});

			it('returns the ' + relationshipType + 'topic', function() {
				var returnedTopics = api.parseBody(getRelatedResponse.body);
				assert.ok(_.any(returnedTopics, function(t) {
					return t.id === postRelatedTopic.returnedData.id;
				}));
			});

		});

		describe('then POST a duplicate ' + relationshipType + 'topic to /topics/:id/' + relationshipType, function() {

			var duplicateResponse;

			before(function(done) {
				api.post('/topics/' + postTopic.returnedData.id + '/' + relationshipType,
					{ toid: postRelatedTopic.returnedData.id })
				.then(function(res) {
					duplicateResponse = res;
					done();
				})
				.done();
			});

			it('returns status 400', function() {
				assert.equal(duplicateResponse.statusCode, 400);
			});

			it('returns error message', function() {
				assert.notEqual(-1, duplicateResponse.body.indexOf("Relationship '" + relationshipType + "' already exists"));
			});
		});

	});

	describe('DELETE /topics/:id/' + relationshipType + '/:toid with an invalid id', function() {

		it('returns status 404', function(done) {
			api.del('/topics/-9999999/' + relationshipType + '/-99999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('DELETE /topics/:id/' + relationshipType + '/:toid with an invalid toid', function() {

		var postTopic;

		before(function(done) {
			api.postTopic()
			.then(function(res) {
				postTopic = res;
				done();
			})
			.done();
		});

		it('returns status 404', function(done) {
			api.del('/topics/' + postTopic.returnedData.id + '/' + relationshipType + '/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('DELETE /topics/:id/' + relationshipType + '/:toid', function() {

		var postTopic;
		var postRelatedTopic;

		before(function(done) {
			api.postAndLinkTopics(relationshipType)
			.then(function(res) {
				postTopic = res.postTopic;
				postRelatedTopic = res.postRelatedTopic;
				done();
			})
			.done();
		});

		it('returns status 200', function(done) {
			api.del('/topics/' + postTopic.returnedData.id + '/' + relationshipType + '/' + postRelatedTopic.returnedData.id)
			.then(function(results) {
				assert.equal(results.statusCode, 200);
				done();
			})
			.done();
		});

		describe('then GET /topics/:id/' + relationshipType, function() {

			it('does not include the topic whose ' + relationshipType + ' relationship was deleted', function(done) {
				api.get('/topics/' + postTopic.returnedData.id + '/' + relationshipType)
				.then(function(results) {
					var relatedTopics = api.parseBody(results.body);
					assert.ok(!_.any(relatedTopics, function(t) {
						return t.id === postRelatedTopic.returnedData.id;
					}));
					done();
				})
				.done();
			});

		});

	});
};

describe('Sub Topics', function() {
	testTopicRelationships('sub');
});

describe('Next Topics', function() {
	testTopicRelationships('next');
});
