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
		var user;

		beforeEach(function() {
			service = topicService.create(graph);
			return graph.users.create({ email: guid.raw() })
			.then(function(res) {
				user = res;
			});
		});

		describe('when topic exists', function() {

			var topic;

			beforeEach(function() {
				return graph.topics.create({ name: guid.raw().toLowerCase() })
				.then(function(createdTopic) {
					topic = createdTopic;
				});
			});

			describe('create', function() {
				it('should return a duplicate error when topic name already exists', function() {
					return service.create({ name: topic.name })
					.then(assert.expectFail, function(err) {
						assert.equal('duplicate', err.name);
					});
				});
			});

			describe('update', function() {
				var updatedName = guid.raw();
				it('should return the updated topic', function() {
					return service.update(topic.id, { name: updatedName })
					.then(function(updatedTopic) {
						assert.equal(updatedName, retrievedTopic.name);
					});
				});

				it('should update the topic', function() {
					return service.update(topic.id, { name: updatedName })
					.then(function() {
						return graph.topics.get(topic.id);
					})
					.then(function(retrievedTopic) {
						assert.equal(updatedName, retrievedTopic.name);
					});
				});
			});

			describe('get', function() {
				it('should retrieve the topic', function() {
					return service.get(topic.id)
					.then(function(retrievedTopic) {
						assert.equal(topic.name, retrievedTopic.name);
						assert.equal(topic.id, retrievedTopic.id);
					});
				});
			});

			describe('getLinkedTopics', function() {
				it('should return empty list', function() {
					return service.getLinkedTopics(topic.id, 'sub')
					.then(function(retrievedTopics) {
						assert.deepEqual([], retrievedTopics);
					});
				});
			});

			describe('destroy', function() {
				it('should delete the topic', function() {
					return service.destroy(topic.id)
					.then(function() {
						return graph.topics.get(topic.id);
					})
					.then(function(retrievedTopic) {
						assert.equal(undefined, retrievedTopic);
					});
				});
			});

			describe('search', function() {
				it('should find the topic by exact name', function() {
					return service.search({ q: topic.name })
					.then(function(foundTopics) {
						assert.equal(1, foundTopics.length);
						assert.equal(topic.id, foundTopics[0].id);
					});
				});

				it('should find the topic by partial name', function() {
					return service.search({ q: topic.name.substr(1) })
					.then(function(foundTopics) {
						assert.ok(foundTopics.length > 0);
						assert.ok(_.some(foundTopics, function(t) {
							return topic.id === t.id;
						}));
					});
				});

				it('should find the topic by name with different case', function() {
					return service.search({ q: topic.name.substr(1).toUpperCase() })
					.then(function(foundTopics) {
						assert.ok(foundTopics.length > 0);
						assert.ok(_.some(foundTopics, function(t) {
							return topic.id === t.id;
						}));
					});
				});
			});
		});

		describe('when two topics exist', function() {

			var topic, otherTopic;

			beforeEach(function() {
				return graph.topics.create({ name: guid.raw().toLowerCase() })
				.then(function(createdTopic) {
					topic = createdTopic;
					return graph.topics.create({ name: guid.raw().toLowerCase() });
				})
				.then(function(createdTopic) {
					otherTopic = createdTopic;
				});
			});

			it('should return duplicate error given a name that would be a duplicate', function() {
				service.update(topic.id, { name: otherTopic.name })
				.then(assert.expectFail, function(error) {
					assert.equal('duplicate', error.name);
				});
			});
		});

		describe('when topic containing special characters exists', function() {
			var topic;
			var ourGuid;

			beforeEach(function() {
				ourGuid = guid.raw();
				var topicName = (ourGuid + ' hey abboooot! ').toLowerCase();

				return graph.topics.create({ name: topicName })
				.then(function(createdTopic) {
					topic = createdTopic;
				});
			});

			describe('search', function() {
				it('finds the topic when the search contains spaces', function() {
					return service.search({ q: ourGuid + ' hey abboo' })
					.then(function(foundTopics) {
						assert.equal(1, foundTopics.length);
						assert.equal(topic.id, foundTopics[0].id);
					});
				});

				it('finds the topic when the search contains !', function() {
					return service.search({ q: ourGuid + ' hey abboooot!' })
					.then(function(foundTopics) {
						assert.equal(1, foundTopics.length);
						assert.equal(topic.id, foundTopics[0].id);
					});
				});
			});
		});

		describe('when topic has related topic', function() {

			var topic, relatedTopic;

			beforeEach(function() {
				return graph.topics.create({ name: guid.raw() })
				.then(function(createdTopic1) {
					topic = createdTopic1;
					return graph.topics.create({ name: 'related' + guid.raw() });
				})
				.then(function(createdTopic2) {
					relatedTopic = createdTopic2;
					return graph.relationships.create(topic.id, relatedTopic.id, 'sub');
				});
			});

			describe('get', function() {
				it('should retrieve the related topics', function() {
					return service.get(topic.id)
					.then(function(retrievedTopic) {
						assert.equal(1, retrievedTopic.sub.length);
						assert.equal(retrievedTopic.sub[0].id, retrievedTopic.id);
					});
				});
			});

			describe('getLinkedTopics', function() {
				it('should return the related topic', function() {
					return service.getLinkedTopics(topic.id, 'sub')
					.then(function(related) {
						assert.deepEqual([relatedTopic], related);
					});
				});
			});

			describe('linkTopic', function() {
				it('should return notfound error when parent topic is missing', function() {
					return service.linkTopic(topic.id, 99999, 'sub')
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});

			describe('linkTopic', function() {
				it('should return notfound error when child topic is missing', function() {
					return service.linkTopic(99999, topic.id, 'sub')
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});

			describe('linkTopic', function() {
				it('should return a duplicate error', function() {
					return service.linkTopic(topic.id, relatedTopic.id, 'sub')
					.then(assert.expectFail, function(err) {
						assert.equal('duplicate', err.name);
					});
				});
			});

			describe('unlinkTopic', function() {
				it('should return notfound error when parent topic is missing', function() {
					return service.unlinkTopic(topic.id, 99999, 'sub')
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});

				it('should return notfound error when child topic is missing', function() {
					return service.unlinkTopic(99999, topic.id, 'sub')
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});

				it('should unlink the related topic', function() {
					return service.unlinkTopic(topic.id, relatedTopic.id, 'sub')
					.then(function() {
						return graph.relationships.get(topic.id, relatedTopic.id, 'sub');
					})
					.then(function(link) {
						assert.equal(undefined, link);
					});
				});
			});
		});

		describe('when topic does not already exist', function() {

			describe('create', function() {
				it('should create the topic', function() {
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
			});

			describe('update', function() {
				it('should return notfound error', function() {
					return service.update(9999, { name: guid.raw() })
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});

			describe('get', function() {
				it('should return notfound error', function() {
					return service.get(99999)
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});

			describe('getLinkedTopics', function() {
				it('should return notfound error', function() {
					return service.getLinkedTopics(9999, 'sub')
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});

			describe('destroy', function() {
				it('should return a notfound error', function() {
					return service.destroy(9999)
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});

			describe('search', function() {
				it('should not find topics by name', function() {
					return service.search({ q: 'notfound' })
					.then(function(foundTopics) {
						assert.equal(0, foundTopics.length);
					});
				});
			});

			describe('linkRoot', function() {
				it('should return notfound error', function() {
					return service.linkRoot(9999)
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});

			describe('unlinkRoot', function() {
				it('should return notfound error', function() {
					return service.unlinkRoot(9999)
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});
		});

		describe('when given topic has no name', function() {
			describe('create', function() {
				it('should return an error', function() {
					return service.create({})
					.then(assert.expectFail, function(err) {
						assert.equal('name is required', err);
					});
				});
			});

			describe('update', function() {
				it('should return an error', function() {
					return service.update(999, {})
					.then(assert.expectFail, function(err) {
						assert.equal('name is required', err);
					});
				});
			});
		});

		describe('when topic link does not already exist', function() {
			var fromTopic;
			var toTopic;

			beforeEach(function() {
				return graph.topics.create({ name: guid.raw() })
				.then(function(firstCreatedTopic) {
					fromTopic = firstCreatedTopic;
					return graph.topics.create({ name: guid.raw() });
				})
				.then(function(secondCreatedTopic) {
					toTopic = secondCreatedTopic;
				});
			});

			describe('linkTopic', function() {
				it('should link the related topic', function() {
					return service.linkTopic(fromTopic.id, toTopic.id, 'sub')
					.then(function() {
						return graph.relationships.get(fromTopic.id, toTopic.id, 'sub');
					})
					.then(function(link) {
						assert.ok(link);
					});
				});
			});

			describe('unlinkTopic', function() {
				it('should return a notfound error', function() {
					return service.unlinkTopic(fromTopic.id, toTopic.id, 'sub')
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});
		});

		describe('when root topic does not already exist', function() {
			var topic;

			beforeEach(function() {
				return graph.topics.create({ name: guid.raw().toLowerCase() })
				.then(function(createdTopic) {
					topic = createdTopic;
				});
			});

			describe('linkRoot', function() {
				it('should make the topic a root topic', function() {
					return service.linkRoot(topic.id)
					.then(function() {
						return graph.relationships.get(0, topic.id, 'root');
					})
					.then(function(link) {
						assert.ok(link);
					});
				});
			});
		});

		describe('when root topic already exists', function() {
			var topic;

			beforeEach(function() {
				return graph.topics.create({ name: guid.raw().toLowerCase() })
				.then(function(createdTopic) {
					topic = createdTopic;
					return graph.relationships.create(0, topic.id, 'root');
				});
			});

			describe('getRootTopics', function() {
				it('should return the root topic', function() {
					return service.getRootTopics()
					.then(function(rootTopics) {
						assert.ok(_.some(rootTopics, function(t) {
							return topic.id === t.id;
						}));
					});
				});
			});

			describe('linkRoot', function() {
				it('should return a duplicate error', function() {
					return service.linkRoot(topic.id)
					.then(assert.expectFail, function(err) {
						assert.equal('duplicate', err.name);
					});
				});
			});

			describe('unlinkRoot', function() {
				it('should unlink the topic', function() {
					return service.unlinkRoot(topic.id)
					.then(function() {
						return graph.relationships.get(0, topic.id, 'root');
					})
					.then(function(rootTopics) {

					});
				});
			});
		});

		describe('when given an invalid relationship', function() {

			describe('linkTopic', function() {
				it('should return an invalid relationship error', function() {
					return service.linkTopic(1, 2, 'invalid')
					.then(assert.expectFail, function(err) {
						assert.notEqual(-1, err.indexOf('invalid relationship'));
					});
				});
			});

			describe('unlinkTopic', function() {
				it('should return an invalid relationship error', function() {
					return service.unlinkTopic(1, 2, 'invalid')
					.then(assert.expectFail, function(err) {
						assert.notEqual(-1, err.indexOf('invalid relationship'));
					});
				});
			});

			describe('getLinkedTopics', function() {
				it('should return an invalid relationship error', function() {
					return service.getLinkedTopics(1, 'invalid')
					.then(assert.expectFail, function(err) {
						assert.notEqual(-1, err.indexOf('invalid relationship'));
					});
				});
			});
		});

		describe('when the resource is not already linked to the topic', function() {
			var topic;
			var resource;

			beforeEach(function() {
				return graph.topics.create({name: guid.raw()})
				.then(function(createdTopic) {
					topic = createdTopic;
					return graph.resources.create({url: guid.raw(), title: guid.raw(),
						source: 'example.com', verb: 'read'});
				})
				.then(function(createdResource) {
					resource = createdResource;
				});
			});

			describe('linkResource', function() {
				it('should link the resource to the topic', function() {
					return service.linkResource(topic.id, resource.id)
					.then(function() {
						return graph.relationships.get(topic.id, resource.id, 'resources');
					})
					.then(function(link) {
						assert.ok(link);
					});
				});
			});

			describe('unlinkResource', function() {
				it('should return a notfound error', function() {
					return service.unlinkResource(topic.id, resource.id)
					.then(assert.expectFail, function(error) {
						assert.equal('notfound', error.name);
					});
				});
			});

			describe('getLink', function() {
				it('should return a notfound error', function() {
					return service.getLink(topic.id, resource.id, 'resources')
					.then(assert.expectFail, function(err) {
						assert.equal('notfound', err.name);
					});
				});
			});
		});

		describe('when the topic exists but the resource does not', function() {
			var topic;

			beforeEach(function() {
				return graph.topics.create({name: guid.raw()})
				.then(function(createdTopic) {
					topic = createdTopic;
				});
			});

			describe('linkResource', function() {
				it('should return notfound error', function() {
					return service.linkResource(topic.id, 99999)
					.then(assert.expectFail, function(error) {
						assert.equal('notfound', error.name);
					});
				});
			});

			describe('unlinkResource', function() {
				it('should return notfound error', function() {
					return service.unlinkResource(topic.id, 99999)
					.then(assert.expectFail, function(error) {
						assert.equal('notfound', error.name);
					});
				});
			});
		});

		describe('when the resource exists but the topic does not', function() {
			var resource;

			beforeEach(function() {
				return graph.resources.create({url: guid.raw(), title: guid.raw(), source: guid.raw(), verb: 'read'})
				.then(function(createdResource) {
					resource = createdResource;
				});
			});

			describe('linkResource', function() {
				it('should return notfound error', function() {
					return service.linkResource(99999, resource.id)
					.then(assert.expectFail, function(error) {
						assert.equal('notfound', error.name);
					});
				});
			});

			describe('unlinkResource', function() {
				it('should return notfound error', function() {
					return service.unlinkResource(99999, resource.id)
					.then(assert.expectFail, function(error) {
						assert.equal('notfound', error.name);
					});
				});
			});
		});

		describe('when the resource is already linked to the topic', function() {
			var topic;
			var resource;

			beforeEach(function() {
				return graph.topics.create({name: guid.raw()})
				.then(function(createdTopic) {
					topic = createdTopic;
					return graph.resources.create({url: guid.raw(), title: guid.raw(), source: guid.raw(), verb: 'read'});
				})
				.then(function(createdResource) {
					resource = createdResource;
					return graph.relationships.create(topic.id, resource.id, 'resources', {});
				});
			});

			describe('getLink', function() {
				it('should return the relationship', function() {
					return service.getLink(topic.id, resource.id, 'resources')
					.then(function(link) {
						assert.equal(topic.id, link.fromId);
						assert.equal(resource.id, link.toId);
						assert.equal('resources', link.relationshipType);
					});
				});
			});

			describe('linkResource', function() {
				it('should return a duplicate error', function() {
					return service.linkResource(topic.id, resource.id)
					.then(assert.expectFail, function(error) {
						assert.equal('duplicate', error.name);
					});
				});
			});

			describe('unlinkResource', function() {
				it('should unlink the resource', function() {
					return service.unlinkResource(topic.id, resource.id)
					.then(function() {
						return graph.relationships.get(topic.id, resource.id, 'resources');
					})
					.then(function(relationship) {
						assert.equal(undefined, relationship);
					});
				});
			});

			describe('hideResource', function() {
				it('should create a hide opinion on the resource relationship', function() {
					return service.hideResource(topic.id, resource.id, user.id)
					.then(function() {
						return graph.relationships.get(user.id, topic.id, 'opinion_hide');
					})
					.then(function(opinion) {
						assert.equal('resources', opinion.rel);
						assert.equal(resource.id, opinion.toId);
					});
				});

				it('should create a hide opinion on multiple linked resources', function() {
					return graph.resources.create({ title: guid.raw(), url: guid.raw(), source: guid.raw(), verb: 'read' })
					.then(function(anotherResource) {
						return graph.relationships.create(topic.id, anotherResource.id, 'resources')
						.then(function() {
							return service.hideResource(topic.id, resource.id, user.id);
						})
						.then(function() {
							return service.hideResource(topic.id, anotherResource.id, user.id);
						})
						.then(function() {
							return graph.relationships.getMany(user.id, topic.id, 'opinion_hide');
						})
						.then(function(opinions) {
							assert.ok(_.some(opinions, function(o) { return o.toId === resource.id; }));
							assert.ok(_.some(opinions, function(o) { return o.toId === anotherResource.id; }));
						});
					});
				});
			});
		});


		describe('when user already has a hidden relationship opinion', function() {
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
				})
				.then(function() {
					var opinionData = { rel: 'resources', toId: resource.id };
					return graph.relationships.create(user.id, topic.id, 'opinion_hide', opinionData);
				});
			});

			describe('hideResource', function() {
				it('should fail with a duplicate error', function() {
					return service.hideResource(topic.id, resource.id, user.id)
					.then(function() {
						return graph.relationships.get(user.id, topic.id, 'opinion_hide');
					})
					.then(assert.expectFail, function(err) {
						assert.equal('duplicate', err.name);
					});
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
