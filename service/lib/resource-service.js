var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph) {

	var requiredAttributes = [ 'title', 'url', 'source', 'verb' ];
	var searchableAttributes = [ 'title', 'url' ];
	var validVerbs = [ 'read', 'watch', 'listen', 'engage' ];
	var DEFAULT_RESULTS_PER_PAGE = 10;

	function updateTitleIndex(node, title, callback) {
		return graph.updateIndex(node, 'resources_title', 'title', title);
	}

	function updateUrlIndex(node, url) {
		return graph.updateIndex(node, 'resources_url', 'url', url);
	}

	function exactSearch(attribute, query) {
		if(!_.contains(searchableAttributes, attribute)) {
			return Q.reject('not a searchable attribute: ' + attribute);
		}
		if(attribute === 'url') {
			query = decodeURIComponent(query);
		}
		query = helper.escapeLuceneSpecialChars(query.toLowerCase());

		return graph.queryNodeIndex('resources_' + attribute, attribute + ':' + query)
		.fail(function(err) {
			if(err && helper.isMissingIndexError(err)) {
				return [];
			} else {
				throw err;
			}
		});
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

	return {

		create: function(resource) {

			for(var i = 0; i < requiredAttributes.length; i++) {
				if(!resource.hasOwnProperty(requiredAttributes[i]) || !resource[requiredAttributes[i]]) {
					return Q.reject(requiredAttributes[i] + ' is required');
				}
			}

			if(!_.contains(validVerbs, resource.verb)) {
				return Q.reject('invalid verb');
			}
	
			return checkForDuplicateNew(resource)
			.then(function() {
				var node = graph.createNode(resource);
				return graph.saveNode(node)
				.then(function() {
					return updateTitleIndex(node, resource.title);
				})
				.then(function() {
					return updateUrlIndex(node, resource.url);
				})
				.then(function() {
					return helper.makeNode(node._data);
				});
			});
		},

		get: function(id) {
			return graph.getNodeById(id)
			.then(function(resource) {
				return helper.makeNode(resource._data);
			}).fail(function(error) {
				error.name = 'notfound';
				throw error;
			});
		},

		update: function(id, resource) {

			return graph.getNodeById(id)
			.then(function(node) {
				for(var i = 0; i < requiredAttributes.length; i++) {
					if(!resource.hasOwnProperty(requiredAttributes[i]) || !resource[requiredAttributes[i]]) {
						return Q.reject(requiredAttributes[i] + ' is required');
					}
				}

				if(!_.contains(validVerbs, resource.verb)) {
					return Q.reject('invalid verb');
				}

				return checkForDuplicateUpdate(resource, id)
				.then(function() {
					node.data.title = resource.title;
					node.data.url = resource.url;
					node.data.source = resource.source;
					node.data.verb = resource.verb;
					return graph.saveNode(node);
				})
				.then(function() {
					return updateTitleIndex(node, resource.title);
				})
				.then(function() {
					return updateUrlIndex(node, resource.url);
				})
				.then(function() {
					return helper.makeNode(node._data);
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

			var search_string = params.q.toLowerCase() || '';
			var page = helper.parsePositiveInt(params.p) || 1;
			var per_page = helper.parsePositiveInt(params.pp) || DEFAULT_RESULTS_PER_PAGE;

			var cypherQuery = 'START n=node:resources_title({query}) RETURN n ' +
				'SKIP {s} LIMIT {l}';

			var cypherQueryParams = {
				query: 'title:*' + helper.escapeLuceneSpecialChars(search_string) + '*',
				s: (page - 1) * per_page,
				l: per_page
			};

			return graph.queryGraph(cypherQuery, cypherQueryParams)
			.then(function(results) {
				return helper.makeResources(results);
			}, function(err) {
				if(err && helper.isMissingIndexError(err)) {
					return [];
				} else {
					throw err;
				}
			});
		},

		deleteResource: function(id) {
			var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') return n';
			
			return graph.queryGraph(cypherQuery)
			.then(function(results) {
				if(results === undefined) {
					return Q.reject({name: 'notfound'});
				} else {
					return results[0].n;
				}
			})
			.then(function(resource) {
				return graph.deleteNode(resource);
			});
		}
	};
	
};
