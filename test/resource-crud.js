var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');

describe('Resource CRUD', function() {

	describe('POST /resources without title', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', {}, function(err, res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('title is required'));
				done();
			});
		})
	})

	describe('POST /resources without url', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', { title: 'test resource' }, function(err, res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('url is required'));
				done();
			});
		})
	})

	describe('POST /resources without source', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', { title: 'test resource', url: 'http://example.com' }, function(err, res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('source is required'));
				done();
			});
		})
	})

	describe('POST /resources with valid data', function() {

		var p = api.request();

		before(function(done) {
			p.postResource(done);
		})

		it('returns status 200', function() {
			assert.equal(p.response.statusCode, 200);
		})

		it('returns the resource with a valid generated id', function() {
			assert.ok(p.returnedResource.id > 0);
		})

		it('returns the resource with the expected title', function() {
			assert.equal(p.returnedResource.title, p.postedResource.title);
		})

		it('returns the resource with the expected url', function() {
			assert.equal(p.returnedResource.url, p.postedResource.url);
		})

		it('returns the resourse with the exepected source', function() {
			assert.equal(p.returnedResource.source, p.postedResource.source);
		})

	})

	describe('GET /resources/:id with invalid id', function() {
		
		it('returns status 404', function(done) {
			api.get('/resources/-9999999', function(err, res) {
				assert.equal(res.statusCode, 404);
				done(err);
			});
		})

	})

	describe('GET /resources/:id with valid id', function() {

		var p = api.request();
		var g = api.request();

		before(function(done) {
			p.postResource(function() {
				g.getResource(p.returnedResource.id, done);
			});
		})

		it('returns status 200', function() {
			assert.equal(g.response.statusCode, 200);
		})

		it('returns the resource with the expected id', function() {
			assert.equal(g.returnedResource.id, p.returnedResource.id);
		})

		it('returns the resource with the expected title', function() {
			assert.equal(g.returnedResource.title, p.postedResource.title);
		})

		it('returns the resource with the expected url', function() {
			assert.equal(g.returnedResource.url, p.postedResource.url);
		})

		it('returns the resourse with the exepected source', function() {
			assert.equal(g.returnedResource.source, p.postedResource.source);
		})

	})

	describe('PUT /resources/:id', function() {

		var p = api.request();
		var resourceUpdate = { title: 'updated ' + guid.raw(), 
			url: 'http://updatedexample.com/' + guid.raw(),
			source: 'updatedexample.com' };
		var putResponse;
		var returnedResource;

		before(function(done) {
			p.postResource(function() {
				api.put('/resources/' + p.returnedResource.id,
					resourceUpdate,
					function(err, res) {
						putResponse = res;
						returnedResource = JSON.parse(res.body);
						done();
				});
			});
		})

		it('returns status 200', function() {
			assert.equal(putResponse.statusCode, 200);
		})

		it('returns resource with updated title', function() {
			assert.equal(returnedResource.title, resourceUpdate.title);
		})

		it('returns resource with updated url', function() {
			assert.equal(returnedResource.url, resourceUpdate.url);
		})

		it('returns resource with updated source', function() {
			assert.equal(returnedResource.source, resourceUpdate.source);
		})

		describe('then GET /resources/:id', function() {

			var g = api.request();
			
			before(function(done) {
				g.getResource(p.returnedResource.id, done);
			})

			it('returns resource with updated title', function() {
				assert.equal(g.returnedResource.title, resourceUpdate.title);
			})

			it('returns resource with updated url', function() {
				assert.equal(g.returnedResource.url, resourceUpdate.url);
			})

			it('returns resource with updated source', function() {
				assert.equal(g.returnedResource.source, resourceUpdate.source);
			})

		})

	})

	describe('PUT /resources/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.put('/resources/-9999999', {}, function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
			});
		})

	})

	describe('PUT /resources/:id without required attributes', function() {

		var p = api.request();

		before(function(done) {
			p.postResource(done);
		})

		describe('without title', function() {
			it('returns status 500 and error message', function(done) {
				api.put('/resources/' + p.returnedResource.id, {}, function(err, res) {
					assert.equal(res.statusCode, 500);
					assert.notEqual(-1, res.body.indexOf('title is required'));
					done();
				});
			})
		})

		describe('without url', function() {
			it('returns status 500 and error message', function(done) {
				api.put('/resources/' + p.returnedResource.id, { title: 'updated resource ' + guid.raw() }, function(err, res) {
					assert.equal(res.statusCode, 500);
					assert.notEqual(-1, res.body.indexOf('url is required'));
					done();
				});
			})
		})

		describe('without source', function() {
			it('returns status 500 and error message', function(done) {
				api.put('/resources/' + p.returnedResource.id, 
					{ title: 'updated resource ' + guid.raw(), url: 'http://updatedexample.com/' + guid.raw() }, function(err, res) {
					assert.equal(res.statusCode, 500);
					assert.notEqual(-1, res.body.indexOf('source is required'));
					done();
				});
			})
		})

	})

})
