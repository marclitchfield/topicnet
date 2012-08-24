exports.createService = function (graph) {
	return {
		create: function(topic, success, fail) {
				
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

