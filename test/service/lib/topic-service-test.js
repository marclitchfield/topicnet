var assert = require('assert');
var Q = require('q');
var topicService = require('../../../service/lib/topic-service');
var StubGraph = require('../stub-graph');

describe('Topic Service', function() {

	var graph, service;

	beforeEach(function() {
		graph = StubGraph.create();
		service = topicService.createService(undefined, graph);
	});

	describe('linkResource', function() {

		describe('when the resource is not already linked to the topic', function() {
		
			it('should link the resource to the topic', function(done) {

				service.linkResource(1,2)
				.then(function() {
					return graph.getRelationship(1,2,'resources');
				})
				.then(function(link) {
					assert.ok(link);
					done();
				})
				.done();
			});

		});

		describe('when the resource is already linked to the topic', function() {

			beforeEach(function(done) {
				graph.createRelationship(1,2,'resources')
				.then(function() {
					done();
				})
				.done();
			});

			it('should return a duplicate error', function(done) {
				service.linkResource(1,2)
				.fail(function(error) {
					assert.equal('duplicate', error.name);
					done();
				})
				.done();
			});

		});
	});

	describe('unlinkResource', function() {

		describe('when the resource is not already linked to the topic', function() {
		
			it('should return a notfound error', function(done) {

				service.unlinkResource(1,2)
				.fail(function(error) {
					assert.equal('notfound', error.name);
					done();
				})
				.done();
			});

		});

		describe('when the resource is linked to the topic', function() {

			beforeEach(function(done) {
				graph.createRelationship(1,2,'resources')
				.then(function() {
					done();
				})
				.done();
			});

			it('should unlink the resource', function(done) {

				service.unlinkResource(1,2)
				.then(function() {
					return graph.getRelationship(1,2,'resources');
				})
				.then(function(relationship) {
					assert.equal(undefined, relationship);
					done();
				})
				.done();
			});

		});
	});

});
