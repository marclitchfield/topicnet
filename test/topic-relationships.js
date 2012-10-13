var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Topic Relationships', function() {

	describe('POST /topics/:id/:rel with an invalid relationship', function() {
		
		var r;

		before(function(done) {
			api.post('/topics/1/invalid', { toid: 2 }, function(err, res) {
				r = res;
				done();
			});
		})

		it('returns status 500', function() {
			assert.equal(r.statusCode, 500);
		})

		it('returns error message', function() {
			assert.notEqual(-1, r.body.indexOf('invalid relationship'));
		})

	})

	describe('POST /topics/:id/:rel with an invalid id', function() {

		it('returns status 404', function(done) {
			api.post('/topics/-9999999/sub', {}, function(err, res) {
				assert.equal(res.statusCode, 404);
				done(err);
			});
		})

	})

	describe('DELETE /topics/:id/:rel with an invalid relationship type', function() {

		var post = api.request();
		
		before(function(done) {
			post.postTopic(done);
		})

		it('returns status 500', function(done) {
			api.del('/topics/' + post.returnedTopic.id + '/invalidrel', { toid: -9999999 }, function(err, res) {
				assert.equal(res.statusCode, 500);
				done();
			});
		})

	})

})
