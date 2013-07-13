var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');
var error = require('../error');

exports.create = function(graph) {

	var requiredAttributes = [ 'title', 'url', 'source', 'verb' ];
	var searchableAttributes = [ 'title', 'url' ];
	var validVerbs = [ 'read', 'watch', 'listen', 'engage' ];
	var DEFAULT_RESULTS_PER_PAGE = 10;

	function checkForDuplicateNew(newValues) {
		return graph.resources.getByAttribute('title', newValues.title)
		.then(function(resource) {
			if(resource !== undefined) {
				return error.promise( { name: 'duplicate', message: 'A resource with the specified title already exists' } );
			}
			return graph.resources.getByAttribute('url', decodeURIComponent(newValues.url));
		})
		.then(function(resource) {
			if(resource !== undefined) {
				return error.promise( { name: 'duplicate', message: 'A resource with the specified url already exists' } );
			}
		});
	}

	function checkForDuplicateUpdate(updatedValues, resourceId) {
		function filterResults(results) {
			return _.reject(results, function(r) {
				return r.id === resourceId;
			});
		}

		return graph.resources.getByAttribute('title', updatedValues.title)
		.then(function(resource) {
			if (resource !== undefined && resource.id !== updatedValues.id) {
				return error.promise({ name: 'duplicate', message: 'Another resource exists with the specified title' });
			}
			return graph.resources.getByAttribute('url', decodeURIComponent(updatedValues.url));
		})
		.then(function(resource) {
			if(resource !== undefined && resource.id !== updatedValues.id) {
				return error.promise({ name: 'duplicate', message: 'Another resource exists with the specified url' });
			}
		});
	}

	function validateRequest(data) {
		for(var i = 0; i < requiredAttributes.length; i++) {
			if(!data.hasOwnProperty(requiredAttributes[i]) || !data[requiredAttributes[i]]) {
				return error.promise(requiredAttributes[i] + ' is required');
			}
		}
		if(!_.contains(validVerbs, data.verb)) {
			return error.promise('invalid verb');
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
				return graph.resources.create(resourceData);
			});
		},

		get: function(id) {
			return graph.resources.get(id)
			.then(function(resource) {
				if (resource === undefined) {
					return error.promise({name: 'notfound', message: 'resource with id ' + id + ' not found'});
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
				return graph.resources.update(id, updateData);
			});
		},

		searchByTitle: function(title) {
			return graph.resources.getByAttribute('title', title)
			.then(function(resource) {
				return resource !== undefined ? [resource] : [];
			});
		},

		searchByUrl: function(url) {
			return graph.resources.getByAttribute('url', url)
			.then(function(resource) {
				return resource !== undefined ? [resource] : [];
			});
		},

		search: function(params) {
			var searchString = params.q.toLowerCase() || '';
			var page = helper.parsePositiveInt(params.p) || 1;
			var perPage = helper.parsePositiveInt(params.pp) || DEFAULT_RESULTS_PER_PAGE;

			return graph.resources.searchByTitle(searchString, page, perPage);
		},

		destroy: function(id) {
			return graph.relationships.exists(id, ['resources'])
			.then(function(hasRelationships) {
				if(hasRelationships) {
					return error.promise('cannot delete resource because it still has relationships');
				} else {
					return graph.resources.destroy(id);
				}
			});
		}

	};

};
