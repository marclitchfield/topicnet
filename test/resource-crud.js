var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

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

		var postResponse;
		var resource;

		before(function(done) {
			api.post('/resources', { title: 'test resource', url: 'http://example.com', source: 'example.com' }, function(err, res) {
				postResponse = res;
				resource = JSON.parse(postResponse.body);
				done(err);
			});
		})

		it('returns status 200', function() {
			assert.equal(postResponse.statusCode, 200);
		})

		it('returns the resource with a valid generated id', function() {
			assert.ok(resource.id > 0);
		})

		it('returns the resource with the expected title', function() {
			assert.equal(resource.title, 'test resource');
		})

		it('returns the resource with the expected url', function() {
			assert.equal(resource.url, 'http://example.com');
		})

		it('returns the resourse with the exepected source', function() {
			assert.equal(resource.source, 'example.com');
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

		var resPost = api.request();
		var getResponse;
		var resource;

		before(function(done) {
			resPost.postResource(function() {
				api.get('/resources/' + resPost.resource.id, function(err, res) {
					getResponse = res;
					resource = JSON.parse(res.body);
					done();
				});
			})
		})

		it('returns status 200', function() {
			assert.equal(getResponse.statusCode, 200);
		})

		it('returns the resource with the expected id', function() {
			assert.equal(resource.id, resPost.resource.id);
		})

		it('returns the resource with the expected title', function() {
			assert.equal(resource.title, 'test resource');
		})

		it('returns the resource with the expected url', function() {
			assert.equal(resource.url, 'http://example.com');
		})

		it('returns the resourse with the exepected source', function() {
			assert.equal(resource.source, 'example.com');
		})

	})

	describe('PUT /resources/:id', function() {

		var post = api.request();
		var putResponse;
		var resource;

		before(function(done) {
			post.postResource(function() {
				api.put('/resources/' + post.resource.id, 
					{ title: 'updated title', 
						url: 'http://updatedexample.com', 
						source: 'updatedexample.com' },
					function(err, res) {
						putResponse = res;
						resource = JSON.parse(res.body);
						done();
				});
			});
		})

		it('returns status 200', function() {
			assert.equal(putResponse.statusCode, 200);
		})

		it('returns resource with updated title', function() {
			assert.equal(resource.title, 'updated title');
		})

		it('returns resource with updated url', function() {
			assert.equal(resource.url, 'http://updatedexample.com');
		})

		it('returns resource with updated source', function() {
			assert.equal(resource.source, 'updatedexample.com');
		})

		describe('then GET /resources/:id', function() {

			var get = api.request();
			
			before(function(done) {
				get.getResource(post.resource.id, done);
			})

			it('returns resource with updated title', function() {
				assert.equal(get.resource.title, 'updated title');
			})

			it('returns resource with updated url', function() {
				assert.equal(get.resource.url, 'http://updatedexample.com');
			})

			it('returns resource with updated source', function() {
				assert.equal(get.resource.source, 'updatedexample.com');
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

		var post = api.request();

		before(function(done) {
			post.postResource(done);
		})

		describe('without title', function() {
			it('returns status 500 and error message', function(done) {
				api.put('/resources/' + post.resource.id, {}, function(err, res) {
					assert.equal(res.statusCode, 500);
					assert.notEqual(-1, res.body.indexOf('title is required'));
					done();
				});
			})
		})

		describe('without url', function() {
			it('returns status 500 and error message', function(done) {
				api.put('/resources/' + post.resource.id, { title: 'updated resource' }, function(err, res) {
					assert.equal(res.statusCode, 500);
					assert.notEqual(-1, res.body.indexOf('url is required'));
					done();
				});
			})
		})

		describe('without source', function() {
			it('returns status 500 and error message', function(done) {
				api.put('/resources/' + post.resource.id, 
					{ title: 'updated resource', url: 'http://updatedexample.com' }, function(err, res) {
					assert.equal(res.statusCode, 500);
					assert.notEqual(-1, res.body.indexOf('source is required'));
					done();
				});
			})
		})

	})

})
