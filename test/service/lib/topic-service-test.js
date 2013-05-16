var assert = require('assert');
var Q = require('q');
var topicService = require('../../../service/lib/topic-service');
var StubGraph = require('./stub-graph');

describe('Topic Service', function() {

	var graph, service;

	beforeEach(function() {
		graph = StubGraph.create();
		service = topicService.createService(graph);
	});

	describe('when topic exists', function() {

		var topic;

		beforeEach(function(done) {
			graph.topics.create({ name: 'topic' })
			.then(function(createdTopic) {
				topic = createdTopic;
				done();
			})
			.done();
		});

		it('create topic with the same name should return a duplicate error', function(done) {
			service.create({ name: topic.name })
			.fail(function(err) {
				assert.equal('duplicate', err.name);
				done();
			})
			.done();
		});

		it('update topic should update the topic', function(done) {
			service.update(topic.id, { name: 'updated' })
			.then(function() {
				return graph.topics.get(topic.id);
			})
			.then(function(retrievedTopic) {
				assert.equal('updated', retrievedTopic.name);
				done();
			})
			.done();
		});

		it('get topic should retrieve the topic', function(done) {
			service.get(topic.id)
			.then(function(retrievedTopic) {
				assert.equal(topic.name, retrievedTopic.name);
				done();
			})
			.done();
		});

		it('getLinkedTopics should return empty list', function(done) {
			service.getLinkedTopics(topic.id, 'sub')
			.then(function(retrievedTopics) {
				assert.deepEqual([], retrievedTopics);
				done();
			})
			.done();
		});

		it('delete topic should delete the topic', function(done) {
			service.deleteTopic(topic.id)
			.then(function() {
				return graph.topics.get(topic.id);
			})
			.then(function(retrievedTopic) {
				assert.equal(undefined, retrievedTopic);
				done();
			})
			.done();
		});

		it('search for topic by name should find the topic', function(done) {
			service.search({ q: topic.name })
			.then(function(foundTopics) {
				assert.equal(1, foundTopics.length);
				assert.equal(topic.id, foundTopics[0].id);
				done();
			})
			.done();
		});
	});

	describe('when topic has related topics', function() {

		var topic, relatedTopic;

		beforeEach(function(done) {
			graph.topics.create({ name: 'topic' })
			.then(function(createdTopic1) {
				topic = createdTopic1;
				return graph.topics.create({ name: 'related' });
			})
			.then(function(createdTopic2) {
				relatedTopic = createdTopic2;
				return graph.relationships.create(topic.id, relatedTopic.id, 'sub');
			})
			.then(function() {
				done();
			})
			.done();
		});

		it('getLinkedTopics returns the related topic', function(done) {
			service.getLinkedTopics(topic.id, 'sub')
			.then(function(related) {
				assert.deepEqual([relatedTopic], related);
				done();
			})
			.done();
		});
	});

	describe('when topic does not exist', function() {

		it('create topic should create the topic', function(done) {
			service.create({ name: 'topic' })
			.then(function(createdTopic) {
				return graph.topics.get(createdTopic.id);
			})
			.then(function(retrievedTopic) {
				assert.equal('topic', retrievedTopic.name);
				assert.notEqual(undefined, retrievedTopic.id);
				done();
			})
			.done();
		});

		it('update topic should return notfound error', function(done) {
			service.update(9999, { name: 'updated' })
			.fail(function(err) {
				assert.equal('notfound', err.name);
				done();
			})
			.done();
		});

		it('get topic should return notfound error', function(done) {
			service.get(99999)
			.fail(function(err) {
				assert.equal('notfound', err.name);
				done();
			})
			.done();
		});

		it('getLinkedTopics should return notfound error', function(done) {
			service.getLinkedTopics(9999, 'sub')
			.fail(function(err) {
				assert.equal('notfound', err.name);
				done();
			})
			.done();
		});

		it('delete topic should return a notfound error', function(done) {
			service.deleteTopic(9999)
			.fail(function(err) {
				assert.equal('notfound', err.name);
				done();
			})
			.done();
		});

		it('search for topic by name should not find topics', function(done) {
			service.search({ q: 'notfound' })
			.then(function(foundTopics) {
				assert.equal(0, foundTopics.length);
				done();
			})
			.done();
		});
	});

	describe('when topic has no name', function() {
		it('create topic should return an error', function(done) {
			service.create({})
			.fail(function(err) {
				assert.equal('name is required', err);
				done();
			})
			.done();
		});

		it('update topic should return an error', function(done) {
			service.update(999, {})
			.fail(function(err) {
				assert.equal('name is required', err);
				done();
			})
			.done();
		});
	});

	describe('when related topic does not already exist', function() {

		it('linkTopic should link the related topic', function(done) {
			service.linkTopic(1, 2, 'sub')
			.then(function() {
				return graph.relationships.get(1, 2, 'sub');
			})
			.then(function(link) {
				assert.ok(link);
				done();
			})
			.done();
		});

		it('unlinkTopic should return a notfound error', function(done) {
			service.unlinkTopic(1, 2, 'sub')
			.fail(function(err) {
				assert.equal('notfound', err.name);
				done();
			})
			.done();
		});
	});

	describe('when related topic already exists', function() {

		beforeEach(function(done) {
			graph.relationships.create(1, 2, 'sub')
			.then(function() {
				done();
			})
			.done();
		});

		it('linkTopic should return a duplicate error', function(done) {
			service.linkTopic(1, 2, 'sub')
			.fail(function(err) {
				assert.equal('duplicate', err.name);
				done();
			})
			.done();
		});

		it('unlinkTopic should unlink the related topic', function(done) {

			service.unlinkTopic(1, 2, 'sub')
			.then(function() {
				return graph.relationships.get(1, 2, 'sub');
			})
			.then(function(link) {
				assert.equal(undefined, link);
				done();
			})
			.done();

		});
	});

	describe('when given an invalid relationship', function() {

		it('linkTopic should return an invalid relationship error', function(done) {
			service.linkTopic(1, 2, 'invalid')
			.fail(function(err) {
				assert.notEqual(-1, err.indexOf('invalid relationship'));
				done();
			})
			.done();
		});

		it('unlinkTopic should return an invalid relationship error', function(done) {
			service.unlinkTopic(1, 2, 'invalid')
			.fail(function(err) {
				assert.notEqual(-1, err.indexOf('invalid relationship'));
				done();
			})
			.done();
		});

		it('getLinkedTopics should return an invalid relationship error', function(done) {
			service.getLinkedTopics(1, 'invalid')
			.fail(function(err) {
				assert.notEqual(-1, err.indexOf('invalid relationship'));
				done();
			})
			.done();
		});
	});

	describe('when the resource is not already linked to the topic', function() {
		
		it('linkResource should link the resource to the topic', function(done) {
			service.linkResource(1,2)
			.then(function() {
				return graph.relationships.get(1,2,'resources');
			})
			.then(function(link) {
				assert.ok(link);
				done();
			})
			.done();
		});

		it('unlinkResource should return a notfound error', function(done) {
			service.unlinkResource(1,2)
			.fail(function(error) {
				assert.equal('notfound', error.name);
				done();
			})
			.done();
		});

		it('getLink should return a notfound error', function(done) {
			service.getLink(1, 9999, 'resources')
			.fail(function(err) {
				assert.equal('notfound', err.name);
				done();
			})
			.done();
		});
	});

	describe('when the resource is already linked to the topic', function() {

		beforeEach(function(done) {
			graph.relationships.create(1, 2, 'resources', {upVotes:1, downVotes:2, score:3})
			.then(function() {
				done();
			})
			.done();
		});

		it('getLink should return the relationship', function(done) {
			service.getLink(1, 2, 'resources')
			.then(function(link) {
				assert.equal(1, link.fromId);
				assert.equal(2, link.toId);
				assert.equal('resources', link.relationshipType);
				assert.equal(1, link.upVotes);
				assert.equal(2, link.downVotes);
				assert.equal(3, link.score);
				done();
			})
			.done();
		});

		it('linkResource should return a duplicate error', function(done) {
			service.linkResource(1, 2)
			.fail(function(error) {
				assert.equal('duplicate', error.name);
				done();
			})
			.done();
		});

		it('unlinkResource should unlink the resource', function(done) {
			service.unlinkResource(1, 2)
			.then(function() {
				return graph.relationships.get(1, 2, 'resources');
			})
			.then(function(relationship) {
				assert.equal(undefined, relationship);
				done();
			})
			.done();
		});
	});
});
