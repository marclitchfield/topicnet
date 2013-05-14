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
		});
	});

});