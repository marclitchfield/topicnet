exports.createService = function (graph) {
	return {
		get: function(id, success) {
			graph.getNodeById(id, function(err, result) {
				if (result === undefined || result._data === undefined) {
					success(null);
				} else {
					success(result._data.data);
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
					var created = node;
					var url = created._data.self;
					topic.id = parseInt(url.split('/').pop(), 10);
					success(topic);
				}
			});
		}
	};
};
