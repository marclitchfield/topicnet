var Q = require('q');
var helper = require('../../service-helper');
var _ = require('underscore');

exports.create = function(neo4jGraph) {

	function makeResources(queryResults) {
		var resources = _.map(queryResults, function(result) {
			return result.n;
		});
		return resources;
	}

	return {

		create: function(resourceData) {
			return neo4jGraph.createNode(resourceData)
			.then(function(result) {
				return neo4jGraph.updateIndex(result.id, 'resources_title', 'title', resourceData.title)
				.then(function() {
					return neo4jGraph.updateIndex(result.id, 'resources_url', 'url', resourceData.url);
				})
				.then(function() {
					return result;
				});
			});
		},

		update: function(id, resourceData) {
			return neo4jGraph.updateNode(id, resourceData)
			.then(function(updatedResource) {
				return neo4jGraph.updateIndex(id, 'resource_title', 'title', resourceData.title)
				.then(function() {
					return neo4jGraph.updateIndex(id, 'resource_url', 'url', resourceData.url);
				})
				.then(function() {
					return updatedResource;
				});
			});
		},

		get: function(id) {
			return neo4jGraph.readNode(id)
			.fail(function(err) {
				if (err.name === 'notfound') {
					return Q.resolve(undefined);
				}
				throw err;
			});
		},

		getByAttribute: function(attributeName, attributeValue) {
			var query = helper.escapeLuceneSpecialChars(attributeValue.toLowerCase());
			return neo4jGraph.queryNodeIndex('resources_' + attributeName, attributeName + ':' + query)
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

			return neo4jGraph.queryGraph(cypherQuery, cypherQueryParams)
			.then(function(results) {
				return makeResources(results);
			});
		},

		destroy: function(id) {
			return neo4jGraph.deleteNode(id);
		}
	};
};