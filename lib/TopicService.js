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
					success(topic);
				}
			});
		} 	
	};	
};

