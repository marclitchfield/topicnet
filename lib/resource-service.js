var _ = require('underscore');
var helper = require('./service-helper');

exports.createService = function(graph) {

	var requiredAttributes = [ 'title', 'url', 'source' ];
	var searchableAttributes = [ 'title', 'url' ];

	function updateTitleIndex(node, resource, callback) {
		node.index('resources_title', 'title', resource.title.toLowerCase(), callback);
	}

	function updateUrlIndex(node, resource, callback) {
		node.index('resources_url', 'url', resource.url.toLowerCase(), callback);
	}

	function search(attribute, query, success, fail) {
	  if(!_.contains(searchableAttributes, attribute)) fail();
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

	return {

		create: function(resource, success, fail) {

			for(var i = 0; i < requiredAttributes.length; i++) {
				if(!resource.hasOwnProperty(requiredAttributes[i]) || !resource[requiredAttributes[i]]) {
					fail(requiredAttributes[i] + ' is required');
					return;
				}
			}
			
			var node = graph.createNode(resource);

			node.save(function(err, result) {
				if (err) {
					fail(err);
				} else {
					updateTitleIndex(node, resource, function(err, result) {
						if (err) {
							fail(err);
						} else {
							updateUrlIndex(node, resource, function(err, result) {
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

		searchByTitle: function(query, success, fail) {
			search('title', query, success, fail);
		},

		searchByUrl: function(query, success, fail) {
			search('url', query, success, fail);
		}

	};
	
}
