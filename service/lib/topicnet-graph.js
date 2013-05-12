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

	return {

		createTopic: function(topicData) {
			return graph.createNode(topicData)
			.then(function(createdTopic) {
				return graph.updateIndex(createdTopic.id, 'topics_name', 'name', topicData.name)
				.then(function() {
					return createdTopic;
				});
			});
		},

		updateTopic: function(id, topicData) {
			return graph.updateNode(id, topicData)
			.then(function(updatedTopic) {
				return graph.updateIndex(updatedTopic.id, 'topics_name', 'name', topicData.name)
				.then(function() {
					return updatedTopic;
				});
			});
		},

		getTopic: function(id) {
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

		getTopicByName: function(name) {
			var query = helper.escapeLuceneSpecialChars(name.toLowerCase());
			return graph.queryNodeIndex('topics_name', 'name:' + query)
			.then(function(results) {
				return results.length === 0 ? undefined : results[0];
			});
		},

		searchTopicsByName: function(searchString, page, perPage) {
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

		deleteTopic: function(id) {
			return graph.deleteNode(id);
		},

		createRelationship: function(fromId, toId, relationshipType) {
			return graph.createRelationshipBetween(fromId, toId, relationshipType);
		},

		getRelationship: function(fromId, toId, relationshipType) {
			return graph.queryRelationship(fromId, toId, relationshipType)
			.then(function(results) {
				return results.length === 0 ? undefined : results[0].r;
			});
		},

		deleteRelationship: function(relationshipId) {
			return graph.deleteRelationship(relationshipId);
		}
	};

};
