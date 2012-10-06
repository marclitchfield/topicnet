var _ = require('underscore');

exports.createService = function (graph) {

	var validRelationships = ['sub', 'next', 'root'];
	
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

	function getRelationship(fromId, toId, relationship, callback) {
		var cypherQuery = 'START from=node(' + fromId +	'), to=node(' + toId + ') ' +
			'MATCH from-[r:' + relationship + ']->to RETURN r';

		graph.query(cypherQuery, callback);
	}

	function updateTopicIndex(node, topic, callback) {
		node.index('topics_name', 'name', topic.name.toLowerCase(), callback);
	}

	return {

		get: function(id, success, fail) {
			var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') MATCH n-[r?]->c RETURN n,r,c';
			graph.query(cypherQuery, function(err, results) {
				if (results === undefined) {
					fail({name: 'notfound'});
				} else if (err) {
					fail(err);
				} else {
					success(makeTopics(results)[0]);
				}
			});
		},

		search: function(query, success, fail) {
			query = query.replace(/([ *])/g, '\\$1');
			graph.queryNodeIndex('topics_name', 'name:*' + query + '*', function(err, results) {
					if (err) {
							fail(err);
					} else if (results === undefined) {
							fail({name: 'notfound'});
					} else {
							var topics = _.map(results, function(r) {
									return makeTopic(r);
							});
							success(topics);
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
					fail({name: 'notfound'});
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
					updateTopicIndex(node, topic, function(err, result) {
                        if (err) {
                            fail(err);
                        } else {
                            success(makeTopic(node._data));
                        }
					});
				}
			});
		},

		update: function(id, topic, success, fail) {
			if (!topic.hasOwnProperty('name') || !topic.name) {
				fail('name is required');
				return;
			}

			graph.getNodeById(id, function(err, node) {
				node.data.name = topic.name;
				node.save(function(err, result) {
					if (err) {
						fail(err);
					} else {
						updateTopicIndex(node, topic, function(err, result) {
							if (err) {
								fail(err);
							} else {
								success(makeTopic(node._data));
							}
						});
					}
				});
			});
		},

		createRelationship: function(fromid, toid, relationship, success, fail) {
			if (!_.include(validRelationships, relationship)) {
				fail('invalid relationship. must be one of: ' + validRelationships.join(', '));
				return;
			}

			getRelationship(fromid, toid, relationship, function(err, results) {
				if (results.length > 0) {
					fail({name: 'duplicate', message: 'Relationship \'' + relationship + '\' already exists between ' + fromid + ' and ' + toid});
				} else {
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
				}
			});

		},

		deleteRelationship: function(fromid, toid, relationship, success, fail) {
			if(!_.include(validRelationships, relationship)) {
				fail('invalid relationship. must be one of: ' + validRelationships.join(', '));
				return;
			}

			getRelationship(fromid, toid, relationship, function(err, results) {
				if (results === undefined) {
					fail({name: 'notfound'});
				} else if (err) {
					fail(err);
				} else {
					rel = results[0].r;
					rel.del(function(err, res) {
						if(err) {
							fail(err);
						} else {
							success();
						}
					});
				}
			});
		},

		deleteTopic: function(id, success, fail) {
			var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') return n';
			graph.query(cypherQuery, function(err, results) {
				if(results === undefined) {
					fail({name: 'notfound'});
				} else if(err) {
					fail(err);
				} else {
					var topic = results[0].n;
					topic.del(function(err, res) {
						if(err) {
							fail(err);
						} else {
							success();
						}
					});
				}
			});
		}

	};
};
