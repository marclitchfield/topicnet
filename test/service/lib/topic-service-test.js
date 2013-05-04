var assert = require('assert');
var Q = require('q');
var graph = require('../../../service/lib/graph');
var topicnetGraph = require('../../../service/lib/topicnet-graph').create(graph);
var topicService = require('../../../service/lib/topic-service');
var sinon = require('sinon');


describe('Topic Service', function() {

	describe('linkResource', function() {

		describe('when the link does not already exist', function() {

			var mockGraph, service;

			before(function() {
				mockGraph = sinon.mock(topicnetGraph);
				service = topicService.createService(graph, mockGraph.object);
				mockGraph.expects('getResourceRelationship').withArgs(1,2)
					.returns(Q.resolve(undefined));
				mockGraph.expects('linkResource').withArgs(1,2);
			});
			
			it('should link a resource to a topic', function(done) {
				service.linkResource(1,2)
				.then(function(relationship) {
					assert.ok(relationship);
					mockGraph.verify();
					done();
				})
				.done();
			});

		});

		describe('when the link already exists', function() {

			var mockGraph, service;

			before(function() {
				mockGraph = sinon.mock(topicnetGraph);
				service = topicService.createService(graph, mockGraph.object);
				mockGraph.expects('getResourceRelationship').withArgs(1,2)
					.returns(Q.resolve({id:123}));
			});

			it('should return an error', function(done) {
				service.linkResource(1,2)
				.fail(function(error) {
					assert.equal('duplicate', error.name);
					mockGraph.verify();
					done();
				})
				.done();
			});

		});
	});

});
