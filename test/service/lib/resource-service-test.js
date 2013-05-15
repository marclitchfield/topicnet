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
			graph.createResource({ title: 'title', url: 'url', source: 'source', verb: 'read' })
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

		it('get should return the resource', function(done) {
			service.get(resource.id)
			.then(function(retrievedResource) {
				assert.deepEqual(resource, retrievedResource);
				done();
			})
			.done();
		});

		it('update should update the resource', function(done) {
			service.update(resource.id, { title: 'updated-title', url: 'updated-url', source: 'updated-source', verb: 'watch'})
			.then(function() {
				return graph.getResource(resource.id)
			})
			.then(function(retrievedResource) {
				assert.equal('updated-title', retrievedResource.title);
				assert.equal('updated-url', retrievedResource.url);
				assert.equal('updated-source', retrievedResource.source);
				assert.equal('watch', retrievedResource.verb);
				done();
			})
			.done();
		})
	});

	describe('when resource does not already exist', function() {
		
		it('create should create a new resource', function(done) {
			service.create({ title: 'title', url: 'url', source: 'source', verb: 'read' })
			.then(function(createdResource) {
				return graph.getResource(createdResource.id)
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
			})
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