var assert = require('assert');
var Q = require('q');
var resourceService = require('../../../service/lib/resource-service');
var StubGraph = require('./stub-graph');

describe('Resource Service', function() {

	var graph, service;

	beforeEach(function() {
		graph = StubGraph.create();
		service = resourceService.createService(undefined, graph);
	});

	describe('when resource exists', function() {

		var resource;

		beforeEach(function(done) {
			graph.resources.create({ title: 'title', url: 'url', source: 'source', verb: 'read' })
			.then(function(createdResource) {
				resource = createdResource;
				done();
			})
			.done();
		});

		it('create should return a duplicate error', function(done) {
			service.create({ title: 'title', url: 'url', source: 'source', verb: 'read' })
			.fail(function(err) {
				assert.equal('duplicate', err.name);
				done();
			})
			.done();
		});

		it('update should update the resource', function(done) {
			service.update(resource.id, { title: 'updated-title', url: 'updated-url', source: 'updated-source', verb: 'watch'})
			.then(function() {
				return graph.resources.get(resource.id);
			})
			.then(function(retrievedResource) {
				assert.equal('updated-title', retrievedResource.title);
				assert.equal('updated-url', retrievedResource.url);
				assert.equal('updated-source', retrievedResource.source);
				assert.equal('watch', retrievedResource.verb);
				done();
			})
			.done();
		});

		it('get should return the resource', function(done) {
			service.get(resource.id)
			.then(function(retrievedResource) {
				assert.deepEqual(resource, retrievedResource);
				done();
			})
			.done();
		});

		it('search for resource by title should find the resource', function(done) {
			service.searchByTitle(resource.title)
			.then(function(foundResources) {
				assert.equal(1, foundResources.length);
				assert.equal(resource.id, foundResources[0].id);
				done();
			})
			.done();
		});

		it('search for resource by url should find the resource', function(done) {
			service.searchByUrl(resource.url)
			.then(function(foundResources) {
				assert.equal(1, foundResources.length);
				assert.equal(resource.id, foundResources[0].id);
				done();
			})
			.done();
		});

		it('search for resource by partial title should find the resource', function(done) {
			service.search({ q: 'itl'})
			.then(function(foundResources) {
				assert.equal(1, foundResources.length);
				assert.equal(resource.id, foundResources[0].id);
				done();
			})
			.done();
		});

		it('delete resource deletes the resource', function(done) {
			service.deleteResource(resource.id)
			.then(function() {
				return graph.resources.get(resource.id);
			})
			.then(function(foundResource) {
				assert.equal(undefined, foundResource);
				done();
			})
			.done();
		});
	});

	describe('when resource does not already exist', function() {
		
		it('create should create a new resource', function(done) {
			service.create({ title: 'title', url: 'url', source: 'source', verb: 'read' })
			.then(function(createdResource) {
				return graph.resources.get(createdResource.id)
				.then(function(retrievedResource) {
					assert.deepEqual(retrievedResource, createdResource);
					done();
				});
			})
			.done();
		});

		it('get should return a notfound error', function(done) {
			service.get(99999)
			.fail(function(err) {
				assert.equal(err.name, 'notfound');
				done();
			})
			.done();
		});

		it('update should return a notfound error', function(done) {
			service.update(99999, { title: 'updated-title', url: 'updated-url', source: 'updated-source', verb: 'watch'})
			.fail(function(err) {
				assert.equal('notfound', err.name);
				done();
			})
			.done();
		});

		it('search for resource by title should not find the resource', function(done) {
			service.searchByTitle({ q: 'search-title' })
			.then(function(foundResources) {
				assert.equal(0, foundResources.length);
				done();
			})
			.done();
		});

		it('search for resource by url should not find the resource', function(done) {
			service.searchByUrl({ q: 'search-url' })
			.then(function(foundResources) {
				assert.equal(0, foundResources.length);
				done();
			})
			.done();
		});

		it('search for resource by partial title should not find the resource', function(done) {
			service.search({ q: 'itl'})
			.then(function(foundResources) {
				assert.equal(0, foundResources.length);
				done();
			})
			.done();
		});

		it('delete resource returns a notfound error', function(done) {
			service.deleteResource(999999)
			.fail(function(err) {
				assert.equal('notfound', err.name);
				done();
			})
			.done();
		});
	});

	describe('when resource is linked to topic', function() {
		
		var resource;

		beforeEach(function(done) {
			graph.topics.create()
			.then(function(createdTopic) {
				return graph.resources.create()
				.then(function(createdResource) {
					resource = createdResource;
					return graph.relationships.create(createdTopic.id, createdResource.id, 'resources');
				});
			})
			.then(function() {
				done();
			})
			.done();
		});

		it('delete resource returns an error', function(done) {
			service.deleteResource(resource.id)
			.fail(function(err) {
				assert.equal('cannot delete resource because it still has relationships', err);
				done();
			})
			.done();
		});
	});

	describe('when resource is missing required property', function() {

		describe('title', function() {
			it('create should return an error', function(done) {
				service.create({ url: 'url', source: 'source', verb: 'read' })
				.fail(function(err) {
					assert.equal('title is required', err);
					done();
				})
				.done();
			});

			it('update should return an error', function(done) {
				service.update(99999, { url: 'updated-url', source: 'updated-source', verb: 'watch' })
				.fail(function(err) {
					assert.equal('title is required', err);
					done();
				})
				.done();
			});
		});

		describe('url', function() {
			it('create should return an error', function(done) {
				service.create({ title: 'title', source: 'source', verb: 'read' })
				.fail(function(err) {
					assert.equal('url is required', err);
					done();
				})
				.done();
			});

			it('update should return an error', function(done) {
				service.update(99999, { title: 'updated-title', source: 'updated-source', verb: 'watch' })
				.fail(function(err) {
					assert.equal('url is required', err);
					done();
				})
				.done();
			});
		});

		describe('source', function() {
			it('create should return an error', function(done) {
				service.create({ title: 'title', url: 'url', verb: 'read' })
				.fail(function(err) {
					assert.equal('source is required', err);
					done();
				})
				.done();
			});

			it('udpate should return an error', function(done) {
				service.update(99999,{ title: 'updated-title', url: 'updated-url', verb: 'watch' })
				.fail(function(err) {
					assert.equal('source is required', err);
					done();
				})
				.done();
			});
		});

		describe('verb', function() {
			it('create should return an error', function(done) {
				service.create({ title: 'title', url: 'url', source: 'source' })
				.fail(function(err) {
					assert.equal('verb is required', err);
					done();
				})
				.done();
			});

			it('update should return an error', function(done) {
				service.update(99999,{ title: 'updated-title', url: 'updated-url', source: 'updated-source' })
				.fail(function(err) {
					assert.equal('verb is required', err);
					done();
				})
				.done();
			});
		});
	});
});