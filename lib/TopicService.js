exports.createService = function (graph) {
	return {
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
					topic.id = parseInt(url.split('/').pop());
					success(topic);
				}
			});
		} 	
	};	
};

