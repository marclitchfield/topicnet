var assert = require('assert');
var api = require('./helper-api.js');

describe('Vote CRUD', function() {

	describe("POST to /topics/:id/:rel/:toid/vote with dir: 'up'", function() {
		
		var postFrom = api.request();
		var postTo = api.request();
		var relationshipType = 'sub';
		var response;

		before(function(done) {
			postFrom.postTopic()
			.then(function() {
				return postTo.postTopic();
			})
			.then(function() {
				return api.post('/topics/' + postFrom.returnedTopic.id +
					'/' + relationshipType, { toid: postTo.returnedTopic.id });
			})
			.then(function() {
				return api.post('/topics/' + postFrom.returnedTopic.id +
					'/' + relationshipType + '/' + postTo.returnedTopic.id + '/vote',
					{ dir: 'up' });	
			})
			.then(function(res) {
				response = res;
				done();
			})
			.done();

		});

		it('returns status 200', function() {
			assert.equal(response.statusCode, 200);
		});

		it('increments the upVotes on the specified relationship by 1', function(done) {
			api.get('/topics/' + postFrom.returnedTopic.id +
				'/' + relationshipType + '/' + postTo.returnedTopic.id)
			.then(function(res) {
				var rel = JSON.parse(res.body);
				assert.equal(rel.upVotes, 1);
				done();
			})
			.done();
		});

	});

	describe("POST to /topics/:id/:rel/:toid/vote with dir: 'down'", function() {
		
		var postFrom = api.request();
		var postTo = api.request();
		var relationshipType = 'next';
		var response;

		before(function(done) {
			postFrom.postTopic()
			.then(function() {
				return postTo.postTopic();
			})
			.then(function() {
				return api.post('/topics/' + postFrom.returnedTopic.id +
					'/' + relationshipType, { toid: postTo.returnedTopic.id });
			})
			.then(function() {
				return api.post('/topics/' + postFrom.returnedTopic.id +
					'/' + relationshipType + '/' + postTo.returnedTopic.id + '/vote',
					{ dir: 'down' });	
			})
			.then(function(res) {
				response = res;
				done();
			})
			.done();

		});

		it('returns status 200', function() {
			assert.equal(response.statusCode, 200);
		});

		it('increments the downVotes on the specified relationship by 1', function(done) {
			api.get('/topics/' + postFrom.returnedTopic.id +
				'/' + relationshipType + '/' + postTo.returnedTopic.id)
			.then(function(res) {
				var rel = JSON.parse(res.body);
				assert.equal(rel.downVotes, 1);
				done();
			})
			.done();
		});

	});

});
