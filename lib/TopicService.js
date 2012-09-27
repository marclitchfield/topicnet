var _ = require('underscore');

exports.createService = function (graph) {
	
	function makeTopic(nodeData) {
		var topic = nodeData.data;
		topic.id = parseNodeId(nodeData);
		return topic;
	}

	function parseNodeId(nodeData) {
		var url = nodeData.self;
		return parseInt(url.split('/').pop(), 10);
	}

	function makeTopics(queryResult) {
		var topics = {};

		_.each(queryResult, function(result) {
			var id = parseNodeId(result.n._data);
			if (!topics.hasOwnProperty(id)) {
				topics[id] = makeTopic(result.n._data);
			}

			if (result.r && result.c) {
				var rel = result.r._data.type;
				if (!topics[id].hasOwnProperty(rel)) {
					topics[id][rel] = [];
				}

				topics[id][rel].push(makeTopic(result.c._data));
			}
		});

		return _.values(topics);
	}

	var validRelationships = ['sub', 'super', 'next', 'prev', 'prereq'];

	return {
		get: function(id, success, fail) {
			var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') MATCH n-[r?]->c RETURN n,r,c';
			graph.query(cypherQuery, function(err, results) {
				if (results === undefined) {
					success(null);
				} else if (err) {
					fail(err);
				} else {
					success(makeTopics(results)[0]);
				}
			});
		},

        search: function(query, success, fail) {
            console.log('Searching with ' + query);
            graph.queryNodeIndex('topics_name', 'name:*' + query + '*', function(err, results) {
                if (err) {
                    fail(err);
                } else if (results === undefined) {
                    success(null);
                } else {
                    var topics = _.map(results, function(r) {
                        return makeTopic(r);
                    });
                    success(topics);
                }
            });
        },

		getRootTopics: function(success, fail) {
			var cypherQuery = 'START origin=node(0) MATCH origin-[:root]->n RETURN n';
			graph.query(cypherQuery, function(err, results) {
				if (results === undefined) {
					success(null);
				} else if (err) {
					fail(err);
				} else {
					success(makeTopics(results));
				}
			});
		},

		getRelated: function(fromid, relationship, success, fail) {
			if (!_.include(validRelationships, relationship)) {
				fail('invalid relationship. must be one of: ' + validRelationships.join(', '));
				return;
			}

			var cypherQuery = 'START origin=node(' + parseInt(fromid, 10) + ') ' +
				'MATCH origin-[:' + relationship + ']->n RETURN n';

			graph.query(cypherQuery, function(err, results) {
				if (results === undefined) {
					success(null);
				} else if (err) {
					fail(err);
				} else {
					success(makeTopics(results));
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
                    node.index('topics_name', 'name', topic.name.toLowerCase(), function(err, result) {
                        if (err) {
                            fail(err);
                        } else {
                            success(makeTopic(node._data));
                        }
                    });
				}
			});
		},

		createRelationship: function(fromid, toid, relationship, success, fail) {
			if (!_.include(validRelationships, relationship)) {
				fail('invalid relationship. must be one of: ' + validRelationships.join(', '));
				return;
			}

			graph.getNodeById(fromid, function(err, fromNode) {
				graph.getNodeById(toid, function(err, toNode) {
					fromNode.createRelationshipTo(toNode, relationship, {}, function(err, result) {
						if (err) {
							fail(err);
						} else {
							success();
						}
					});
				});
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
		}
	};
};
