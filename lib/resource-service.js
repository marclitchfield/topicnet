exports.createService = function(graph) {

	var requiredAttributes = [ 'title', 'url', 'source' ];

	// TODO: this is exactly the same function just renamed from createTopic in topic-service, DRY
	function makeResource(nodeData) {
		var topic = nodeData.data;
		topic.id = parseNodeId(nodeData);
		return topic;
	}

	// TODO: this is exactly duplicated from topic-service, DRY it up!
	function parseNodeId(nodeData) {
		var url = nodeData.self;
		return parseInt(url.split('/').pop(), 10);
	}

	function updateTitleIndex(node, resource, callback) {
		node.index('resources_title', 'title', resource.title.toLowerCase(), callback);
	}

	function updateUrlIndex(node, resource, callback) {
		node.index('resources_url', 'url', resource.url.toLowerCase(), callback);
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
									success(makeResource(node._data));
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
					success(makeResource(resource._data));
				}
			});			

		}

	};
	
}
