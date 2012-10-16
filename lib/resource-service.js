var _ = require('underscore');
var helper = require('./service-helper');

exports.createService = function(graph) {

	var requiredAttributes = [ 'title', 'url', 'source' ];
	var searchableAttributes = [ 'title', 'url' ];

	function updateTitleIndex(node, title, callback) {
		node.index('resources_title', 'title', title.toLowerCase(), callback);
	}

	function updateUrlIndex(node, url, callback) {
		node.index('resources_url', 'url', url.toLowerCase(), callback);
	}

	function search(attribute, query, success, fail) {
	  if(!_.contains(searchableAttributes, attribute)) {
			fail();
			return;
		}
		if(attribute === 'url') {
			query = decodeURIComponent(query);
		}
		query = helper.escapeLuceneSpecialChars(query);
		graph.queryNodeIndex('resources_' + attribute, attribute + ':*' + query + '*', function(err, results) {
			if (err) {
					fail(err);
			} else if (results === undefined) {
					fail({name: 'notfound'});
			} else {
				var resources = _.map(results, function(r) {
					return helper.makeNode(r);
				});
				success(resources);
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

	// checks to see if the newValues would create a duplicate resource 
	// callbacks are of the form: yes(err), no()
	function checkForDuplicateNew(newValues, yes, no) {
		findResourceByAttribute('title', newValues.title, function(err, resources) {
			if(err) {
				yes(err);
			} else if(resources && resources.length > 0) {
				yes( { name: 'duplicate', message: 'A resource with the specified title already exists' } );
			} else {
				findResourceByAttribute('url', newValues.url, function(err, resources) {
					if(err) {
						yes(err);
					} else if(resources && resources.length > 0) {
						yes( { name: 'duplicate', message: 'A resource with the specified url already exists' } );
					} else {
						no();
					}
				});
			}
		});
	}

	// checks to see if the updatedValues would create a duplicate for
	// the existing Resource with the given resourceId
	// callbacks are of the form yes(err), no()
	function checkForDuplicateUpdate(updatedValues, resourceId, yes, no) {

		function filterResults(results) {
			return _.reject(results, function(r) { 
				return r.id === resourceId;
			});
		}

		findResourceByAttribute('title', updatedValues.title, function(err, results) {
			var resultsOtherThanThis = filterResults(results);
			if(err) {
				yes(err);
			} else if(resultsOtherThanThis.length > 0) {
				yes( { name: 'duplicate', message: 'Another resource exists with the specified title' } );
			} else {
				findResourceByAttribute('url', updatedValues.url, function(err, results) {
					resultsOtherThanThis = filterResults(results); 
					if(err) {
						yes(err);
					} else if(resultsOtherThanThis.length > 0) {
						yes( { name: 'duplicate', message: 'Another resource exists with the specified url' } );
					} else {
						no();
					}
				});
			}
		});

	}

	return {

		create: function(resource, success, fail) {

			for(var i = 0; i < requiredAttributes.length; i++) {
				if(!resource.hasOwnProperty(requiredAttributes[i]) || !resource[requiredAttributes[i]]) {
					fail(requiredAttributes[i] + ' is required');
					return;
				}
			}
	
			checkForDuplicateNew(resource, fail,
				function() {
					var node = graph.createNode(resource);
					node.save(function(err, result) {
						if (err) {
							fail(err);
						} else {
							updateTitleIndex(node, resource.title, function(err, result) {
								if (err) {
									fail(err);
								} else {
									updateUrlIndex(node, resource.url, function(err, result) {
										if(err) {
											fail(err);
										} else {
											success(helper.makeNode(node._data));
										}
									});
								}
							});
						}
					});
				}
			);
	
		},

		get: function(id, success, fail) {

			graph.getNodeById(id, function(err, resource) {
				if(err || resource === undefined) {
					fail({name: 'notfound'});
				} else {
					success(helper.makeNode(resource._data));
				}
			});			

		},

		update: function(id, resource, success, fail) {

			graph.getNodeById(id, function(err, node) {
			
				if(err || node === undefined) {
					fail({name: 'notfound'});
					return;
				}

				for(var i = 0; i < requiredAttributes.length; i++) {
					if(!resource.hasOwnProperty(requiredAttributes[i]) || !resource[requiredAttributes[i]]) {
						fail(requiredAttributes[i] + ' is required');
						return;
					}
				}

				checkForDuplicateUpdate(resource, id, fail, function() {
					node.data.title = resource.title;
					node.data.url = resource.url;
					node.data.source = resource.source;
					node.save(function(err, result) {
						if (err) {
							fail(err); 
						} else {
							updateTitleIndex(node, resource.title, function(err, result) {
								if (err) {
									fail(err);
								} else {
									updateUrlIndex(node, resource.url, function(err, result) {
										if(err) {
											fail(err);
										} else {
											success(helper.makeNode(node._data));
										}
									});
								}
							});
						}
					});
				});

			}); // end graph.getNodeById

		},

		searchByTitle: function(query, success, fail) {
			search('title', query, success, fail);
		},

		searchByUrl: function(query, success, fail) {
			search('url', query, success, fail);
		}

	};
	
}
