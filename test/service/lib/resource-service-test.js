var assert = require('assert');
var Q = require('q');
var resourceService = require('../../../service/lib/resource-service');
var StubGraph = require('./graph/stub-graph');
var neo4jGraph = require('../../../service/lib/graph/neo4j-graph');
var RealGraph = require('../../../service/lib/graph/topicnet-graph');
var guid = require('guid');

describe('Resource Service', function() {

	function runResourceServiceTests(graph) {
		var service;

		beforeEach(function() {
			service = resourceService.create(graph);
		});

		describe('when resource exists', function() {

			var resource;

			beforeEach(function(done) {
				graph.resources.create({ title: guid.raw().toLowerCase(), url: guid.raw(), source: guid.raw(), verb: 'read' })
				.done(function(createdResource) {
					resource = createdResource;
					done();
				});
			});

			it('create with duplicate title should return a duplicate error', function(done) {
				service.create({ title: resource.title, url: guid.raw(), source: guid.raw(), verb: 'read' })
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(err) {
					assert.equal('duplicate', err.name);
					done();
				});
			});

			it('create with duplicate url should return a duplicate error', function(done) {
				service.create({ title: guid.raw(), url: resource.url, source: guid.raw(), verb: 'read' })
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(err) {
					assert.equal('duplicate', err.name);
					done();
				});
			});

			it('update should update the resource', function(done) {
				var updateData = { title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'watch'};
				service.update(resource.id, updateData)
				.then(function() {
					return graph.resources.get(resource.id);
				})
				.done(function(retrievedResource) {
					assert.equal(updateData.title, retrievedResource.title);
					assert.equal(updateData.url, retrievedResource.url);
					assert.equal(updateData.source, retrievedResource.source);
					assert.equal(updateData.verb, retrievedResource.verb);
					done();
				});
			});

			it('get should return the resource', function(done) {
				service.get(resource.id)
				.done(function(retrievedResource) {
					assert.deepEqual(resource, retrievedResource);
					done();
				});
			});

			it('search for resource by title should find the resource', function(done) {
				service.searchByTitle(resource.title)
				.done(function(foundResources) {
					assert.equal(1, foundResources.length);
					assert.equal(resource.id, foundResources[0].id);
					done();
				});
			});

			it('search for resource by title with different case should find the resource', function(done) {
				service.searchByTitle(resource.title.toUpperCase())
				.done(function(foundResources) {
					assert.equal(1, foundResources.length);
					assert.equal(resource.id, foundResources[0].id);
					done();
				});
			});

			it('search for resource by url should find the resource', function(done) {
				service.searchByUrl(resource.url)
				.done(function(foundResources) {
					assert.equal(1, foundResources.length);
					assert.equal(resource.id, foundResources[0].id);
					done();
				});
			});

			it('search for resource by partial title should find the resource', function(done) {
				service.search({ q: resource.title.substr(1) })
				.done(function(foundResources) {
					assert.equal(1, foundResources.length);
					assert.equal(resource.id, foundResources[0].id);
					done();
				});
			});

			it('destroy resource deletes the resource', function(done) {
				service.destroy(resource.id)
				.then(function() {
					return graph.resources.get(resource.id);
				})
				.done(function(foundResource) {
					assert.equal(undefined, foundResource);
					done();
				});
			});
		});

		describe('when two resources exist', function() {

			var resource, otherResource;

			beforeEach(function(done) {
				graph.resources.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'read' })
				.then(function(createdResource) {
					resource = createdResource;
					return graph.resources.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'read' });
				})
				.done(function(createdResource) {
					otherResource = createdResource;
					done();
				});
			});

			it('update first resource with title that would be a duplicate returns a duplicate error', function(done) {
				service.update(resource.id, { title: otherResource.title, url: guid.raw(), source: guid.raw(), verb: 'read'})
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(error) {
					assert.equal('duplicate', error.name);
					done();
				});
			});

			it('update first resource with url that would be a duplicate returns a duplicate error', function(done) {
				service.update(resource.id, { title: guid.raw(), url: otherResource.url, source: guid.raw(), verb: 'read'})
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(error) {
					assert.equal('duplicate', error.name);
					done();
				});
			});
		});

		describe('when resource does not already exist', function() {

			it('create should create a new resource', function(done) {
				service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'read' })
				.done(function(createdResource) {
					return graph.resources.get(createdResource.id)
					.then(function(retrievedResource) {
						assert.deepEqual(retrievedResource, createdResource);
						done();
					});
				});
			});

			it('get should return a notfound error', function(done) {
				service.get(99999)
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(err) {
					assert.equal(err.name, 'notfound');
					done();
				});
			});

			it('update should return a notfound error', function(done) {
				service.update(99999, { title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'watch'})
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(err) {
					assert.equal('notfound', err.name);
					done();
				});
			});

			it('search for resource by title should not find the resource', function(done) {
				service.searchByTitle(guid.raw())
				.done(function(foundResources) {
					assert.equal(0, foundResources.length);
					done();
				});
			});

			it('search for resource by url should not find the resource', function(done) {
				service.searchByUrl(guid.raw())
				.done(function(foundResources) {
					assert.equal(0, foundResources.length);
					done();
				});
			});

			it('search for resource by title should not find the resource', function(done) {
				service.searchByTitle(guid.raw())
				.done(function(foundResources) {
					assert.equal(0, foundResources.length);
					done();
				});
			});

			it('destroy resource returns a notfound error', function(done) {
				service.destroy(999999)
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(err) {
					assert.equal('notfound', err.name);
					done();
				});
			});
		});

		describe('when resource is linked to topic', function() {

			var resource;

			beforeEach(function(done) {
				graph.topics.create({ name: guid.raw() })
				.then(function(createdTopic) {
					return graph.resources.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'read' })
					.then(function(createdResource) {
						resource = createdResource;
						return graph.relationships.create(createdTopic.id, createdResource.id, 'resources');
					});
				})
				.done(function() {
					done();
				});
			});

			it('destroy resource returns an error', function(done) {
				service.destroy(resource.id)
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(err) {
					assert.equal('cannot delete resource because it still has relationships', err);
					done();
				});
			});
		});

		describe('when resource is missing required property', function() {

			describe('title', function() {
				it('create should return an error', function(done) {
					service.create({ url: guid.raw(), source: guid.raw(), verb: 'read' })
					.done(function() {
						assert.ok(false, 'should have failed');
						done();
					}, function(err) {
						assert.equal('title is required', err);
						done();
					});
				});

				it('update should return an error', function(done) {
					service.update(99999, { url: guid.raw(), source: guid.raw(), verb: 'watch' })
					.done(function() {
						assert.ok(false, 'should have failed');
						done();
					}, function(err) {
						assert.equal('title is required', err);
						done();
					});
				});
			});

			describe('url', function() {
				it('create should return an error', function(done) {
					service.create({ title: guid.raw(), source: guid.raw(), verb: 'read' })
					.done(function() {
						assert.ok(false, 'should have failed');
						done();
					}, function(err) {
						assert.equal('url is required', err);
						done();
					});
				});

				it('update should return an error', function(done) {
					service.update(99999, { title: guid.raw(), source: guid.raw(), verb: 'watch' })
					.done(function() {
						assert.ok(false, 'should have failed');
						done();
					}, function(err) {
						assert.equal('url is required', err);
						done();
					});
				});
			});

			describe('source', function() {
				it('create should return an error', function(done) {
					service.create({ title: guid.raw(), url: guid.raw(), verb: 'read' })
					.done(function() {
						assert.ok(false, 'should have failed');
						done();
					}, function(err) {
						assert.equal('source is required', err);
						done();
					});
				});

				it('udpate should return an error', function(done) {
					service.update(99999,{ title: guid.raw(), url: guid.raw(), verb: 'watch' })
					.done(function() {
						assert.ok(false, 'should have failed');
						done();
					}, function(err) {
						assert.equal('source is required', err);
						done();
					});
				});
			});

			describe('verb', function() {
				it('create should return an error', function(done) {
					service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw() })
					.done(function() {
						assert.ok(false, 'should have failed');
						done();
					}, function(err) {
						assert.equal('verb is required', err);
						done();
					});
				});

				it('update should return an error', function(done) {
					service.update(99999,{ title: guid.raw(), url: guid.raw(), source: guid.raw() })
					.done(function() {
						assert.ok(false, 'should have failed');
						done();
					}, function(err) {
						assert.equal('verb is required', err);
						done();
					});
				});
			});
		});

		describe('when resource has an invalid verb', function() {

			it('create returns invalid verb error', function(done) {
				service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'invalid' })
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(err) {
					assert.equal('invalid verb', err);
					done();
				});
			});

			it('update returns invalid verb error', function(done) {
				service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'invalid' })
				.done(function() {
					assert.ok(false, 'should have failed');
					done();
				}, function(err) {
					assert.equal('invalid verb', err);
					done();
				});
			});

		});
	}

	if (!process.env.TOPICNET_SKIP_INTEGRATION) {
		describe('with real graph', function() {
			runResourceServiceTests(RealGraph.create(neo4jGraph));
		});
	}

	describe('with stub graph', function() {
		runResourceServiceTests(StubGraph.create());
	});
});