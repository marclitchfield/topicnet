var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph) {

	var requiredAttributes = [ 'title', 'url', 'source', 'verb' ];
	var searchableAttributes = [ 'title', 'url' ];
	var validVerbs = [ 'read', 'watch', 'listen', 'engage' ];
	var DEFAULT_RESULTS_PER_PAGE = 10;

	function updateTitleIndex(nodeId, title, callback) {
		return graph.updateIndex(nodeId, 'resources_title', 'title', title);
	}

	function updateUrlIndex(nodeId, url) {
		return graph.updateIndex(nodeId, 'resources_url', 'url', url);
	}

	function exactSearch(attribute, query) {
		if(!_.contains(searchableAttributes, attribute)) {
			return Q.reject('not a searchable attribute: ' + attribute);
		}
		if(attribute === 'url') {
			query = decodeURIComponent(query);
		}
		query = helper.escapeLuceneSpecialChars(query.toLowerCase());
		return graph.queryNodeIndex('resources_' + attribute, attribute + ':' + query);
	}

	function findResourceByAttribute(attributeName, attributeValue) {
		if(!_.contains(searchableAttributes, attributeName)) {
			return Q.reject({ name: 'ResourceServiceError', message: 'An invalid attributeName was passed to findResourceByAttribute' });
		}
		if(attributeName === 'url') {
			attributeValue = decodeURIComponent(attributeValue);
		}
		var query = helper.escapeLuceneSpecialChars(attributeValue.toLowerCase());
		return graph.queryNodeIndex('resources_' + attributeName, attributeName + ':' + query);
	}

	function checkForDuplicateNew(newValues) {
		return findResourceByAttribute('title', newValues.title)
		.then(function(resources) {
			if(resources && resources.length > 0) {
				return Q.reject( { name: 'duplicate', message: 'A resource with the specified title already exists' } );
			}
		})
		.then(function() {
			return findResourceByAttribute('url', newValues.url)
			.then(function(resources) {
				if(resources && resources.length > 0) {
					return Q.reject( { name: 'duplicate', message: 'A resource with the specified url already exists' } );
				}
			});
		});
	}

	function checkForDuplicateUpdate(updatedValues, resourceId) {
		function filterResults(results) {
			return _.reject(results, function(r) {
				return r.id === resourceId;
			});
		}

		return findResourceByAttribute('title', updatedValues.title)
		.then(function(results) {
			var resultsOtherThanThis = filterResults(results);
			if(resultsOtherThanThis.length > 0) {
				return Q.reject({ name: 'duplicate', message: 'Another resource exists with the specified title' });
			} else {
				return findResourceByAttribute('url', updatedValues.url);
			}
		})
		.then(function(results) {
			var resultsOtherThanThis = filterResults(results);
			if(resultsOtherThanThis.length > 0) {
				return Q.reject({ name: 'duplicate', message: 'Another resource exists with the specified url' });
			}
		});
	}

	function makeResources(queryResults) {
		var resources = _.map(queryResults, function(result) {
			return result.n;
		});
		return resources;
	}

	return {

		create: function(resourceData) {
			var result;
			for(var i = 0; i < requiredAttributes.length; i++) {
				if(!resourceData.hasOwnProperty(requiredAttributes[i]) || !resourceData[requiredAttributes[i]]) {
					return Q.reject(requiredAttributes[i] + ' is required');
				}
			}
			if(!_.contains(validVerbs, resourceData.verb)) {
				return Q.reject('invalid verb');
			}
	
			return checkForDuplicateNew(resourceData)
			.then(function() {
				return graph.createNode(resourceData)
				.then(function(nodeData) {
					result = nodeData;
					return updateTitleIndex(result.id, resourceData.title);
				})
				.then(function() {
					return updateUrlIndex(result.id, resourceData.url);
				})
				.then(function() {
					return result;
				});
			});
		},

		get: function(id) {
			return graph.readNode(id);
		},

		update: function(id, data) {
			var result;
			return graph.readNode(id)
			.then(function() {

				for(var i = 0; i < requiredAttributes.length; i++) {
					if(!data.hasOwnProperty(requiredAttributes[i]) || !data[requiredAttributes[i]]) {
						return Q.reject(requiredAttributes[i] + ' is required');
					}
				}
				if(!_.contains(validVerbs, data.verb)) {
					return Q.reject('invalid verb');
				}

				return checkForDuplicateUpdate(data, id)
				.then(function() {
					var updateData = {
						title: data.title,
						url: data.url,
						source: data.source,
						verb: data.verb
					};
					return graph.updateNode(id, updateData);
				})
				.then(function(nodeData) {
					result = nodeData;
					return updateTitleIndex(id, data.title);
				})
				.then(function() {
					return updateUrlIndex(id, data.url);
				})
				.then(function() {
					return result;
				});
			});
		},

		searchByTitle: function(query) {
			return exactSearch('title', query);
		},

		searchByUrl: function(query) {
			return exactSearch('url', query);
		},

		search: function(params) {
			var searchString = params.q.toLowerCase() || '';
			var page = helper.parsePositiveInt(params.p) || 1;
			var perPage = helper.parsePositiveInt(params.pp) || DEFAULT_RESULTS_PER_PAGE;

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

		deleteResource: function(id) {
			return graph.hasRelationships(id, ['resources'])
			.then(function(hasRelationships) {
				if(hasRelationships) {
					return Q.reject('cannot delete resource because it still has relationships');
				} else {
					return graph.deleteNode(id);
				}
			});
		}

	};
	
};
