var assert = require('assert');
var Q = require('q');
var graph = require('../../../service/lib/graph');
var topicnetGraph = require('../../../service/lib/topicnet-graph').create(graph);
var topicService = require('../../../service/lib/topic-service');
var StubGraph = require('../stub-graph');

describe('Topic Service', function() {

	describe('linkResource', function() {

		var stubGraph, service;

		beforeEach(function() {
			stubGraph = StubGraph.create();
			service = topicService.createService(graph, stubGraph);
		});

		describe('when the link does not already exist', function() {
		
			it('should link a resource to a topic', function(done) {

				service.linkResource(1,2)
				.then(function() {
					return stubGraph.getLinkedResource(1,2);
				})
				.then(function(link) {
					assert.ok(link);
					done();
				})
				.done();
			});

		});

		describe('when the link already exists', function() {

			beforeEach(function(done) {
				service.linkResource(1,2)
				.then(function() {
					done();
				})
				.done();
			});

			it('should return an error', function(done) {
				service.linkResource(1,2)
				.fail(function(error) {
					assert.equal('duplicate', error.name);
					done();
				})
				.done();
			});

		});
	});

});
