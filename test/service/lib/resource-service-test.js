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

			describe('create', function() {
				it('should return a duplicate error given a duplicate title', function() {
					return service.create({ title: resource.title, url: guid.raw(), source: guid.raw(), verb: 'read' })
					.then(assert.expectFail, function(err) {
						assert.equal('duplicate', err.name);
					});
				});

				it('should return a duplicate error given a duplicate url', function() {
					return service.create({ title: guid.raw(), url: resource.url, source: guid.raw(), verb: 'read' })
					.then(assert.expectFail, function(err) {
						assert.equal('duplicate', err.name);
					});
				});
			});

			describe('get', function() {
				it('should return the resource', function() {
					return service.get(resource.id)
					.then(function(retrievedResource) {
						assert.deepEqual(resource, retrievedResource);
					});
				});
			});

			describe('search', function() {
				it('should find the resource by exact title', function() {
					return service.searchByTitle(resource.title)
					.then(function(foundResources) {
						assert.equal(1, foundResources.length);
						assert.equal(resource.id, foundResources[0].id);
					});
				});

				it('should find the resource given a partial title', function() {
					return service.search({ q: resource.title.substr(1) })
					.then(function(foundResources) {
						assert.equal(1, foundResources.length);
						assert.equal(resource.id, foundResources[0].id);
					});
				});

				it('should find the resource given a title with different case', function() {
					return service.searchByTitle(resource.title.toUpperCase())
					.then(function(foundResources) {
						assert.equal(1, foundResources.length);
						assert.equal(resource.id, foundResources[0].id);
					});
				});

				it('should find the resource given a url', function() {
					return service.searchByUrl(resource.url)
					.then(function(foundResources) {
						assert.equal(1, foundResources.length);
						assert.equal(resource.id, foundResources[0].id);
					});
				});
			});

			describe('update', function() {
				it('should return the updated resource', function() {
					var updateData = { title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'watch'};

					return service.update(resource.id, updateData)
					.then(function(updatedResource) {
						assert.equal(updateData.title, updatedResource.title);
						assert.equal(updateData.url, updatedResource.url);
						assert.equal(updateData.source, updatedResource.source);
						assert.equal(updateData.verb, updatedResource.verb);
					});
				});

				it('should update the resource', function() {
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
			});

			describe('destroy', function() {
				it('deletes the resource', function() {
					return service.destroy(resource.id)
					.then(function() {
						return graph.resources.get(resource.id);
					})
					.then(function(foundResource) {
						assert.equal(undefined, foundResource);
					});
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

			describe('update', function() {
				it('should return duplicate error given a title that would be a duplicate', function() {
					return service.update(resource.id, { title: otherResource.title, url: guid.raw(), source: guid.raw(), verb: 'read'})
					.then(assert.expectFail, function(error) {
						assert.equal('duplicate', error.name);
					});
				});

				it('should return duplicate error given a url that would be a duplicate', function() {
					return service.update(resource.id, { title: guid.raw(), url: otherResource.url, source: guid.raw(), verb: 'read'})
					.then(assert.expectFail, function(error) {
						assert.equal('duplicate', error.name);
					});
				});
			});
		});

		describe('when resource does not already exist', function() {

			describe('create', function() {
				it('should create a new resource', function() {
					return service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'read' })
					.then(function(createdResource) {
						return graph.resources.get(createdResource.id)
						.then(function(retrievedResource) {
							assert.deepEqual(retrievedResource, createdResource);
						});
					});
				});
			});

			describe('get', function() {
				it('should return a notfound error', function() {
					return service.get(99999)
					.then(assert.expectFail, function(err) {
						assert.equal(err.name, 'notfound');
					});
				});
			});

			describe('search', function() {
				it('should not find the resource by title', function() {
					return service.searchByTitle(guid.raw())
					.then(function(foundResources) {
						assert.equal(0, foundResources.length);
					});
				});

				it('should not find the resource by url', function() {
					return service.searchByUrl(guid.raw())
					.then(function(foundResources) {
						assert.equal(0, foundResources.length);
					});
				});
			});

			describe('update', function() {
				it('should return a notfound error', function() {
					return service.update(99999, { title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'watch'})
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});

			describe('destroy', function() {
				it('should return a notfound error', function() {
					return service.destroy(999999)
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
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

			describe('destroy', function() {
				it('returns an error that the resource still has relationships', function() {
					return service.destroy(resource.id)
					.then(assert.expectFail, function(err) {
						assert.equal('cannot delete resource because it still has relationships', err);
					});
				});
			});
		});

		describe('when given resource is missing required property', function() {

			describe('create', function() {
				it('should return an error given a resource without a title', function() {
					return service.create({ url: guid.raw(), source: guid.raw(), verb: 'read' })
					.then(assert.expectFail, function(err) {
						assert.equal('title is required', err);
					});
				});

				it('should return an error given a resource without a url', function() {
					return service.create({ title: guid.raw(), source: guid.raw(), verb: 'read' })
					.then(assert.expectFail, function(err) {
						assert.equal('url is required', err);
					});
				});

				it('should return an error given a resource without a source', function() {
					return service.create({ title: guid.raw(), url: guid.raw(), verb: 'read' })
					.then(assert.expectFail, function(err) {
						assert.equal('source is required', err);
					});
				});

				it('should return an error given a resource without a verb', function() {
					return service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw() })
					.then(assert.expectFail, function(err) {
						assert.equal('verb is required', err);
					});
				});
			});

			describe('update', function() {
				it('should return an error given a resource without a title', function() {
					return service.update(99999, { url: guid.raw(), source: guid.raw(), verb: 'watch' })
					.then(assert.expectFail, function(err) {
						assert.equal('title is required', err);
					});
				});

				it('should return an error given a resource without a url', function() {
					return service.update(99999, { title: guid.raw(), source: guid.raw(), verb: 'watch' })
					.then(assert.expectFail, function(err) {
						assert.equal('url is required', err);
					});
				});

				it('should return an error given a resource without a source', function() {
					return service.update(99999,{ title: guid.raw(), url: guid.raw(), verb: 'watch' })
					.then(assert.expectFail, function(err) {
						assert.equal('source is required', err);
					});
				});

				it('should return an error given a resource without a verb', function() {
					return service.update(99999,{ title: guid.raw(), url: guid.raw(), source: guid.raw() })
					.then(assert.expectFail, function(err) {
						assert.equal('verb is required', err);
					});
				});
			});
		});

		describe('when resource has an invalid verb', function() {

			describe('create', function() {
				it('should return an invalid verb error', function() {
					return service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'invalid' })
					.then(assert.expectFail, function(err) {
						assert.equal('invalid verb', err);
					});
				});
			});

			describe('update', function() {
				it('should return an invalid verb error', function() {
					return service.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'invalid' })
					.then(assert.expectFail, function(err) {
						assert.equal('invalid verb', err);
					});
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
