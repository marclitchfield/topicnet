var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');

describe('Resource Search', function() {

	var resourceToFind;

	before(function(done) {
		api.post('/resources', { title: 'resource to find! ' + guid.raw(), 
			url: 'http://example.com/' + guid.raw(), source: 'example.com', 
			verb: 'read' }, 
			function(err, res) {
			resourceToFind = JSON.parse(res.body);
			done(err);
		});
	});

	describe('GET /resources?invalid', function() {

		it('returns status 404', function(done) {
			api.get('/resources?invalid', function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
			});
		});

	});

	describe('GET /resources?title with exact matching title', function() {

		it('returns existing resource', function(done) {
			api.get('/resources?title=' + resourceToFind.title, function(err, res) {
				var searchResults = JSON.parse(res.body);
				assert.ok(_.all(searchResults, function(r) {
					return r.title === resourceToFind.title;
				}));
				assert.ok(_.any(searchResults, function(r) {
					return r.id === resourceToFind.id;
				}));
				done();
			});
		});

	});

	describe('GET /resources?url with exact matching url', function() {

		it('returns resource ', function(done) {
			api.get('/resources?url=' + encodeURIComponent(resourceToFind.url), function(err, res) {
				var searchResults = JSON.parse(res.body);
				assert.ok(_.all(searchResults, function(r) {
					return r.url === resourceToFind.url;
				}));
				assert.ok(_.any(searchResults, function(r) {
					return r.id === resourceToFind.id;
				}));	
				done();
			});
		});

	});

});
