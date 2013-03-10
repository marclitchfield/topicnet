var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');

var postAndLinkTopicAndResource = function() {
	var result = {};
	return api.postTopic()
	.then(function(res) {
		result.postTopic = res;
		return api.postResource();
	})
	.then(function(res) {
		result.postResource = res;
		return api.post('/topics/' + result.postTopic.returnedData.id + '/resources',
			{ resid: result.postResource.returnedData.id });
	})
	.then(function(res) {
		result.response = res;
		return result;
	});
};

describe('Resource CRUD', function() {

	describe('POST to /resources without title', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', {})
			.then(function(res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('title is required'));
				done();
			})
			.done();
		});
	});

	describe('POST to /resources without url', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', { title: 'test resource ' + guid.raw() })
			.then(function(res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('url is required'));
				done();
			})
			.done();
		});
	});

	describe('POST to /resources without source', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', { title: 'test resource ' + guid.raw() , url: 'http://example.com/' + guid.raw() })
			.then(function(res) {	
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('source is required'));
				done();
			})
			.done();
		});
	});

	describe('POST to /resources without verb', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', { title: 'test resource', url: 'http://example/com', source: 'example.com' })
			.then(function(res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('verb is required'));
				done();
			})
			.done();
		});
	});

	describe('POST to /resources with invalid verb', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/resources', { title: 'test resource ' + guid.raw(),
				url: 'http://example.com/' + guid.raw(), 
				source: 'example.com',
				verb: 'invalid' })
			.then(function(res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('invalid verb'));
				done();
			})
			.done();
		});
	});

	describe('POST to /resources with valid data', function() {

		var postResource;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postResource = res;
				done();	
			})
			.done();
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

	describe('POST to /resources with duplicate title', function() {

		var postResource;
		var duplicatePostResults;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postResource = res;
				return api.post('/resources', { title: postResource.postedData.title,
					url: 'http://uniqueurl/' + guid.raw(),
					source: 'example.com', verb: 'read' });
			})
			.then(function(res) {
				duplicatePostResults = res;
				done();
			})
			.done();
		});

		it('returns status 400', function() {
			assert.equal(duplicatePostResults.statusCode, 400);
		});

		it('returns an appropriate error message', function() {
			assert.notEqual(-1, duplicatePostResults.body.indexOf('A resource with the specified title already exists'));
		});

	});

	describe('POST to /resources with duplicate url', function() {

		var postResource;
		var duplicatePostResults;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postResource = res;
				return api.post('/resources', { title: 'unique title ' + guid.raw(),
					url: postResource.postedData.url,
					source: 'example.com', verb: 'read' });
			})
			.then(function(res) {
				duplicatePostResults = res;
				done();
			})
			.done();
		});

		it('returns status 400', function() {
			assert.equal(duplicatePostResults.statusCode, 400);
		});

		it('returns an appropriate error message', function() {
			assert.notEqual(-1, duplicatePostResults.body.indexOf('A resource with the specified url already exists'));
		});

	});

	describe('GET /resources/:id with invalid id', function() {
		
		it('returns status 404', function(done) {
			api.get('/resources/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('GET /resources/:id with valid id', function() {

		var postResource;
		var getResource;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postResource = res;
				return api.getResource(postResource.returnedData.id);
			})
			.then(function(res) {
				getResource = res;
				done();
			})
			.done();
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

		var p = api.request();
		var postResource;
		var resourceUpdate = { title: 'updated ' + guid.raw(), 
			url: 'http://updatedexample.com/' + guid.raw(),
			source: 'updatedexample.com',
			verb: 'engage' };
		var putResponse;
		var returnedResource;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postResource = res;
				return api.put('/resources/' + postResource.returnedData.id, resourceUpdate);
			})
			.then(function(res) {
				putResponse = res;
				returnedResource = api.parseBody(res.body);
				done();
			})
			.done();
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
			
			before(function(done) {
				api.getResource(postResource.returnedData.id)
				.then(function(res) {
					getResource = res;
					done();
				})
				.done();
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

	describe('PUT /resources/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.put('/resources/-9999999', {})
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('PUT /resources/:id without required attributes', function() {

		var postResource;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postResource = res;
				done();
			})
			.done();
		});

		describe('without title', function() {
			it('returns status 500 and error message', function(done) {
				api.put('/resources/' + postResource.returnedData.id, {})
				.then(function(res) {
					assert.equal(res.statusCode, 500);
					assert.notEqual(-1, res.body.indexOf('title is required'));
					done();
				})
				.done();
			});
		});

		describe('without url', function() {
			it('returns status 500 and error message', function(done) {
				api.put('/resources/' + postResource.returnedData.id, { title: 'updated resource ' + guid.raw() })
				.then(function(res) {
					assert.equal(res.statusCode, 500);
					assert.notEqual(-1, res.body.indexOf('url is required'));
					done();
				})
				.done();
			});
		});

		describe('without source', function() {
			it('returns status 500 and error message', function(done) {
				api.put('/resources/' + postResource.returnedData.id, 
					{ title: 'updated resource ' + guid.raw(), url: 'http://updatedexample.com/' + guid.raw() })
				.then(function(res) {
					assert.equal(res.statusCode, 500);
					assert.notEqual(-1, res.body.indexOf('source is required'));
					done();
				})
				.done();
			});
		});
		
		describe('without verb', function() {
			it('returns status 500 and error message', function(done) {
				api.put('/resources/' + postResource.returnedData.id, 
					{ title: 'updated resource ' + guid.raw(), 
						url: 'http://updatedexample.com/' + guid.raw(),
						source: 'updatedsource.com' }) 
				.then(function(res) {
					assert.equal(res.statusCode, 500);
					assert.notEqual(-1, res.body.indexOf('verb is required'));
					done();
				})
				.done();
			});
		});

	});

	describe('PUT /resources/:id with an invalid verb', function() {

		var postResource;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postResource = res;
				done();	
			})
			.done();
		});

		it('returns status 500 and an appropriate error message', function(done) {
			api.put('/resources/' + postResource.returnedData.id,
				{ title: postResource.postedData.title, 
					url: postResource.postedData.url,
					source: postResource.postedData.source,
					verb: 'invalid' })
			.then(function(res) {
				assert.equal(res.statusCode, 500);
				assert.notEqual(-1, res.body.indexOf('invalid verb'));
				done();
			})
			.done();
		});

	});

	describe('PUT /resources/:id with a title that would be a duplicate', function() {
		
		var postResource;
		var postOtherResource;
		var duplicatePutResults;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postResource = res;
				return api.postResource();
			})
			.then(function(res) {
				postOtherResource = res;
				return api.put('/resources/' + postOtherResource.returnedData.id,
					{ title: postResource.postedData.title, 
						url: 'http://uniqueurl/' + guid.raw(),
						source: 'example.com', verb: 'read' });
			})
			.then(function(res) {
				duplicatePutResults = res;
				done();
			})
			.done();
		});

		it('returns status 400', function() {
			assert.equal(duplicatePutResults.statusCode, 400);
		});

		it('returns an appropriate error message', function() {
			assert.notEqual(-1, duplicatePutResults.body.indexOf('Another resource exists with the specified title'));
		});

	});

	describe('PUT /resources/:id with a url that would be a duplicate', function() {
		
		var postResource;
		var postOtherResource;
		var duplicatePutResults;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postResource = res;
				return api.postResource();
			})
			.then(function(res) {
				postOtherResource = res;
				return api.put('/resources/' + postOtherResource.returnedData.id,
					{ title: 'unique title ' + guid.raw(), 
						url: postResource.postedData.url,
						source: 'example.com', verb: 'read' });
			})
			.then(function(res) {
				duplicatePutResults = res;
				done();
			})
			.done();
		});

		it('returns status 400', function() {
			assert.equal(duplicatePutResults.statusCode, 400);
		});

		it('returns an appropriate error message', function() {
			assert.notEqual(-1, duplicatePutResults.body.indexOf('Another resource exists with the specified url'));
		});

	});

	describe('DELETE /resources/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.del('/resources/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();	
			})
			.done();
		});

	});

	describe('DELETE /resources/:id where resource is associated with topic', function() {
		
		var postTopic;
		var postResource;
		var delResponse;		

		before(function(done) {
			postAndLinkTopicAndResource()
			.then(function(res) {
				postTopic = res.postTopic;
				postResource = res.postResource;
				return api.del('/resources/' + postResource.returnedData.id);
			})
			.then(function(res) {
				delResponse = res;
				done();
			})
			.done();
		});

		it('returns status 500', function() {
			assert.equal(delResponse.statusCode, 500);
		});

		describe('then GET /resources/:id', function() {

			it('returns the resource', function(done) {
				api.get('/resources/' + postResource.returnedData.id)
				.then(function(res) {
					var resource = api.parseBody(res.body);
					assert.equal(resource.id, postResource.returnedData.id);
					done();
				})
				.done();
			});

		});

		describe('then GET /topic/:id that the resource was attatched to', function() {

			it('returns the topic including the not deleted resource', function(done) {
				api.getTopic(postTopic.returnedData.id)
				.then(function(getTopic) {
					assert.ok(_.any(getTopic.returnedData.resources, function(r) {
							return r.id === postResource.returnedData.id;
						}));
					done();		
				})
				.done();
			});

		});

	});

	describe('DELETE /resources/:id with no associatons', function() {

		var postResource;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postResource = res;
				done();	
			})
			.done();
		});

		it('returns status 200', function(done) {
			api.del('/resources/' + postResource.returnedData.id)
			.then(function(res) {
				assert.equal(res.statusCode, 200);
				done();
			})
			.done();
		});

		describe('then GET /resources/:id with the deleted resource id', function() {

			it('returns status 404', function(done) {
				api.get('/resources/' + postResource.returnedData.id)
				.then(function(res) {
					assert.equal(res.statusCode, 404);
					done();
				})
				.done();
			});

		});

	});

});
