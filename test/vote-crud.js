var assert = require('assert');
var api = require('./helper-api.js');

describe('Vote CRUD', function() {

	var setupRelationship = function(postFrom, postTo, relationshipType) {
		return postFrom.postTopic()
		.then(function() {
			return postTo.postTopic();
		})
		.then(function() {
			return api.post('/topics/' + postFrom.returnedTopic.id +
				'/' + relationshipType, { toid: postTo.returnedTopic.id });
		});
	};

	var setupResourceRelationship = function(postTopic, postResource) {
		return postTopic.postTopic()
		.then(function() {
			return postResource.postResource();
		})
		.then(function() {
			return api.post('/topics/' + postTopic.returnedTopic.id +
				'/resources', { resid: postResource.returnedResource.id });
		});
	};

	var testVoteOnTopicRelationship = function(relationshipType, voteDirection) {

		var postFrom = api.request();
		var postTo = api.request();
		var votesKey = (voteDirection === 'up') ? 'upVotes' : 'downVotes';
		var response;

		before(function(done) {
			setupRelationship(postFrom, postTo, relationshipType)
			.then(function() {
				return api.post('/topics/' + postFrom.returnedTopic.id +
					'/' + relationshipType + '/' + postTo.returnedTopic.id + '/vote',
					{ dir: voteDirection });
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

		it('increments the ' + votesKey + ' on the specified relationship by 1', function(done) {
			api.get('/topics/' + postFrom.returnedTopic.id +
				'/' + relationshipType + '/' + postTo.returnedTopic.id)
			.then(function(res) {
				var rel = JSON.parse(res.body);
				assert.equal(rel[votesKey], 1);
				done();
			})
			.done();
		});

	};

	var testVoteOnResourceRelationship = function(voteDirection) {

		var postTopic = api.request();
		var postResource = api.request();
		var response;
		var votesKey = (voteDirection === 'up') ? 'upVotes' : 'downVotes';

		before(function(done) {
			setupResourceRelationship(postTopic, postResource)
			.then(function(done) {
				return api.post('/topics/' + postTopic.returnedTopic.id +
					'/resources/' + postResource.returnedResource.id + '/vote',
					{ dir: voteDirection });
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

		it('increments the ' + votesKey + ' on the specified relationship by 1', function(done) {
			api.get('/topics/' + postTopic.returnedTopic.id +
				'/resources/' + postResource.returnedResource.id)
			.then(function(res) {
				var rel = JSON.parse(res.body);
				assert.equal(rel[votesKey], 1);
				done();
			})
			.done();
		});

	};

	describe("POST to /topics/:id/next/:toid/vote with dir: 'up'", function() {
		testVoteOnTopicRelationship('next', 'up');
	});

	describe("POST to /topics/:id/next/:toid/vote with dir: 'down'", function() {
		testVoteOnTopicRelationship('next', 'down');
	});

	describe("POST to /topics/:id/sub/:toid/vote with dir: 'up'", function() {
		testVoteOnTopicRelationship('sub', 'up');
	});

	describe("POST to /topics/:id/sub/:toid/vote with dir: 'down'", function() {
		testVoteOnTopicRelationship('sub', 'down');
	});

	describe("POST to /topics/:id/resources/:resid/vote with 'up'", function() {
		testVoteOnResourceRelationship('up');
	});

	describe("POST to /topics/:id/resources/:resid/vote with 'down'", function() {
		testVoteOnResourceRelationship('down');
	});

});
