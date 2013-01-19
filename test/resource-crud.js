var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');

describe('Resource CRUD', function() {

	describe('POST to /resources without title', function() {
		it('returns status 500 and error message', function(done) {
			api.postPromise('/resources', {})
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
			api.postPromise('/resources', { title: 'test resource ' + guid.raw() })
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
			api.postPromise('/resources', { title: 'test resource ' + guid.raw() , url: 'http://example.com/' + guid.raw() })
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
			api.postPromise('/resources', { title: 'test resource', url: 'http://example/com', source: 'example.com' })
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
			api.postPromise('/resources', { title: 'test resource ' + guid.raw(),
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

		var p = api.request();

		before(function(done) {
			p.postResourcePromise()
			.then(function() {
				done();	
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(p.response.statusCode, 200);
		});

		it('returns the resource with a valid generated id', function() {
			assert.ok(p.returnedResource.id > 0);
		});

		it('returns the resource with the expected title', function() {
			assert.equal(p.returnedResource.title, p.postedResource.title);
		});

		it('returns the resource with the expected url', function() {
			assert.equal(p.returnedResource.url, p.postedResource.url);
		});

		it('returns the resourse with the exepected source', function() {
			assert.equal(p.returnedResource.source, p.postedResource.source);
		});

		it('returns the resource with the expected verb', function() {
			assert.equal(p.returnedResource.verb, p.postedResource.verb);
		});

	});

	describe('POST to /resources with duplicate title', function() {

		var p = api.request();
		var duplicatePostResults;

		before(function(done) {
			p.postResourcePromise()
			.then(function() {
				return api.postPromise('/resources', { title: p.postedResource.title,
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

		var p = api.request();
		var duplicatePostResults;

		before(function(done) {
			p.postResourcePromise()
			.then(function() {
				return api.postPromise('/resources', { title: 'unique title ' + guid.raw(),
					url: p.postedResource.url,
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
			api.getPromise('/resources/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('GET /resources/:id with valid id', function() {

		var p = api.request();
		var g = api.request();

		before(function(done) {
			p.postResourcePromise()
			.then(function() {
				return g.getResourcePromise(p.returnedResource.id);
			})
			.then(function() {
				done();
			})
			.done();
		});

		it('returns status 200', function() {
			assert.equal(g.response.statusCode, 200);
		});

		it('returns the resource with the expected id', function() {
			assert.equal(g.returnedResource.id, p.returnedResource.id);
		});

		it('returns the resource with the expected title', function() {
			assert.equal(g.returnedResource.title, p.postedResource.title);
		});

		it('returns the resource with the expected url', function() {
			assert.equal(g.returnedResource.url, p.postedResource.url);
		});

		it('returns the resourse with the exepected source', function() {
			assert.equal(g.returnedResource.source, p.postedResource.source);
		});

		it('returns the resourse with the exepected verb', function() {
			assert.equal(g.returnedResource.verb, p.postedResource.verb);
		});

	});

	describe('PUT /resources/:id with valid data', function() {

		var p = api.request();
		var resourceUpdate = { title: 'updated ' + guid.raw(), 
			url: 'http://updatedexample.com/' + guid.raw(),
			source: 'updatedexample.com',
			verb: 'engage' };
		var putResponse;
		var returnedResource;

		before(function(done) {
			p.postResourcePromise()
			.then(function() {
				return api.putPromise('/resources/' + p.returnedResource.id, resourceUpdate);
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

			var g = api.request();
			
			before(function(done) {
				g.getResourcePromise(p.returnedResource.id)
				.then(function() {
					done();
				})
				.done();
			});

			it('returns resource with updated title', function() {
				assert.equal(g.returnedResource.title, resourceUpdate.title);
			});

			it('returns resource with updated url', function() {
				assert.equal(g.returnedResource.url, resourceUpdate.url);
			});

			it('returns resource with updated source', function() {
				assert.equal(g.returnedResource.source, resourceUpdate.source);
			});

			it('returns resource with updated verb', function() {
				assert.equal(g.returnedResource.verb, resourceUpdate.verb);
			});

		});

	});

	describe('PUT /resources/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.putPromise('/resources/-9999999', {})
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();
			})
			.done();
		});

	});

	describe('PUT /resources/:id without required attributes', function() {

		var p = api.request();

		before(function(done) {
			p.postResourcePromise()
			.then(function() {
				done();
			})
			.done();
		});

		describe('without title', function() {
			it('returns status 500 and error message', function(done) {
				api.putPromise('/resources/' + p.returnedResource.id, {})
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
				api.putPromise('/resources/' + p.returnedResource.id, { title: 'updated resource ' + guid.raw() })
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
				api.putPromise('/resources/' + p.returnedResource.id, 
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
				api.putPromise('/resources/' + p.returnedResource.id, 
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

		var p = api.request();

		before(function(done) {
			p.postResourcePromise()
			.then(done)
			.done();
		});

		it('returns status 500 and an appropriate error message', function(done) {
			api.putPromise('/resources/' + p.returnedResource.id,
				{ title: p.postedResource.title, 
					url: p.postedResource.url,
					source: p.postedResource.source,
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
		
		var p1 = api.request();
		var p2 = api.request();
		var duplicatePutResults;

		before(function(done) {
			p1.postResourcePromise()
			.then(function() {
				return p2.postResourcePromise();
			})
			.then(function() {
				return api.putPromise('/resources/' + p2.returnedResource.id,
					{ title: p1.postedResource.title, 
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
		
		var p1 = api.request();
		var p2 = api.request();
		var duplicatePutResults;

		before(function(done) {
			p1.postResourcePromise()
			.then(function() {
				return p2.postResourcePromise();
			})
			.then(function() {
				return api.putPromise('/resources/' + p2.returnedResource.id,
					{ title: 'unique title ' + guid.raw(), 
						url: p1.postedResource.url,
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
			api.delPromise('/resources/-9999999')
			.then(function(res) {
				assert.equal(res.statusCode, 404);
				done();	
			})
			.done();
		});

	});

	describe('DELETE /resources/:id where resource is associated with topic', function() {
		
		var pTopic = api.request();
		var pResource = api.request();
		var delResponse;		

		before(function(done) {
			pTopic.postTopicPromise()
			.then(function() {
				return pResource.postResourcePromise();
			})
			.then(function() {
				return api.postPromise('/topics/' + pTopic.returnedTopic.id + '/resources',
					{ resid: pResource.returnedResource.id });
			})
			.then(function(res) {
				return api.delPromise('/resources/' + pResource.returnedResource.id);
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
				api.getPromise('/resources/' + pResource.returnedResource.id)
				.then(function(res) {
					var resource = api.parseBody(res.body);
					assert.equal(resource.id, pResource.returnedResource.id);
					done();
				})
				.done();
			});

		});

		describe('then GET /topic/:id that the resource was attatched to', function() {

			it('returns the topic including the not deleted resource', function(done) {
				var g = api.request();
				g.getTopicPromise(pTopic.returnedTopic.id)
				.then(function() {
					assert.ok(_.any(g.returnedTopic.resources, function(r) {
							return r.id === pResource.returnedResource.id;
						}));
					done();		
				})
				.done();
			});

		});

	});

	describe('DELETE /resources/:id with no associatons', function() {

		var p = api.request();

		before(function(done) {
			p.postResourcePromise()
			.then(done)
			.done();
		});

		it('returns status 200', function(done) {
			api.delPromise('/resources/' + p.returnedResource.id)
			.then(function(res) {
				assert.equal(res.statusCode, 200);
				done();
			})
			.done();
		});

		describe('then GET /resources/:id with the deleted resource id', function() {

			it('returns status 404', function(done) {
				api.getPromise('/resources/' + p.returnedResource.id)
				.then(function(res) {
					assert.equal(res.statusCode, 404);
					done();
				})
				.done();
			});

		});

	});

});
