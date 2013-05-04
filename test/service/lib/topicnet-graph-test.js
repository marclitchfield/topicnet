var assert = require('assert');
var Q = require('q');
var sinon = require('sinon');
var guid = require('guid');
var graph = require('../../../service/lib/graph');
var topicnetGraph = require('../../../service/lib/topicnet-graph').create(graph);

describe('Topicnet Graph', function() {

	//describe('getRelationship', function() {

		//describe('when there is no relationship', function() {

			//var topicId;
			//var resourceId;

			//before(function(done) {
				//graph.createNode({ name: guid.raw() })
				//.then(function(topic) {
					//topicId = topic.id;
					//return graph.createNode({ title: guid.raw() });
				//})
				//.then(function(resource) {
					//resourceId = resource.id;
					//done();
				//})
				//.done();
			//});

			//it('should return an empty list', function(done) {
				//topicnetGraph.queryRelationship(topicId, resourceId, 'resources')
				//.then(function(res) {
					//assert.deepEqual(res, []);
					//done();
				//})
				//.done();
			//});

		//});

		//describe('when the relationship already exists', function() {
			
			//var topicId;
			//var resourceId;

			//before(function(done) {
				//graph.createNode({ name: guid.raw() })
				//.then(function(topic) {
					//topicId = topic.id;
					//return graph.createNode({ title: guid.raw() });
				//})
				//.then(function(resource) {
					//resourceId = resource.id;
					//return graph.createRelationshipBetween(topicId, resourceId, 'resources', {});
				//})
				//.then(function(res) {
					//done();
				//})
				//.done();
			//});
			
			//it('should return the relationship', function() {
				//topicnetGraph.queryRelationship(topicId, resourceId, 'resources')
				//.then(function(relationship) {
					//assert.ok(relationship.id > 0);
				//});
			//});
			
		//});

	//});

});

