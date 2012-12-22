var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph) {

	var requiredAttributes = [ 'title', 'url', 'source', 'verb' ];
	var searchableAttributes = [ 'title', 'url' ];
	var validVerbs = [ 'read', 'watch', 'listen', 'engage' ];
	var DEFAULT_RESULTS_PER_PAGE = 10;

	function updateTitleIndex(node, title, callback) {
		var deferred = Q.defer();
		node.index('resources_title', 'title', title.toLowerCase(), deferred.makeNodeResolver());
		return deferred.promise;
	}

	function updateUrlIndex(node, url, callback) {
		var deferred = Q.defer();
		node.index('resources_url', 'url', url.toLowerCase(), deferred.makeNodeResolver());
		return deferred.promise;
	}

	function saveNode(node) {
		var deferred = Q.defer();
		node.save(deferred.makeNodeResolver());
		return deferred.promise;
	}

	function queryNodeIndex(indexName, indexQuery) {
		var deferred = Q.defer();
		graph.queryNodeIndex(indexName, indexQuery, function(err, results) {
			if(err || results === undefined) {
				deferred.resolve([]);
			} else {
				deferred.resolve(_.map(results, function(r) {
					return helper.makeNode(r);
				}));
			}
		});
		return deferred.promise;
	}

	function exactSearch(attribute, query, success, fail) {
		if(!_.contains(searchableAttributes, attribute)) {
			fail();
			return;
		}
		if(attribute === 'url') {
			query = decodeURIComponent(query);
		}
		query = helper.escapeLuceneSpecialChars(query.toLowerCase());
		graph.queryNodeIndex('resources_' + attribute, attribute + ':' + query, function(err, results) {
			if(err && helper.isMissingIndexError(err)) {
				success([]);
			} else if (err) {
				fail(err);
			} else {
				var resources = _.map(results, function(r) {
					return helper.makeNode(r);
				});
				success(resources);
			}
		});
	}

	function exactSearchPromise(attribute, query) {
		if(!_.contains(searchableAttributes, attribute)) {
			return Q.reject('not a searchable attribute: ' + attribute);
		}
		if(attribute === 'url') {
			query = decodeURIComponent(query);
		}
		query = helper.escapeLuceneSpecialChars(query.toLowerCase());

		return queryNodeIndex('resources_' + attribute, attribute + ':' + query)
		.fail(function(err) {
			if(err && helper.isMissingIndexError(err)) {
				return [];
			} else {
				throw err;
			}
		});
	}

	// callback is of the form function(err, results)
	function findResourceByAttribute(attributeName, attributeValue, callback) {
		if(!_.contains(searchableAttributes, attributeName)) {
			callback({ name: 'ResourceServiceError', message: 'An invalid attributeName was passed to findResourceByAttribute' });
			return;
		}
		if(attributeName === 'url') {
			attributeValue = decodeURIComponent(attributeValue);
		}
		var query = helper.escapeLuceneSpecialChars(attributeValue.toLowerCase());
		graph.queryNodeIndex('resources_' + attributeName, attributeName + ':' + query, function(err, results) {
			if(err || results === undefined) results = [];
			var resources = _.map(results, function(r) {
				return helper.makeNode(r);
			});
			callback(null, resources);
		});
	}

	function findResourceByAttributePromise(attributeName, attributeValue) {
		if(!_.contains(searchableAttributes, attributeName)) {
			return Q.reject({ name: 'ResourceServiceError', message: 'An invalid attributeName was passed to findResourceByAttribute' });
		}
		if(attributeName === 'url') {
			attributeValue = decodeURIComponent(attributeValue);
		}
		var query = helper.escapeLuceneSpecialChars(attributeValue.toLowerCase());
		return queryNodeIndex('resources_' + attributeName, attributeName + ':' + query);
	}

	// checks to see if the newValues would create a duplicate resource
	// callbacks are of the form: yes(err), no()
	function checkForDuplicateNew(newValues) {
		
		return findResourceByAttributePromise('title', newValues.title)
		.then(function(resources) {
			if(resources && resources.length > 0) {
				return Q.reject( { name: 'duplicate', message: 'A resource with the specified title already exists' } );
			}
		})
		.then(function() {
			return findResourceByAttributePromise('url', newValues.url)
			.then(function(resources) {
				if(resources && resources.length > 0) {
					return Q.reject( { name: 'duplicate', message: 'A resource with the specified url already exists' } );
				}
			});
		});
	}

	// checks to see if the updatedValues would create a duplicate for
	// the existing Resource with the given resourceId
	// callbacks are of the form yes(err), no()
	function checkForDuplicateUpdate(updatedValues, resourceId) {

		function filterResults(results) {
			return _.reject(results, function(r) {
				return r.id === resourceId;
			});
		}

		return findResourceByAttributePromise('title', updatedValues.title)
		.then(function(results) {
			var resultsOtherThanThis = filterResults(results);
			if(resultsOtherThanThis.length > 0) {
				return Q.reject({ name: 'duplicate', message: 'Another resource exists with the specified title' });
			} else {
				return findResourceByAttributePromise('url', updatedValues.url);
			}
		})
		.then(function(results) {
			var resultsOtherThanThis = filterResults(results);
			if(resultsOtherThanThis.length > 0) {
				return Q.reject({ name: 'duplicate', message: 'Another resource exists with the specified url' });
			}
		});
	}

	function queryGraph(cypherQuery, params) {
		var deferred = Q.defer();
		graph.query(cypherQuery, params, function(err, results) {
			if (err && results !== undefined) {
				return deferred.reject(err);
			} else {
				return deferred.resolve(results);
			}
		});
		return deferred.promise;
	}

	function getNodeById(id) {
		var deferred = Q.defer();
		graph.getNodeById(id, deferred.makeNodeResolver());
		return deferred.promise.then(function(node) {
			if (node === undefined) {
				return Q.reject({name: 'notfound'});
			} else {
				return node;
			}
		})
		.fail(function(error) {
			error.name = 'notfound';
			throw error;
		});
	}

	function deleteNode(node) {
		var deferred = Q.defer();
		node.del(deferred.makeNodeResolver());
		return deferred.promise;
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
				return saveNode(node)
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
			return getNodeById(id)
			.then(function(resource) {
				return helper.makeNode(resource._data);
			}).fail(function(error) {
				error.name = 'notfound';
				throw error;
			});
		},

		update: function(id, resource, success, fail) {

			return getNodeById(id)
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
					return saveNode(node);
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
			return exactSearchPromise('title', query);
		},

		searchByUrl: function(query) {
			return exactSearchPromise('url', query);
		},

		/*
		* query is an object like { q: 'search string', p: '1', pp: '5' }
		*   q: the search string
		*   p: page number (defaults to 1)
		*   pp: results per page (defaults to DEFAULT_RESULTS_PER_PAGE)
		*/
		search: function(query, success, fail) {
			var page = 1;
			var per_page = DEFAULT_RESULTS_PER_PAGE;

			var search_string = query.q.toLowerCase() || '';
			if(query.p !== undefined) {
				page = parseInt(query.p, 10);
				if(page < 1)
					page = 1;
			}
			if(query.pp !== undefined) {
				per_page = parseInt(query.pp, 10);
				if(per_page < 1)
					per_page = DEFAULT_RESULTS_PER_PAGE;
			}

			search_string = helper.escapeLuceneSpecialChars(search_string);
			var cypherQuery = 'START n=node:resources_title({query}) RETURN n ' +
				'SKIP {s} LIMIT {l}';

			var params = {
				query: 'title:*' + search_string + '*',
				s: (page - 1) * per_page,
				l: per_page
			};

			return queryGraph(cypherQuery, params)
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

		deleteResource: function(id, success, fail) {
			var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') return n';
			return queryGraph(cypherQuery)
			.then(function(results) {
				if(results === undefined) {
					return Q.reject({name: 'notfound'});
				} else {
					return results[0].n;
				}
			})
			.then(function(resource) {
				return deleteNode(resource);
			});
		}
	};
	
};
