var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');
require('../test-utils');

describe('Topic CRUD', function() {

	describe('POST to /topics with no name', function() {
		it('returns status 500 and error message', function() {
			return api.post('/topics', {})
			.then(function(res) {
				assert.equal(500, res.statusCode);
				assert.notEqual(-1, res.body.indexOf('name is required'));
			});
		});
	});

	describe('POST to /topics with valid data', function() {

		var postTopic;

		before(function() {
			return api.postTopic()
			.then(function(res) {
				postTopic = res;
			});
		});

		it('returns status 200', function() {
			assert.equal(postTopic.response.statusCode, 200);
		});

		it('returns new topic with the name specified', function() {
			assert.equal(postTopic.returnedData.name, postTopic.postedData.name);
		});

		it('returns new topic with a valid generated id', function() {
			assert.ok(postTopic.returnedData.id > 0);
		});

	});

	describe('POST to /topics with duplicate topic name', function() {

		var postTopic;
		var duplicatePostResponse;

		before(function() {
			return api.postTopic()
			.then(function(res) {
				postTopic = res;
				return api.post('/topics', postTopic.postedData);
			})
			.then(function(res) {
				duplicatePostResponse = res;
			});
		});

		it('returns status 400', function() {
			assert.equal(duplicatePostResponse.statusCode, 400);
		});

		it('returns an appropriate error message', function() {
			assert.notEqual(-1, duplicatePostResponse.body.indexOf('A topic with the specified name already exists'));
		});

	});

	describe('GET /topics/:id with invalid id', function() {

		it('returns status 404', function() {
			return api.get('/topics/-99999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
			});
		});

	});

	describe('GET /topics/:id with valid id', function() {
		
		var postTopic;
		var getTopic;
	
		before(function() {
			return api.postTopic()
			.then(function(res) {
				postTopic = res;
				return api.getTopic(postTopic.returnedData.id);
			})
			.then(function(res) {
				getTopic = res;
			});
		});

		it('returns status 200', function() {
			assert.equal(getTopic.response.statusCode, 200);
		});

		it('returns existing topic with the expected name', function() {
			assert.equal(getTopic.returnedData.name, postTopic.postedData.name);
		});

		it('returns existing topic with the expected id', function() {
			assert.equal(getTopic.returnedData.id, postTopic.returnedData.id);
		});

	});

	var testGetTopicWithRelationship = function(relationshipType) {

		var postTopic;
		var postRelated;
		var retreivedTopic;

		before(function() {
			return (function() {
				if(relationshipType === 'resources') {
					return api.postAndLinkTopicAndResource()
					.then(function(res) {
						postTopic = res.postTopic;
						postRelated = res.postResource;
					});
				} else {
					return api.postAndLinkTopics(relationshipType)
					.then(function(res) {
						postTopic = res.postTopic;
						postRelated = res.postRelatedTopic;
					});
				}
			})()
			.then(function() {
				return api.get('/topics/' + postTopic.returnedData.id);
			})
			.then(function(res) {
				retreivedTopic = JSON.parse(res.body);
			});
		});

		it('returns the topic with a ' + relationshipType +
				' property that is an array of related objects', function() {
			assert.ok(retreivedTopic[relationshipType] !== undefined);
			assert.equal(retreivedTopic[relationshipType].length, 1);
		});

		describe('and the related object in the array', function() {

			var related;

			before(function() {
				related = retreivedTopic[relationshipType][0];
			});

			it('has an id property with the expected value', function() {
				assert.equal(related.id, postRelated.returnedData.id);
			});

			it('has a score property', function() {
				assert.ok(related.score !== undefined);
			});

		});

	};

	describe('GET /topics/:id when the topic has a next relationship', function() {
		testGetTopicWithRelationship('next');
	});

	describe('GET /topics/:id when the topic has a sub relationship', function() {
		testGetTopicWithRelationship('sub');
	});

	describe('GET /topics/:id with the topic has a resource', function() {
		testGetTopicWithRelationship('resources');
	});

	describe('PUT /topics/:id', function() {

		var postTopic;
		var updatedTopic = { name: 'updated ' + guid.raw() };

		before(function() {
			return api.postTopic()
			.then(function(res) {
				postTopic = res;
				return api.put('/topics/' + postTopic.returnedData.id, updatedTopic);
			});
		});

		describe('then GET /topics/:id', function() {

			var getTopic;
			
			before(function() {
				return api.getTopic(postTopic.returnedData.id)
				.then(function(res) {
					getTopic = res;
				});
			});

			it('topic name has been updated', function() {
				assert.equal(getTopic.returnedData.name, updatedTopic.name);
			});
		});
	});

	describe('PUT /topics/:id with name that would be a duplicate', function() {

		var postTopic;
		var postOtherTopic;
		var putResponse;

		before(function() {
			return api.postTopic()
			.then(function(res) {
				postTopic = res;
				return api.postTopic();
			})
			.then(function(res) {
				postOtherTopic = res;
				return api.put('/topics/' + postOtherTopic.returnedData.id, { name: postTopic.returnedData.name });
			})
			.then(function(res) {
				putResponse = res;
			});
		});

		it('returns status 400', function() {
			assert.equal(putResponse.statusCode, 400);
		});

		it('returns an appropriate error message', function() {
			assert.notEqual(-1, putResponse.body.indexOf('Another topic exists with the specified name'));
		});

	});

	describe('DELETE /topics/:id with invalid id', function() {

		it('returns status 404', function() {
			return api.del('/topics/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
			});
		});

	});

	describe('DELETE /topics/:id when the topic has an associated resource', function() {

		var postTopic;
		var postResource;
		var delResponse;
		
		before(function() {
			return api.postAndLinkTopicAndResource()
			.then(function(res) {
				postTopic = res.postTopic;
				postResource = res.postResource;
				return api.del('/topics/' + postTopic.returnedData.id);
			})
			.then(function(res) {
				delResponse = res;
			});
		});

		it('returns status 500', function() {
			assert.equal(delResponse.statusCode, 500);
		});

		describe('then GET /topics/:id', function() {

			it('returns the topic', function() {
				return api.get('/topics/' + postTopic.returnedData.id)
				.then(function(res) {
					var topic = api.parseBody(res.body);
					assert.equal(topic.id, postTopic.returnedData.id);
				});
			});

		});

	});

	describe('DELETE /topics/:id with no relationships', function() {

		var postTopic;

		before(function() {
			return api.postTopic()
			.then(function(res) {
				postTopic = res;
			});
		});

		it('returns status 200', function() {
			return api.del('/topics/' + postTopic.returnedData.id)
			.then(function(res) {
				assert.equal(res.statusCode, 200);
			});
		});

		describe('then GET /topics/:id with the deleted id', function() {

			it('returns status 404', function() {
				return api.get('/topics/' + postTopic.returnedData.id)
				.then(function(res) {
					assert.equal(res.statusCode, 404);
				});
			});

		});

	});

});
