var assert = require('assert');
var Q = require('q');
var resourceService = require('../../../service/lib/resource-service');
var StubGraph = require('./graph/stub-graph');
var neo4jGraph = require('../../../service/lib/graph/neo4j-graph');
var RealGraph = require('../../../service/lib/graph/topicnet-graph');
var guid = require('guid');
require('../test-utils');

describe('Resource Service', function() {

	function runResourceServiceTests(graph) {
		var service, user;

		beforeEach(function() {
			service = resourceService.create(graph);

			return graph.users.create({ email: guid.raw() })
			.then(function(createdUser) {
				user = createdUser;
			});
		});

		describe('when resource exists', function() {

			var resource;

			beforeEach(function() {
				return graph.resources.create({ title: guid.raw().toLowerCase(), url: guid.raw(), source: guid.raw(), verb: 'read' })
				.then(function(createdResource) {
					resource = createdResource;
				});
			});

			it('create with duplicate title should return a duplicate error', function() {
				return service.create({ title: resource.title, url: guid.raw(), source: guid.raw(), verb: 'read' })
				.then(assert.expectFail, function(err) {
					assert.equal('duplicate', err.name);
				});
			});

			it('create with duplicate url should return a duplicate error', function() {
				return service.create({ title: guid.raw(), url: resource.url, source: guid.raw(), verb: 'read' })
				.then(assert.expectFail, function(err) {
					assert.equal('duplicate', err.name);
				});
			});

			it('update should update the resource', function() {
				var updateData = { title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'watch'};

				return service.update(resource.id, updateData)
				.then(function() {
					return graph.resources.get(resource.id);
				})
				.then(function(retrievedResource) {
					assert.equal(updateData.title, retrievedResource.title);
					assert.equal(updateData.url, retrievedResource.url);
					assert.equal(updateData.source, retrievedResource.source);
					assert.equal(updateData.verb, retrievedResource.verb);
				});
			});

			it('get should return the resource', function() {
				return service.get(resource.id)
				.then(function(retrievedResource) {
					assert.deepEqual(resource, retrievedResource);
				});
			});

			it('search for resource by title should find the resource', function() {
				return service.searchByTitle(resource.title)
				.then(function(foundResources) {
					assert.equal(1, foundResources.length);
					assert.equal(resource.id, foundResources[0].id);
				});
			});

			it('search for resource by title with different case should find the resource', function() {
				return service.searchByTitle(resource.title.toUpperCase())
				.then(function(foundResources) {
					assert.equal(1, foundResources.length);
					assert.equal(resource.id, foundResources[0].id);
				});
			});

			it('search for resource by url should find the resource', function() {
				return service.searchByUrl(resource.url)
				.then(function(foundResources) {
					assert.equal(1, foundResources.length);
					assert.equal(resource.id, foundResources[0].id);
				});
			});

			it('search for resource by partial title should find the resource', function() {
				return service.search({ q: resource.title.substr(1) })
				.then(function(foundResources) {
					assert.equal(1, foundResources.length);
					assert.equal(resource.id, foundResources[0].id);
				});
			});

			it('destroy resource deletes the resource', function() {
				return service.destroy(resource.id)
				.then(function() {
					return graph.resources.get(resource.id);
				})
				.then(function(foundResource) {
					assert.equal(undefined, foundResource);
				});
			});
		});

		describe('when two resources exist', function() {

			var resource, otherResource;

			beforeEach(function() {
				return graph.resources.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'read' })
				.then(function(createdResource) {
					resource = createdResource;
					return graph.resources.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'read' });
				})
				.then(function(createdResource) {
					otherResource = createdResource;
				});
			});

			it('update first resource with title that would be a duplicate returns a duplicate error', function() {
				return service.update(resource.id, { title: otherResource.title, url: guid.raw(), source: guid.raw(), verb: 'read'})
				.then(assert.expectFail, function(error) {
					assert.equal('duplicate', error.name);
				});
			});

			it('update first resource with url that would be a duplicate returns a duplicate error', function() {
				return service.update(resource.id, { title: guid.raw(), url: otherResource.url, source: guid.raw(), verb: 'read'})
				.then(assert.expectFail, function(error) {
					assert.equal('duplicate', error.name);
				});
			});
		});

		describe('when resource does not already exist', function() {

			it('create should create a new resource', function() {
				return service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'read' })
				.then(function(createdResource) {
					return graph.resources.get(createdResource.id)
					.then(function(retrievedResource) {
						assert.deepEqual(retrievedResource, createdResource);
					});
				});
			});

			it('get should return a notfound error', function() {
				return service.get(99999)
				.then(assert.expectFail, function(err) {
					assert.equal(err.name, 'notfound');
				});
			});

			it('update should return a notfound error', function() {
				return service.update(99999, { title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'watch'})
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});

			it('search for resource by title should not find the resource', function() {
				return service.searchByTitle(guid.raw())
				.then(function(foundResources) {
					assert.equal(0, foundResources.length);
				});
			});

			it('search for resource by url should not find the resource', function() {
				return service.searchByUrl(guid.raw())
				.then(function(foundResources) {
					assert.equal(0, foundResources.length);
				});
			});

			it('search for resource by title should not find the resource', function() {
				return service.searchByTitle(guid.raw())
				.then(function(foundResources) {
					assert.equal(0, foundResources.length);
				});
			});

			it('destroy resource returns a notfound error', function() {
				return service.destroy(999999)
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});
		});

		describe('when resource is linked to topic', function() {

			var resource, topic;

			beforeEach(function() {
				return graph.topics.create({ name: guid.raw() })
				.then(function(createdTopic) {
					topic = createdTopic;
					return graph.resources.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'read' })
					.then(function(createdResource) {
						resource = createdResource;
						return graph.relationships.create(createdTopic.id, createdResource.id, 'resources');
					});
				});
			});

			it('destroy resource returns an error', function() {
				return service.destroy(resource.id)
				.then(assert.expectFail, function(err) {
					assert.equal('cannot delete resource because it still has relationships', err);
				});
			});

		});

		describe('when resource is missing required property', function() {

			describe('title', function() {
				it('create should return an error', function() {
					return service.create({ url: guid.raw(), source: guid.raw(), verb: 'read' })
					.then(assert.expectFail, function(err) {
						assert.equal('title is required', err);
					});
				});

				it('update should return an error', function() {
					return service.update(99999, { url: guid.raw(), source: guid.raw(), verb: 'watch' })
					.then(assert.expectFail, function(err) {
						assert.equal('title is required', err);
					});
				});
			});

			describe('url', function() {
				it('create should return an error', function() {
					return service.create({ title: guid.raw(), source: guid.raw(), verb: 'read' })
					.then(assert.expectFail, function(err) {
						assert.equal('url is required', err);
					});
				});

				it('update should return an error', function() {
					return service.update(99999, { title: guid.raw(), source: guid.raw(), verb: 'watch' })
					.then(assert.expectFail, function(err) {
						assert.equal('url is required', err);
					});
				});
			});

			describe('source', function() {
				it('create should return an error', function() {
					return service.create({ title: guid.raw(), url: guid.raw(), verb: 'read' })
					.then(assert.expectFail, function(err) {
						assert.equal('source is required', err);
					});
				});

				it('udpate should return an error', function() {
					return service.update(99999,{ title: guid.raw(), url: guid.raw(), verb: 'watch' })
					.then(assert.expectFail, function(err) {
						assert.equal('source is required', err);
					});
				});
			});

			describe('verb', function() {
				it('create should return an error', function() {
					return service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw() })
					.then(assert.expectFail, function(err) {
						assert.equal('verb is required', err);
					});
				});

				it('update should return an error', function() {
					return service.update(99999,{ title: guid.raw(), url: guid.raw(), source: guid.raw() })
					.then(assert.expectFail, function(err) {
						assert.equal('verb is required', err);
					});
				});
			});
		});

		describe('when resource has an invalid verb', function() {

			it('create returns invalid verb error', function() {
				return service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'invalid' })
				.then(assert.expectFail, function(err) {
					assert.equal('invalid verb', err);
				});
			});

			it('update returns invalid verb error', function() {
				return service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'invalid' })
				.then(assert.expectFail, function(err) {
					assert.equal('invalid verb', err);
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
