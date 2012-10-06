var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Resource CRUD', function() {

	describe('POST to /resources without title', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', {}, function(err, res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('title is required'));
				done();
			});
		})
	})

	describe('POST to /resources without url', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', { title: 'test resource' }, function(err, res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('url is required'));
				done();
			});
		})
	})

	describe('POST to /resources without source', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', { title: 'test resource', url: 'http://example.com' }, function(err, res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('source is required'));
				done();
			});
		})
	})

	describe('POST to /resources with valid data', function() {

		it('returns status 200', function(done) {
			api.post('/resources', { title: 'test', url: 'http://example.com', source: 'example.com' }, function(err, res) {
				assert.equal(res.statusCode, 200);
				done();
			});

		});

	})

})
