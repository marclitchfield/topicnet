var assert = require('assert');
var Q = require('q');
var topicService = require('../../../service/lib/topic-service');
var StubGraph = require('./graph/stub-graph');
var neo4jGraph = require('../../../service/lib/graph/neo4j-graph');
var RealGraph = require('../../../service/lib/graph/topicnet-graph');
var guid = require('guid');
var _ = require('underscore');
require('../test-utils');

describe('Topic Service', function() {

	function runTopicServiceTests(graph) {

		var service;

		beforeEach(function() {
			service = topicService.create(graph);
		});

		describe('when topic exists', function() {

			var topic;

			beforeEach(function(done) {
				graph.topics.create({ name: guid.raw().toLowerCase() })
				.done(function(createdTopic) {
					topic = createdTopic;
					done();
				});
			});

			it('create topic with the same name should return a duplicate error', function() {
				return service.create({ name: topic.name })
				.then(assert.expectFail, function(err) {
					assert.equal('duplicate', err.name);
				});
			});

			it('update topic should update the topic', function() {
				var updatedName = guid.raw();
				
				return service.update(topic.id, { name: updatedName })
				.then(function() {
					return graph.topics.get(topic.id);
				})
				.then(function(retrievedTopic) {
					assert.equal(updatedName, retrievedTopic.name);
				});
			});

			it('get topic should retrieve the topic', function() {
				return service.get(topic.id)
				.then(function(retrievedTopic) {
					assert.equal(topic.name, retrievedTopic.name);
				});
			});

			it('getLinkedTopics should return empty list', function() {
				return service.getLinkedTopics(topic.id, 'sub')
				.then(function(retrievedTopics) {
					assert.deepEqual([], retrievedTopics);
				});
			});

			it('destroy topic should delete the topic', function() {
				return service.destroy(topic.id)
				.then(function() {
					return graph.topics.get(topic.id);
				})
				.then(function(retrievedTopic) {
					assert.equal(undefined, retrievedTopic);
				});
			});

			it('search for topic by name should find the topic', function() {
				return service.search({ q: topic.name })
				.then(function(foundTopics) {
					assert.equal(1, foundTopics.length);
					assert.equal(topic.id, foundTopics[0].id);
				});
			});

			it('search for topic by partial name should find the topic', function() {
				return service.search({ q: topic.name.substr(1) })
				.then(function(foundTopics) {
					assert.ok(foundTopics.length > 0);
					assert.ok(_.some(foundTopics, function(t) {
						return topic.id === t.id;
					}));
				});
			});

			it('search for topic by name with different case should find the topic', function() {
				return service.search({ q: topic.name.substr(1).toUpperCase() })
				.then(function(foundTopics) {
					assert.ok(foundTopics.length > 0);
					assert.ok(_.some(foundTopics, function(t) {
						return topic.id === t.id;
					}));
				});
			});
		});

		describe('when topic containing special characters exists', function() {

			var topic;
			var ourGuid;

			beforeEach(function(done) {
				ourGuid = guid.raw();
				var topicName = (ourGuid + ' hey abboooot! ').toLowerCase();
				
				graph.topics.create({ name: topicName })
				.done(function(createdTopic) {
					topic = createdTopic;
					done();
				});
			});

			it('search for topic where search contains spaces returns the topic', function() {
				return service.search({ q: ourGuid + ' hey abboo' })
				.then(function(foundTopics) {
					assert.equal(1, foundTopics.length);
					assert.equal(topic.id, foundTopics[0].id);
				});
			});

			it('search for topic where search contains ! returns the topic', function() {
				return service.search({ q: ourGuid + ' hey abboooot!' })
				.then(function(foundTopics) {
					assert.equal(1, foundTopics.length);
					assert.equal(topic.id, foundTopics[0].id);
				});
			});
		});

		describe('when topic has related topics', function() {

			var topic, relatedTopic;

			beforeEach(function(done) {
				graph.topics.create({ name: guid.raw() })
				.then(function(createdTopic1) {
					topic = createdTopic1;
					return graph.topics.create({ name: 'related' + guid.raw() });
				})
				.then(function(createdTopic2) {
					relatedTopic = createdTopic2;
					return graph.relationships.create(topic.id, relatedTopic.id, 'sub');
				})
				.done(function() { done(); });
			});

			it('getLinkedTopics returns the related topic', function() {
				return service.getLinkedTopics(topic.id, 'sub')
				.then(function(related) {
					assert.deepEqual([relatedTopic], related);
				});
			});

			it('linkTopic when parent topic is missing should return notfound error', function() {
				return service.linkTopic(topic.id, 99999, 'sub')
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});

			it('unlinkTopic when parent topic is missing should return notfound error', function() {
				return service.unlinkTopic(topic.id, 99999, 'sub')
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});

			it('linkTopic when child topic is missing should return notfound error', function() {
				return service.linkTopic(99999, topic.id, 'sub')
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});

			it('unlinkTopic when child topic is missing should return notfound error', function() {
				return service.unlinkTopic(99999, topic.id, 'sub')
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});
		});

		describe('when topic does not exist', function() {

			it('create topic should create the topic', function() {
				var topicName = guid.raw();

				return service.create({ name: topicName })
				.then(function(createdTopic) {
					return graph.topics.get(createdTopic.id);
				})
				.then(function(retrievedTopic) {
					assert.equal(topicName, retrievedTopic.name);
					assert.notEqual(undefined, retrievedTopic.id);
				});
			});

			it('update topic should return notfound error', function() {
				return service.update(9999, { name: guid.raw() })
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});

			it('get topic should return notfound error', function() {
				return service.get(99999)
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});

			it('getLinkedTopics should return notfound error', function() {
				return service.getLinkedTopics(9999, 'sub')
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});

			it('destroy topic should return a notfound error', function() {
				return service.destroy(9999)
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});

			it('search for topic by name should not find topics', function() {
				return service.search({ q: 'notfound' })
				.then(function(foundTopics) {
					assert.equal(0, foundTopics.length);
				});
			});

			it('linkRoot should return notfound error', function() {
				return service.linkRoot(9999)
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});

			it('unlinkRoot should return notfound error', function() {
				return service.unlinkRoot(9999)
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});
		});

		describe('when topic has no name', function() {
			it('create topic should return an error', function() {
				return service.create({})
				.then(assert.expectFail, function(err) {
					assert.equal('name is required', err);
				});
			});

			it('update topic should return an error', function() {
				return service.update(999, {})
				.then(assert.expectFail, function(err) {
					assert.equal('name is required', err);
				});
			});
		});

		describe('when topic link does not already exist', function() {

			var fromTopic;
			var toTopic;

			beforeEach(function(done) {
				graph.topics.create({ name: guid.raw() })
				.then(function(firstCreatedTopic) {
					fromTopic = firstCreatedTopic;
					return graph.topics.create({ name: guid.raw() });
				})
				.done(function(secondCreatedTopic) {
					toTopic = secondCreatedTopic;
					done();
				});
			});

			it('linkTopic should link the related topic', function() {
				return service.linkTopic(fromTopic.id, toTopic.id, 'sub')
				.then(function() {
					return graph.relationships.get(fromTopic.id, toTopic.id, 'sub');
				})
				.then(function(link) {
					assert.ok(link);
				});
			});

			it('unlinkTopic should return a notfound error', function() {
				return service.unlinkTopic(fromTopic.id, toTopic.id, 'sub')
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});
		});

		describe('when related topic already exists', function() {

			var fromTopic;
			var toTopic;

			beforeEach(function(done) {
				graph.topics.create({ name: guid.raw() })
				.then(function(firstCreatedTopic) {
					fromTopic = firstCreatedTopic;
					return graph.topics.create({ name: guid.raw() });
				})
				.then(function(secondCreatedTopic) {
					toTopic = secondCreatedTopic;
					return graph.relationships.create(fromTopic.id, toTopic.id, 'sub');
				})
				.done(function() { done(); });
			});

			it('linkTopic should return a duplicate error', function() {
				return service.linkTopic(fromTopic.id, toTopic.id, 'sub')
				.then(assert.expectFail, function(err) {
					assert.equal('duplicate', err.name);
				});
			});

			it('unlinkTopic should unlink the related topic', function() {
				return service.unlinkTopic(fromTopic.id, toTopic.id, 'sub')
				.then(function() {
					return graph.relationships.get(fromTopic.id, toTopic.id, 'sub');
				})
				.then(function(link) {
					assert.equal(undefined, link);
				});
			});
		});

		describe('when topic is not a root', function() {

			var topic;

			beforeEach(function(done) {
				graph.topics.create({ name: guid.raw().toLowerCase() })
				.done(function(createdTopic) {
					topic = createdTopic;
					done();
				});
			});

			it('linkRoot should make the topic a root topic', function() {
				return service.linkRoot(topic.id)
				.then(function() {
					return graph.relationships.get(0, topic.id, 'root');
				})
				.then(function(link) {
					assert.ok(link);
				});
			});
		});

		describe('when topic is already a root', function() {

			var topic;

			beforeEach(function(done) {
				graph.topics.create({ name: guid.raw().toLowerCase() })
				.then(function(createdTopic) {
					topic = createdTopic;
					return graph.relationships.create(0, topic.id, 'root');
				})
				.done(function() { done(); });
			});

			it('linkRoot should return a duplicate error', function() {
				return service.linkRoot(topic.id)
				.then(assert.expectFail, function(err) {
					assert.equal('duplicate', err.name);
				});
			});
		});

		describe('when given an invalid relationship', function() {

			it('linkTopic should return an invalid relationship error', function() {
				return service.linkTopic(1, 2, 'invalid')
				.then(assert.expectFail, function(err) {
					assert.notEqual(-1, err.indexOf('invalid relationship'));
				});
			});

			it('unlinkTopic should return an invalid relationship error', function() {
				return service.unlinkTopic(1, 2, 'invalid')
				.then(assert.expectFail, function(err) {
					assert.notEqual(-1, err.indexOf('invalid relationship'));
				});
			});

			it('getLinkedTopics should return an invalid relationship error', function() {
				return service.getLinkedTopics(1, 'invalid')
				.then(assert.expectFail, function(err) {
					assert.notEqual(-1, err.indexOf('invalid relationship'));
				});
			});
		});

		describe('when the resource is not already linked to the topic', function() {

			var topic;
			var resource;

			beforeEach(function(done) {
				graph.topics.create({name: guid.raw()})
				.then(function(createdTopic) {
					topic = createdTopic;
					return graph.resources.create({url: guid.raw(), title: guid.raw(),
						source: 'example.com', verb: 'read'});
				})
				.done(function(createdResource) {
					resource = createdResource;
					done();
				});
			});

			it('linkResource should link the resource to the topic', function() {
				return service.linkResource(topic.id, resource.id)
				.then(function() {
					return graph.relationships.get(topic.id, resource.id, 'resources');
				})
				.then(function(link) {
					assert.ok(link);
				});
			});

			it('unlinkResource should return a notfound error', function() {
				return service.unlinkResource(topic.id, resource.id)
				.then(assert.expectFail, function(error) {
					assert.equal('notfound', error.name);
				});
			});

			it('getLink should return a notfound error', function() {
				return service.getLink(topic.id, resource.id, 'resources')
				.then(assert.expectFail, function(err) {
					assert.equal('notfound', err.name);
				});
			});
		});

		describe('when the topic exists but the resource does not', function() {
			var topic;

			beforeEach(function(done) {
				graph.topics.create({name: guid.raw()})
				.done(function(createdTopic) {
					topic = createdTopic;
					done();
				});
			});

			it('linkResource should return notfound error', function() {
				return service.linkResource(topic.id, 99999)
				.then(assert.expectFail, function(error) {
					assert.equal('notfound', error.name);
				});
			});

			it('unlinkResource should return notfound error', function() {
				return service.unlinkResource(topic.id, 99999)
				.then(assert.expectFail, function(error) {
					assert.equal('notfound', error.name);
				});
			});
		});

		describe('when the resource exists but the topic does not', function() {
			var resource;

			beforeEach(function(done) {
				graph.resources.create({url: guid.raw(), title: guid.raw(), source: guid.raw(), verb: 'read'})
				.done(function(createdResource) {
					resource = createdResource;
					done();
				});
			});

			it('linkResource should return notfound error', function() {
				return service.linkResource(99999, resource.id)
				.then(assert.expectFail, function(error) {
					assert.equal('notfound', error.name);
				});
			});

			it('unlinkResource should return notfound error', function() {
				return service.unlinkResource(99999, resource.id)
				.then(assert.expectFail, function(error) {
					assert.equal('notfound', error.name);
				});
			});
		});

		describe('when the resource is already linked to the topic', function() {

			var topic;
			var resource;

			beforeEach(function(done) {
				return graph.topics.create({name: guid.raw()})
				.then(function(createdTopic) {
					topic = createdTopic;
					return graph.resources.create({url: guid.raw(), title: guid.raw(),
						source: 'example.com', verb: 'read'});
				})
				.then(function(createdResource) {
					resource = createdResource;
					return graph.relationships.create(topic.id, resource.id, 'resources', {});
				})
				.done(function() { done(); });
			});

			it('getLink should return the relationship', function() {
				return service.getLink(topic.id, resource.id, 'resources')
				.then(function(link) {
					assert.equal(topic.id, link.fromId);
					assert.equal(resource.id, link.toId);
					assert.equal('resources', link.relationshipType);
				});
			});

			it('linkResource should return a duplicate error', function() {
				return service.linkResource(topic.id, resource.id)
				.then(assert.expectFail, function(error) {
					assert.equal('duplicate', error.name);
				});
			});

			it('unlinkResource should unlink the resource', function() {
				return service.unlinkResource(topic.id, resource.id)
				.then(function() {
					return graph.relationships.get(topic.id, resource.id, 'resources');
				})
				.then(function(relationship) {
					assert.equal(undefined, relationship);
				});
			});
		});

	} // end runTopicServiceTests

	if (!process.env.TOPICNET_SKIP_INTEGRATION) {
		describe('with real graph', function() {
			runTopicServiceTests(RealGraph.create(neo4jGraph));
		});
	}

	describe('with stub graph', function() {
		runTopicServiceTests(StubGraph.create());
	});

});
