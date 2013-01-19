var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Sub Topics', function() {

	describe('POST to /topics/:id/sub', function() {

		var postParent = api.request();
		var postChild = api.request();
		var makeSubResponse;

		before(function(done) {
			postParent.postTopic()
			.then(function() {
				return postChild.postTopic();
			})
			.then(function() {
				return api.post('/topics/' + postParent.returnedTopic.id + '/sub',
					{ toid: postChild.returnedTopic.id });
			})
			.then(function(res) {
				makeSubResponse = res;
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(makeSubResponse.statusCode, 200);
		});

		describe('then GET /topics/:id/sub', function() {

			var getSubResponse;
	
			before(function(done) {
				api.get('/topics/' + postParent.returnedTopic.id + '/sub')
				.then(function(res) {
					getSubResponse = res;
					done();
				})
				.done();
			});

			it('returns status 200', function() {
				assert.equal(getSubResponse.statusCode, 200);
			});

			it('returns the subtopic', function() {
				var returnedTopics = api.parseBody(getSubResponse.body);
				assert.ok(_.any(returnedTopics, function(t) {
					return t.id === postChild.returnedTopic.id;
				}));
			});

		});

		describe('then POST a duplicate subtopic to /topics/:id/sub', function() {

			var duplicateResponse;

			before(function(done) {
				api.post('/topics/' + postParent.returnedTopic.id + '/sub',
					{ toid: postChild.returnedTopic.id })
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
				assert.notEqual(-1, duplicateResponse.body.indexOf('Relationship \'sub\' already exists'));
			});
		});

	});

	describe('DELETE /topics/:id/sub/:toid with an invalid id', function() {

		it('returns status 404', function(done) {
			api.del('/topics/-9999999/sub/-99999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('DELETE /topics/:id/sub/:toid with an invalid toid', function() {

		var p = api.request();

		before(function(done) {
			p.postTopic()
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 404', function(done) {
			api.del('/topics/' + p.returnedTopic.id + '/sub/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('DELETE /topics/:id/sub/:toid', function() {

		var postParent = api.request();
		var postChild = api.request();

		before(function(done) {
			postParent.postTopic()
			.then(function() {
				return postChild.postTopic();
			})
			.then(function() {
				return api.post('/topics/' + postParent.returnedTopic.id + '/sub', { toid: postChild.returnedTopic.id });	
			})
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 200', function(done) {
			api.del('/topics/' + postParent.returnedTopic.id + '/sub/' + postChild.returnedTopic.id)
			.then(function(results) {	
				assert.equal(results.statusCode, 200);
				done();
			})
			.done();
		});

		describe('then GET /topics/:id/sub', function() {

			it('does not include the topic whose sub relationship was deleted', function(done) {
				api.get('/topics/' + postParent.returnedTopic.id + '/sub')
				.then(function(results) {
					var subTopics = api.parseBody(results.body);
					assert.ok(!_.any(subTopics, function(t) {
						return t.id === postChild.returnedTopic.id;
					}));
					done();
				})
				.done();
			});

		});

	});

});
