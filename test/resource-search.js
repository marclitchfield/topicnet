var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');
require('./test-utils');

describe('Resource Search', function() {

	var resourceToFind;

	before(function(done) {
		api.postPromise('/resources', { title: 'Resource to find! ' + guid.raw(),
			url: 'http://example.com/Upper/' + guid.raw(), source: 'example.com',
			verb: 'read' })
		.then(function(res) {
			resourceToFind = api.parseBody(res.body);
			done();
		})
		.done();
	});

	describe('GET /resources?invalid', function() {

		it('returns status 404', function(done) {
			api.getPromise('/resources?invalid')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('GET /resources?title with exact matching title', function() {

		it('returns existing resource', function(done) {
			api.getPromise('/resources?title=' + resourceToFind.title)
			.then(function(res) {
				var searchResults = api.parseBody(res.body);
				assert.ok(_.all(searchResults, function(r) {
					return r.title === resourceToFind.title;
				}));
				assert.ok(_.any(searchResults, function(r) {
					return r.id === resourceToFind.id;
				}));
				done();
			})
			.done();
		});

	});

	describe('GET /resources?title with title differing only by case', function() {

		it('returns existing resource', function(done) {
			api.getPromise('/resources?title=' + resourceToFind.title.toUpperCase())
			.then(function(res) {
				var searchResults = api.parseBody(res.body);
				assert.ok(_.all(searchResults, function(r) {
					return r.title === resourceToFind.title;
				}));
				assert.ok(_.any(searchResults, function(r) {
					return r.id === resourceToFind.id;
				}));
				done();
			})
			.done();
		});

	});

	describe('GET /resources?url with exact matching url', function() {

		it('returns resource ', function(done) {
			api.getPromise('/resources?url=' + encodeURIComponent(resourceToFind.url))
			.then(function(res) {
				var searchResults = api.parseBody(res.body);
				assert.ok(_.all(searchResults, function(r) {
					return r.url === resourceToFind.url;
				}));
				assert.ok(_.any(searchResults, function(r) {
					return r.id === resourceToFind.id;
				}));
				done();
			})
			.done();
		});

	});

	describe('GET /resources?q with partial title', function() {

		var searchString = 'o Find!';

		it('returns a resource with the search string in the title', function(done) {
			api.getPromise('/resources?q=' + searchString)
			.then(function(res) {
				var searchResults = api.parseBody(res.body);
				assert.ok(_.all(searchResults, function(r) {
					return r.title.contains(searchString);
				}));
				done();
			})
			.done();
		});

	});

	describe('GET /resources?q with query that will return over 10 results', function() {
	 
		var searchString = 'Similar';
		var first5Results;
		var last5Results;

		function getResource() {
			return {
				title: 'similar resource ' + guid.raw(),
				url: 'http://example.com/' + guid.raw(),
				source: 'example.com',
				verb: 'read'
			};
		}

		before(function(done) {
			var count = 0;
			function postCallback() {
				count++;
				if(count === 11)
					done();
			}
			for(var i = 0; i < 11; i++) {
				api.postPromise('/resources', getResource()).then(postCallback).done();
			}
		});

		it('returns 10 matching results', function(done) {
			api.getPromise('/resources?q=' + searchString)
			.then(function(res) {
				var searchResults = api.parseBody(res.body);
				assert.equal(searchResults.length, 10);
				assert.ok(_.all(searchResults, function(t) {
					return t.title.contains(searchString);
				}));
				first5Results = searchResults.slice(0,5);
				last5Results = searchResults.slice(5,10);
				done();
			})
			.done();
		});

		describe('then GET /resources?q with the same query but p=1 and pp=5', function() {

			it('returns the first 5 matching results from the previous set', function(done) {
				api.getPromise('/resources?q=' + searchString + '&p=1&pp=5')
				.then(function(res) {
					var searchResults = api.parseBody(res.body);
					assert.equal(searchResults.length, 5);
					for(var i = 0; i < 5; i++) {
						assert.equal(first5Results[i].id, searchResults[i].id);
					}
					done();
				})
				.done();
			});

		});

		describe('then GET /resources?q with same the query but p=2 and pp=5', function() {

			it('returns the last 5 matching results from the previous set', function(done) {
				api.getPromise('/resources?q=' + searchString + '&p=2&pp=5')
				.then(function(res) {
					var searchResults = api.parseBody(res.body);
					assert.equal(searchResults.length, 5);
					for(var i = 0; i < 5; i++) {
						assert.equal(last5Results[i].id, searchResults[i].id);
					}
					done();
				})
				.done();
			});

		});

	});

});
