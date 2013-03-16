var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Topic Relationships', function() {

	var testGetRelationship = function(relationshipType) {

		var postFrom;
		var postTo;
		var response;
		var rel;

		before(function(done) {
			(function() {
				if(relationshipType === 'resources') {
					return api.postAndLinkTopicAndResource()
					.then(function(res) {
						postFrom = res.postTopic;
						postTo = res.postResource;
					});
				} else {
					return api.postAndLinkTopics(relationshipType)
					.then(function(res) {
						postFrom = res.postTopic;
						postTo = res.postRelatedTopic;
					});
				}
			})()
			.then(function() {
				return api.get('/topics/' + postFrom.returnedData.id +
					'/' + relationshipType + '/' + postTo.returnedData.id);
			})
			.then(function(res) {
				response = res;
				rel = JSON.parse(response.body);
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(response.statusCode, 200);
		});

		it('returns the relationship with a valid generated id', function() {
			assert.ok(rel.id > 0);
		});

		it('returns the relationship with the correct fromId', function() {
			assert.equal(rel.fromId, postFrom.returnedData.id);
		});

		it('returns the relationship with the correct toId', function() {
			assert.equal(rel.toId, postTo.returnedData.id);
		});

		it('returns the relationship with the correct relationshipType', function() {
			assert.equal(rel.relationshipType, relationshipType); 
		});

		it('returns the relationship with a valid number of upVotes', function() {
			assert.ok(rel.upVotes >= 0);
		});

		it('returns the relationship with a valid number of downVotes', function() {
			assert.ok(rel.downVotes >= 0);
		});

		it('returns the relationship with a score', function() {
			assert.ok(rel.score !== undefined);
		});

	};

	describe('GET /topics/:id/next/:toid', function() {
		testGetRelationship('next');
	});

	describe('GET /topics/:id/sub/:toid', function() {
		testGetRelationship('sub');
	});

	describe('GET /topics/:id/resources/:resid', function() {
		testGetRelationship('resources');
	});

	describe('GET /topics/:id/:rel/:toid with invalid id', function() {

		it('returns status 404', function(done) {
			api.get('/topics/-9999999/next/1')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('GET /topics/:id/:rel/:toid with invalid rel', function() {

		it('returns status 404', function(done) {
			api.postTopic()
			.then(function(postTopic) {
				return api.get('/topics/' + postTopic.returnedData.id + '/invalidRel/-999999');
			})
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('GET /topics/:id/:rel/:toid with invalid toid', function() {

		it('returns status 404', function(done) {
			api.postTopic()
			.then(function(postTopic) {
				return api.get('/topics/' + postTopic.returnedData.id + '/next/-999999');
			})
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('POST to /topics/:id/:rel with an invalid relationship', function() {

		var postResponse;

		before(function(done) {
			api.post('/topics/1/invalid', { toid: 2 })
			.then(function(res) {
				postResponse = res;
				done();
			})
			.done();
		});

		it('returns status 500', function() {
			assert.equal(postResponse.statusCode, 500);
		});

		it('returns error message', function() {
			assert.notEqual(-1, postResponse.body.indexOf('invalid relationship'));
		});

	});

	describe('POST to /topics/:id/:rel with an invalid id', function() {

		it('returns status 404', function(done) {
			api.post('/topics/-9999999/sub', {})
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('DELETE /topics/:id/:rel with an invalid relationship type', function() {

		it('returns status 500', function(done) {
			api.postTopic()
			.then(function(res) {
				return api.del('/topics/' + res.returnedData.id + '/invalidrel/-9999999');
			})
			.then(function(res) {
				assert.equal(res.statusCode, 500);
				done();
			})
			.done();
		});

	});

});
