var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');

describe('Topic CRUD', function() {

	describe('POST to /topics with no name', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/topics', {}, function(err, res) {
				assert.equal(500, res.statusCode);
				assert.notEqual(-1, res.body.indexOf('name is required'));
				done();
			});
		})
	})

	describe('POST to /topics with valid data', function() {

		var p = api.request();

		before(function(done) {
			p.postTopic(done);
		})

		it('returns status 200', function() {
			assert.equal(p.response.statusCode, 200);
		})

		it('returns new topic with the name specified', function() {
			assert.equal(p.returnedTopic.name, p.postedTopic.name);
		})

		it('returns new topic with a valid generated id', function() {
			assert.ok(p.returnedTopic.id > 0);
		})

	})

	describe('POST to /topics with duplicate topic name', function() {

		var p = api.request();
		var duplicatePostResponse;		

		before(function(done) {
			p.postTopic(function() {
				api.post('/topics', p.postedTopic, function(err, res) {
					duplicatePostResponse = res;
					done();
				});
			});
		})

		it('returns status 400', function() {
			assert.equal(duplicatePostResponse.statusCode, 400);
		})

		it('returns an appropriate error message', function() {
			assert.notEqual(-1, duplicatePostResponse.body.indexOf('A topic with the specified name already exists'));
		})

	})

	describe('GET /topics/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.get('/topics/-99999', function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
			});
		})

	})

	describe('GET /topics/:id with valid id', function() {
		
		var p = api.request();
		var g = api.request();
	
		before(function(done) {
			p.postTopic(function() {
				g.getTopic(p.returnedTopic.id, done);
			});
		})

		it('returns status 200', function() {
			assert.equal(g.response.statusCode, 200);
		})

		it('returns existing topic with the expected name', function() {
			assert.equal(g.returnedTopic.name, p.postedTopic.name);
		})

		it('returns existing topic with the expected id', function() {
			assert.equal(g.returnedTopic.id, p.returnedTopic.id);
		})

	})

	describe('PUT /topics/:id', function() {

		var p = api.request();
		var updatedTopic = { name: 'updated ' + guid.raw() };

		before(function(done) {
			p.postTopic(function() {
				api.put('/topics/' + p.returnedTopic.id, updatedTopic, done);
			});
		})

		describe('then GET /topics/:id', function() {

			var g = api.request();
			
			before(function(done) {
				g.getTopic(p.returnedTopic.id, done);
			})

			it('topic name has been updated', function() {
				assert.equal(g.returnedTopic.name, updatedTopic.name);
			})
		})
	})

	describe('DELETE /topics/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.del('/topics/-9999999', {}, function(err, res) {
				assert.equal(res.statusCode, 404);
				done(err);
			});
		})

	})

	describe('DELETE /topics/:id with valid id', function() {

		var p = api.request();

		before(function(done) {
			p.postTopic(done);
		})

		it('returns status 200', function(done) {
			api.del('/topics/' + p.returnedTopic.id, {}, function(err, res) {
				assert.equal(res.statusCode, 200);
				done(err);
			});
		})

		describe('then GET /topics/:id with the deleted id', function() {

			it('returns status 404', function(done) {
				api.get('/topics/' + p.returnedTopic.id, function(err, res) {
					assert.equal(res.statusCode, 404);
					done(err);
				});
			})

		})

	})

})
