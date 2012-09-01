exports.createService = function (graph) {
	
	function makeTopic(nodeData) {
		var url = nodeData.self;
		var topic = nodeData.data;
		topic.id = parseInt(url.split('/').pop(), 10);
		return topic;
	}

	return {
		get: function(id, success) {
			graph.getNodeById(id, function(err, result) {
				if (result === undefined || result._data === undefined) {
					success(null);
				} else {
					success(makeTopic(result._data));
				}
			});
		},

		create: function(topic, success, fail) {
				
			if (!topic.hasOwnProperty('name') || !topic.name) {
				fail('name is required');
				return;
			}
			
			var node = graph.createNode(topic);

			node.save(function(err, result) {
				if (err) {
					fail(err);
				} else {
					success(makeTopic(node._data));
				}
			});
		}
	};
};
