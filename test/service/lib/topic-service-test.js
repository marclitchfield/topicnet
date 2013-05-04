var assert = require('assert');
var Q = require('q');
var graph = require('../../../service/lib/graph');
var topicService = require('../../../service/lib/topic-service');
var sinon = require('sinon');

describe('Topic Service', function() {

	describe('linkResource', function() {

		describe('when the link does not already exist', function() {

			var mockGraph;
			var service;

			before(function(done) {
				mockGraph = sinon.mock(graph);
				service = topicService.createService(mockGraph);
				done();
			});

			it('should link a resource to a topic', function() {
				mockGraph.expects('queryRelationship').withArgs(1,2,'resources')
				.returns(Q.resolve([]));
			});

		});


	});

});
