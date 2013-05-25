var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Topic Resources', function() {

	describe('POST to /topics/:id/resources with valid data', function() {

		var postTopic;
		var postResource;
		var linkResourceResponse;

		before(function(done) {
			api.postTopic()
			.then(function(res) {
				postTopic = res;
				return api.postResource();
			})
			.then(function(res) {
				postResource = res;
				return api.post('/topics/' + postTopic.returnedData.id + '/resources',
					{ resid: postResource.returnedData.id });
			})
			.then(function(res) {
				linkResourceResponse = res;
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(linkResourceResponse.statusCode, 200);
		});

		it('returns the initial score', function() {
			assert.ok(JSON.parse(linkResourceResponse.body).score !== undefined);
		});

		describe('then GET /topics/:id', function() {

			it('returns the topic with the newly associated resource', function(done) {
				api.get('/topics/' + postTopic.returnedData.id)
				.then(function(res) {
					assert.equal(res.statusCode, 200);
					var topic = api.parseBody(res.body);
					assert.ok(_.any(topic.resources, function(r) {
						return r.id === postResource.returnedData.id;
					}));
					done();
				})
				.done();
			});

		});

	});

	describe('DELETE /topics/:id/resources/:resid', function() {

		var postTopic;
		var postResource;

		before(function(done) {
			api.postAndLinkTopicAndResource()
			.then(function(res) {
				postTopic = res.postTopic;
				postResource = res.postResource;
				done();
			})
			.done();
		});

		it('returns status 200', function(done) {
			api.del('/topics/' + postTopic.returnedData.id + '/resources/' + postResource.returnedData.id)
			.then(function(res) {
				assert.equal(res.statusCode, 200);
				done();
			})
			.done();
		});

		describe('then GET /topics/:id', function() {

			it('does not include the unlinked resource', function(done) {
				api.getTopic(postTopic.returnedData.id)
				.then(function(returnedTopic) {
					assert.ok(returnedTopic.resources === undefined ||
						!_.any(returnedTopic.resources, function(r) {
							return r.id === postResource.returnedData.id;
						}));
					done();
				})
				.done();
			});

		});

	});

});
