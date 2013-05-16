var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph, topicnetGraph) {

	var requiredAttributes = [ 'title', 'url', 'source', 'verb' ];
	var searchableAttributes = [ 'title', 'url' ];
	var validVerbs = [ 'read', 'watch', 'listen', 'engage' ];
	var DEFAULT_RESULTS_PER_PAGE = 10;

	function checkForDuplicateNew(newValues) {
		return topicnetGraph.getResourceByAttribute('title', newValues.title)
		.then(function(resource) {
			if(resource !== undefined) {
				return Q.reject( { name: 'duplicate', message: 'A resource with the specified title already exists' } );
			}
			return topicnetGraph.getResourceByAttribute('url', decodeURIComponent(newValues.url));
		})
		.then(function(resource) {
			if(resource !== undefined) {
				return Q.reject( { name: 'duplicate', message: 'A resource with the specified url already exists' } );
			}
		});
	}

	function checkForDuplicateUpdate(updatedValues, resourceId) {
		function filterResults(results) {
			return _.reject(results, function(r) {
				return r.id === resourceId;
			});
		}

		return topicnetGraph.getResourceByAttribute('title', updatedValues.title)
		.then(function(resource) {
			if (resource !== undefined && resource.id !== updatedValues.id) {
				return Q.reject({ name: 'duplicate', message: 'Another resource exists with the specified title' });
			}
			return topicnetGraph.getResourceByAttribute('url', decodeURIComponent(updatedValues.url));
		})
		.then(function(resource) {
			if(resource !== undefined && resource.id !== updatedValues.id) {
				return Q.reject({ name: 'duplicate', message: 'Another resource exists with the specified url' });
			}
		});
	}

	function validateRequest(data) {
		for(var i = 0; i < requiredAttributes.length; i++) {
			if(!data.hasOwnProperty(requiredAttributes[i]) || !data[requiredAttributes[i]]) {
				return Q.reject(requiredAttributes[i] + ' is required');
			}
		}
		if(!_.contains(validVerbs, data.verb)) {
			return Q.reject('invalid verb');
		}
		return undefined;
	}

	return {

		create: function(resourceData) {
			var validationRejection = validateRequest(resourceData);
			if (validationRejection) {
				return validationRejection;
			}
	
			return checkForDuplicateNew(resourceData)
			.then(function() {
				return topicnetGraph.createResource(resourceData);
			});
		},

		get: function(id) {
			return topicnetGraph.getResource(id)
			.then(function(resource) {
				if (resource === undefined) {
					return Q.reject({name: 'notfound', message: 'resource with id ' + id + ' not found'});
				} else {
					return resource;
				}
			});
		},

		update: function(id, resourceData) {
			var validationRejection = validateRequest(resourceData);
			if (validationRejection) {
				return validationRejection;
			}

			return checkForDuplicateUpdate(resourceData, id)
			.then(function() {
				var updateData = {
					title: resourceData.title,
					url: resourceData.url,
					source: resourceData.source,
					verb: resourceData.verb
				};
				return topicnetGraph.updateResource(id, updateData);
			});
		},

		searchByTitle: function(title) {
			return topicnetGraph.getResourceByAttribute('title', title)
			.then(function(resource) {
				return resource !== undefined ? [resource] : [];
			});
		},

		searchByUrl: function(url) {
			return topicnetGraph.getResourceByAttribute('url', url)
			.then(function(resource) {
				return resource !== undefined ? [resource] : [];
			});
		},

		search: function(params) {
			var searchString = params.q.toLowerCase() || '';
			var page = helper.parsePositiveInt(params.p) || 1;
			var perPage = helper.parsePositiveInt(params.pp) || DEFAULT_RESULTS_PER_PAGE;

			return topicnetGraph.searchResourcesByTitle(searchString, page, perPage);
		},

		deleteResource: function(id) {
			return topicnetGraph.hasRelationships(id, ['resources'])
			.then(function(hasRelationships) {
				if(hasRelationships) {
					return Q.reject('cannot delete resource because it still has relationships');
				} else {
					return topicnetGraph.deleteResource(id);
				}
			});
		}

	};
	
};
