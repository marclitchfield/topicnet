var Q = require('q');
var helper = require('../../service-helper');
var _ = require('underscore');

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

exports.create = function(neo4jGraph) {

	return {

		create: function(topicData) {
			return neo4jGraph.createNode(topicData)
			.then(function(createdTopic) {
				return neo4jGraph.updateIndex(createdTopic.id, 'topics_name', 'name', topicData.name)
				.then(function() {
					return createdTopic;
				});
			});
		},

		update: function(id, topicData) {
			return neo4jGraph.updateNode(id, topicData)
			.then(function(updatedTopic) {
				return neo4jGraph.updateIndex(updatedTopic.id, 'topics_name', 'name', topicData.name)
				.then(function() {
					return updatedTopic;
				});
			});
		},

		get: function(id) {
			var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') MATCH n-[r?]->c RETURN n,r,c';

			return neo4jGraph.queryGraph(cypherQuery)
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
			return neo4jGraph.queryNodeIndex('topics_name', 'name:' + query)
			.then(function(results) {
				return results.length === 0 ? undefined : results[0];
			});
		},

		getRelated: function(fromId, relationshipType) {

			var cypherQuery = 'START origin=node(' + fromId + ') ' +
				'MATCH origin-[:' + relationshipType + ']->n RETURN n';

			return neo4jGraph.readNode(fromId)
			.then(function() {
				return neo4jGraph.queryGraph(cypherQuery);
			})
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

			return neo4jGraph.queryGraph(cypherQuery, cypherQueryParams)
			.then(function(results) {
				return makeTopics(results);
			});
		},

		destroy: function(id) {
			return neo4jGraph.deleteNode(id);
		}
	};
};