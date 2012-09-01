var _ = require('underscore');

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
		},

		getRootTopics: function(success, fail) {
			var cypherQuery = 'START origin=node(0) MATCH origin-[:root]->root RETURN root';
			graph.query(cypherQuery, function(err, rootNodes) {
				if (err) {
					fail(err);
				} else {
					var topics = _.map(rootNodes, function(node) {
						return makeTopic(node.root._data);
					});
					success(topics);
				}
			});
		},

		makeRoot: function(id, success, fail) {
			graph.getNodeById(0, function(err, rootNode) {
				graph.getNodeById(id, function(err, targetNode) {
					rootNode.createRelationshipTo(targetNode, 'root', {}, function(err, result) {
						if (err) {
							fail(err);
						} else {
							success();
						}
					});
				});
			});

			success();
		}
	};
};
