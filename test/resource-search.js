var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');

describe('Resource Search', function() {

	var resourceToFind;

	before(function(done) {
		api.post('/resources', { title: 'resource to find! ' + guid.raw(), 
			url: 'http://example.com/' + guid.raw(), source: 'example.com' }, 
			function(err, res) {
			resourceToFind = JSON.parse(res.body);
			done(err);
		})
	})

	describe('GET /resources?invalid', function() {

		it('returns status 404', function(done) {
			api.get('/resources?invalid', function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
			});
		})

	})

	describe('GET /resources?title with substring', function() {

		it('returns existing resource', function(done) {
			api.get('/resources?title=ource t', function(err, res) {
				var searchResults = JSON.parse(res.body);
				assert.ok(_.any(searchResults, function(r) {
					return r.id === resourceToFind.id;
				}));
				done();
			});
		})

	})

	describe('GET /resources?title with ! in query', function() {

		it('returns existing resource', function(done) {
			api.get('/resources?title=nd!', function(err, res) {
				var searchResults = JSON.parse(res.body);
				assert.ok(_.any(searchResults, function(r) {
					return r.id === resourceToFind.id;
				}));
				done();
			});
		})

	})

	describe('GET /resources?url with substring including : character', function() {

		it('returns existing resource', function(done) {
			api.get('/resources?url=' + encodeURIComponent('://examp'), function(err, res) {
				var searchResults = JSON.parse(res.body);
				assert.ok(_.any(searchResults, function(r) {
					return r.id === resourceToFind.id;
				}));	
				done();
			});
		})

	})

})
