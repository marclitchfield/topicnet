var assert = require('assert');
var api = require('./helper-api.js');

describe('Vote CRUD', function() {

	var testVote = function(relationshipType, voteDirection) {

		var postFrom;
		var postTo;
		var votesKey = (voteDirection === 'up') ? 'upVotes' : 'downVotes';
		var response;

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
				return api.post('/topics/' + postFrom.returnedData.id +
					'/' + relationshipType + '/' + postTo.returnedData.id + '/vote',
					{ dir: voteDirection });
			})
			.then(function(res) {
				response = res;
				done();
			})
			.done();
		});

		it('increments the ' + votesKey + ' on the specified relationship by 1', function(done) {
			api.get('/topics/' + postFrom.returnedData.id +
				'/' + relationshipType + '/' + postTo.returnedData.id)
			.then(function(res) {
				var rel = JSON.parse(res.body);
				assert.equal(rel[votesKey], 1);
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(response.statusCode, 200);
		});

		it('returns the score', function() {
			assert.ok(JSON.parse(response.body).score !== undefined);
		});

	};

	describe("POST to /topics/:id/next/:toid/vote with dir: 'up'", function() {
		testVote('next', 'up');
	});

	describe("POST to /topics/:id/next/:toid/vote with dir: 'down'", function() {
		testVote('next', 'down');
	});

	describe("POST to /topics/:id/sub/:toid/vote with dir: 'up'", function() {
		testVote('sub', 'up');
	});

	describe("POST to /topics/:id/sub/:toid/vote with dir: 'down'", function() {
		testVote('sub', 'down');
	});
	
	describe("POST to /topics/:id/resources/:resid/vote with 'up'", function() {
		testVote('resources', 'up');
	});

	describe("POST to /topics/:id/resources/:resid/vote with 'down'", function() {
		testVote('resources', 'down');
	});

});
