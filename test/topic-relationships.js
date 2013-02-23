var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Topic Relationships', function() {

	var testGetRelationship = function(relationshipType) {

		var postFrom = api.request();
		var postTo = api.request();
		var toId;
		var data;
		var response;
		var rel;

		before(function(done) {
			postFrom.postTopic()
			.then(function() {
				if(relationshipType === 'resources') {
					return postTo.postResource();
				} else {
					return postTo.postTopic();
				}
			})
			.then(function() {
				if(relationshipType === 'resources') {
					toId = postTo.returnedResource.id;
					data = { resid: toId };
				} else {
					toId = postTo.returnedTopic.id;
					data = { toid: toId };
				}
				return api.post('/topics/' + postFrom.returnedTopic.id +
					'/' + relationshipType, data);
			})
			.then(function() {
				return api.get('/topics/' + postFrom.returnedTopic.id +
					'/' + relationshipType + '/' + toId);
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
			assert.equal(rel.fromId, postFrom.returnedTopic.id);
		});

		it('returns the relationship with the correct toId', function() {
			assert.equal(rel.toId, toId);
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

		var post = api.request();
		var r;

		before(function(done) {
			post.postTopic()
			.then(function() {
				return api.get('/topics/' + post.returnedTopic.id + '/invalidRel/-999999');
			})
			.then(function(res) {
				r = res;
				done();
			})
			.done();
		});

		it('returns status 404', function() {
			assert.equal(r.statusCode, 404);
		});

	});

	describe('GET /topics/:id/:rel/:toid with invalid toid', function() {

		var post = api.request();
		var r;

		before(function(done) {
			post.postTopic()
			.then(function() {
				return api.get('/topics/' + post.returnedTopic.id + '/next/-999999');
			})
			.then(function(res) {
				r = res;
				done();
			})
			.done();
		});

		it('returns status 404', function() {
			assert.equal(r.statusCode, 404);
		});

	});

	describe('POST to /topics/:id/:rel with an invalid relationship', function() {

		var r;

		before(function(done) {
			api.post('/topics/1/invalid', { toid: 2 })
			.then(function(res) {
				r = res;
				done();
			})
			.done();
		});

		it('returns status 500', function() {
			assert.equal(r.statusCode, 500);
		});

		it('returns error message', function() {
			assert.notEqual(-1, r.body.indexOf('invalid relationship'));
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

		var post = api.request();

		before(function(done) {
			post.postTopic()
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 500', function(done) {
			api.del('/topics/' + post.returnedTopic.id + '/invalidrel/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 500);
				done();
			})
			.done();
		});

	});

});
