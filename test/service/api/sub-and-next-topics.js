var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
require('../test-utils');

describe('Topic Relationships', function() {

	var relationshipType = 'sub';

	describe('POST to /topics/:id/' + relationshipType, function() {

		var postTopic;
		var postRelatedTopic;
		var createRelationshipResponse;

		before(function() {
			return api.postAndLinkTopics(relationshipType)
			.then(function(res) {
				postTopic = res.postTopic;
				postRelatedTopic = res.postRelatedTopic;
				createRelationshipResponse = res.response;
			});
		});

		it('returns status 200', function() {
			assert.equal(createRelationshipResponse.statusCode, 200);
		});

		it('returns the initial score', function() {
			assert.ok(JSON.parse(createRelationshipResponse.body).score !== undefined);
		});

		describe('then GET /topics/:id/' + relationshipType, function() {

			var getRelatedResponse;

			before(function() {
				return api.get('/topics/' + postTopic.returnedData.id + '/' + relationshipType)
				.then(function(res) {
					getRelatedResponse = res;
				});
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

	});

	describe('DELETE /topics/:id/' + relationshipType + '/:toid with an invalid id', function() {

		it('returns status 404', function() {
			return api.del('/topics/-9999999/' + relationshipType + '/-99999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
			});
		});

	});

	describe('DELETE /topics/:id/' + relationshipType + '/:toid', function() {

		var postTopic;
		var postRelatedTopic;

		before(function() {
			return api.postAndLinkTopics(relationshipType)
			.then(function(res) {
				postTopic = res.postTopic;
				postRelatedTopic = res.postRelatedTopic;
			});
		});

		it('returns status 200', function() {
			return api.del('/topics/' + postTopic.returnedData.id + '/' + relationshipType + '/' + postRelatedTopic.returnedData.id)
			.then(function(results) {
				assert.equal(results.statusCode, 201);
			});
		});

		describe('then GET /topics/:id/' + relationshipType, function() {

			it('does not include the topic whose ' + relationshipType + ' relationship was deleted', function() {
				return api.get('/topics/' + postTopic.returnedData.id + '/' + relationshipType)
				.then(function(results) {
					var relatedTopics = api.parseBody(results.body);
					assert.ok(!_.any(relatedTopics, function(t) {
						return t.id === postRelatedTopic.returnedData.id;
					}));
				});
			});

		});

	});

});
