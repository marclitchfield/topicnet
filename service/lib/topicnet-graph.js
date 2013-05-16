var Q = require('q');
var helper = require('./service-helper');
var _ = require('underscore');


exports.create = function(graph) {

	function makeTopics(queryResult) {
		var topics = [];

		_.each(queryResult, function(result) {
			var id = result.n.id;

			var topic = _.find(topics, function(t) {
				return t.id === id;
			});

			if (topic === undefined) {
				topic = result.n;
				topics.push(topic);
			}

			if (result.r && result.c) {
				var rel = result.r.type;
				if (!topic.hasOwnProperty(rel)) {
					topic[rel] = [];
				}

				result.c.score = result.r.score || 0;
				topic[rel].push(result.c);
			}
		});

		return topics;
	}

	function makeResources(queryResults) {
		var resources = _.map(queryResults, function(result) {
			return result.n;
		});
		return resources;
	}

	return {

		topics: {

			create: function(topicData) {
				return graph.createNode(topicData)
				.then(function(createdTopic) {
					return graph.updateIndex(createdTopic.id, 'topics_name', 'name', topicData.name)
					.then(function() {
						return createdTopic;
					});
				});
			},

			update: function(id, topicData) {
				return graph.updateNode(id, topicData)
				.then(function(updatedTopic) {
					return graph.updateIndex(updatedTopic.id, 'topics_name', 'name', topicData.name)
					.then(function() {
						return updatedTopic;
					});
				});
			},

			get: function(id) {
				var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') MATCH n-[r?]->c RETURN n,r,c';

				return graph.queryGraph(cypherQuery)
				.then(function(results) {
					if (results.length < 1) {
						return undefined;
					} else {
						return makeTopics(results)[0];
					}
				});
			},

			getByName: function(name) {
				var query = helper.escapeLuceneSpecialChars(name.toLowerCase());
				return graph.queryNodeIndex('topics_name', 'name:' + query)
				.then(function(results) {
					return results.length === 0 ? undefined : results[0];
				});
			},

			getRelated: function(fromId, relationshipType) {
				var cypherQuery = 'START origin=node(' + parseInt(fromId, 10) + ') ' +
					'MATCH origin-[:' + relationshipType + ']->n RETURN n';

				return graph.queryGraph(cypherQuery)
				.then(function(results) {
					return makeTopics(results);
				});
			},

			searchByName: function(searchString, page, perPage) {
				var cypherQuery = 'START n=node:topics_name({query}) RETURN n ' +
					'SKIP {s} LIMIT {l}';

				var cypherQueryParams = {
					query: 'name:*' + helper.escapeLuceneSpecialChars(searchString.toLowerCase()) + '*',
					s: (page - 1) * perPage,
					l: perPage
				};

				return graph.queryGraph(cypherQuery, cypherQueryParams)
				.then(function(results) {
					return makeTopics(results);
				});
			},

			destroy: function(id) {
				return graph.deleteNode(id);
			}
		},

		relationships: {

			create: function(fromId, toId, relationshipType) {
				return graph.createRelationshipBetween(fromId, toId, relationshipType);
			},

			get: function(fromId, toId, relationshipType) {
				return graph.queryRelationship(fromId, toId, relationshipType)
				.then(function(results) {
					return results.length === 0 ? undefined : results[0].r;
				});
			},

			exists: function(nodeId, relationshipTypes) {
				return graph.hasRelationships(nodeId, relationshipTypes);
			},

			destroy: function(relationshipId) {
				return graph.deleteRelationship(relationshipId);
			}
		},

		resources: {

			create: function(resourceData) {
				return graph.createNode(resourceData)
				.then(function(result) {
					return graph.updateIndex(result.id, 'resources_title', 'title', resourceData.title)
					.then(function() {
						return graph.updateIndex(result.id, 'resources_url', 'url', resourceData.url);
					})
					.then(function() {
						return result;
					});
				});
			},

			update: function(id, resourceData) {
				return graph.updateNode(id, resourceData)
				.then(function(updatedResource) {
					return graph.updateIndex(id, 'resource_title', 'title', resourceData.title)
					.then(function() {
						return graph.updateIndex(id, 'resource_url', 'url', resourceData.url);
					})
					.then(function() {
						return updatedResource;
					});
				});
			},

			get: function(id) {
				return graph.readNode(id);
			},

			getByAttribute: function(attributeName, attributeValue) {
				var query = helper.escapeLuceneSpecialChars(attributeValue.toLowerCase());
				return graph.queryNodeIndex('resources_' + attributeName, attributeName + ':' + query)
				.then(function(results) {
					return results.length === 0 ? undefined : results[0];
				});
			},

			searchByTitle: function(searchString, page, perPage) {
				var cypherQuery = 'START n=node:resources_title({query}) RETURN n ' +
					'SKIP {s} LIMIT {l}';

				var cypherQueryParams = {
					query: 'title:*' + helper.escapeLuceneSpecialChars(searchString) + '*',
					s: (page - 1) * perPage,
					l: perPage
				};

				return graph.queryGraph(cypherQuery, cypherQueryParams)
				.then(function(results) {
					return makeResources(results);
				});
			},

			destroy: function(id) {
				return graph.deleteNode(id);
			}
		}
	};

};
