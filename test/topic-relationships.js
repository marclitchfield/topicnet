var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Topic Relationships', function() {

	describe('POST to /topics/:id/:rel with an invalid relationship', function() {
		
		var r;

		before(function(done) {
			api.postPromise('/topics/1/invalid', { toid: 2 })
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
			api.postPromise('/topics/-9999999/sub', {})
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
			post.postTopicPromise()
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 500', function(done) {
			api.delPromise('/topics/' + post.returnedTopic.id + '/invalidrel/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 500);
				done();
			})
			.done();
		});

	});

});
