var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');
require('../test-utils');

describe('Resource CRUD', function() {

	describe('GET /resources/:id with invalid id', function() {

		it('returns status 404', function() {
			return api.get('/resources/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
			});
		});

	});

	describe('POST to /resources with valid data', function() {

		var postResource;

		before(function() {
			return api.postResource()
			.then(function(res) {
				postResource = res;
			});
		});

		it('returns status 200', function() {
			assert.equal(postResource.response.statusCode, 200);
		});

		it('returns the resource with a valid generated id', function() {
			assert.ok(postResource.returnedData.id > 0);
		});

		it('returns the resource with the expected title', function() {
			assert.equal(postResource.returnedData.title, postResource.postedData.title);
		});

		it('returns the resource with the expected url', function() {
			assert.equal(postResource.returnedData.url, postResource.postedData.url);
		});

		it('returns the resourse with the exepected source', function() {
			assert.equal(postResource.returnedData.source, postResource.postedData.source);
		});

		it('returns the resource with the expected verb', function() {
			assert.equal(postResource.returnedData.verb, postResource.postedData.verb);
		});

	});

	describe('GET /resources/:id with valid id', function() {

		var postResource;
		var getResource;

		before(function() {
			return api.postResource()
			.then(function(res) {
				postResource = res;
				return api.getResource(postResource.returnedData.id);
			})
			.then(function(res) {
				getResource = res;
			});
		});

		it('returns status 200', function() {
			assert.equal(getResource.response.statusCode, 200);
		});

		it('returns the resource with the expected id', function() {
			assert.equal(getResource.returnedData.id, postResource.returnedData.id);
		});

		it('returns the resource with the expected title', function() {
			assert.equal(getResource.returnedData.title, postResource.postedData.title);
		});

		it('returns the resource with the expected url', function() {
			assert.equal(getResource.returnedData.url, postResource.postedData.url);
		});

		it('returns the resourse with the exepected source', function() {
			assert.equal(getResource.returnedData.source, postResource.postedData.source);
		});

		it('returns the resourse with the exepected verb', function() {
			assert.equal(getResource.returnedData.verb, postResource.postedData.verb);
		});

	});

	describe('PUT /resources/:id with valid data', function() {

		var postResource;
		var resourceUpdate = { title: 'updated ' + guid.raw(),
			url: 'http://updatedexample.com/' + guid.raw(),
			source: 'updatedexample.com',
			verb: 'engage' };
		var putResponse;
		var returnedResource;

		before(function() {
			return api.postResource()
			.then(function(res) {
				postResource = res;
				return api.put('/resources/' + postResource.returnedData.id, resourceUpdate);
			})
			.then(function(res) {
				putResponse = res;
				returnedResource = api.parseBody(res.body);
			});
		});

		it('returns status 200', function() {
			assert.equal(putResponse.statusCode, 200);
		});

		it('returns resource with updated title', function() {
			assert.equal(returnedResource.title, resourceUpdate.title);
		});

		it('returns resource with updated url', function() {
			assert.equal(returnedResource.url, resourceUpdate.url);
		});

		it('returns resource with updated source', function() {
			assert.equal(returnedResource.source, resourceUpdate.source);
		});

		it('returns resource with updated verb', function() {
			assert.equal(returnedResource.verb, resourceUpdate.verb);
		});

		describe('then GET /resources/:id', function() {

			var getResource;

			before(function() {
				return api.getResource(postResource.returnedData.id)
				.then(function(res) {
					getResource = res;
				});
			});

			it('returns resource with updated title', function() {
				assert.equal(getResource.returnedData.title, resourceUpdate.title);
			});

			it('returns resource with updated url', function() {
				assert.equal(getResource.returnedData.url, resourceUpdate.url);
			});

			it('returns resource with updated source', function() {
				assert.equal(getResource.returnedData.source, resourceUpdate.source);
			});

			it('returns resource with updated verb', function() {
				assert.equal(getResource.returnedData.verb, resourceUpdate.verb);
			});

		});

	});

	describe('DELETE /resources/:id with no associatons', function() {

		var postResource;

		before(function() {
			return api.postResource()
			.then(function(res) {
				postResource = res;
			});
		});

		it('returns status 200', function() {
			return api.del('/resources/' + postResource.returnedData.id)
			.then(function(res) {
				assert.equal(res.statusCode, 200);
			});
		});

		describe('then GET /resources/:id with the deleted resource id', function() {

			it('returns status 404', function() {
				return api.get('/resources/' + postResource.returnedData.id)
				.then(function(res) {
					assert.equal(res.statusCode, 404);
				});
			});

		});

	});

});
