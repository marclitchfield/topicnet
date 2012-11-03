var _ = require('underscore');
var helper = require('./service-helper');

exports.createService = function (graph) {

	var validRelationships = ['sub', 'next', 'root'];
	var DEFAULT_RESULTS_PER_PAGE = 10;
	
	function makeTopics(queryResult) {
		var topics = {};

		_.each(queryResult, function(result) {
			var id = helper.parseNodeId(result.n._data);
			if (!topics.hasOwnProperty(id)) {
				topics[id] = helper.makeNode(result.n._data);
			}

			if (result.r && result.c) {
				var rel = result.r._data.type;
				if (!topics[id].hasOwnProperty(rel)) {
					topics[id][rel] = [];
				}

				topics[id][rel].push(helper.makeNode(result.c._data));
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

	function findTopicByName(name, callback) {
		query = helper.escapeLuceneSpecialChars(name.toLowerCase());
		graph.queryNodeIndex('topics_name', 'name:' + query, function(err, results) {
			if(err || results === undefined) results = [];
			var topics = _.map(results, function(r) {
				return helper.makeNode(r);
			});
			callback(topics);
		});
	}

	function checkForDuplicateNew(updatedValues, yes, no) {
		findTopicByName(updatedValues.name, function(results) {
			if(results.length > 0)
				yes();
			else
				no();
		});
	}

	function checkForDuplicateUpdate(updatedValues, topicId, yes, no) {
		findTopicByName(updatedValues.name, function(results) {
			var resultsOtherThanThis = _.reject(results, function(t) {
				return t.id === topicId;
			});
			if(resultsOtherThanThis.length > 0)
				yes();
			else
				no();
		});
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

		/*
		* query is an object like { q: 'search string', p: '1', pp: '5' }
		*   q: the search string
		*   p: page number (defaults to 1)
		*   pp: results per page (defaults to DEFAULT_RESULTS_PER_PAGE)
		*/
		search: function(query, success, fail) {

			var page = 1;
			var per_page = DEFAULT_RESULTS_PER_PAGE;

			var search_string = query.q || '';
			if(query.p !== undefined) {
				page = parseInt(query.p, 10);
				if(page < 1)
					page = 1;
			}
			if(query.pp !== undefined) {
				per_page = parseInt(query.pp, 10);
				if(per_page < 1)
					per_page = DEFAULT_RESULTS_PER_PAGE;
			}

			search_string = helper.escapeLuceneSpecialChars(search_string);
			var cypherQuery = 'START n=node:topics_name({query}) RETURN n ' +
				'SKIP {s} LIMIT {l}';

			var params = {
				query: 'name:*' + search_string + '*',
				s: (page - 1) * per_page,
				l: per_page
			};

			graph.query(cypherQuery, params, function(err, results) {
				if (err) {
					fail(err);
				} else if (results === undefined) {
					fail({name: 'notfound'});
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

			function failDuplicate() {
				fail( { name: 'duplicate', message: 'A topic with the specified name already exists' } );
			}
	
			checkForDuplicateNew(topic, failDuplicate,
				function() {
					var node = graph.createNode(topic);
					node.save(function(err, result) {
						if (err) {
							fail(err);
						} else {
							updateTopicIndex(node, topic, function(err, result) {
								if (err) {
									fail(err);
								} else {
									success(helper.makeNode(node._data));
								}
							});
						}
					});
				}
			);

		},

		update: function(id, topic, success, fail) {

			if (!topic.hasOwnProperty('name') || !topic.name) {
				fail('name is required');
				return;
			}

			function failDuplicate() {
				fail( { name: 'duplicate', message: 'Another topic exists with the specified name' } );
			}

			checkForDuplicateUpdate(topic, id, failDuplicate,
				function() {
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
										success(helper.makeNode(node._data));
									}
								});
							}
						});
					});
				}
			);

		},

		createRelationship: function(fromid, toid, relationship, success, fail) {
			if (!_.include(validRelationships, relationship)) {
				fail('invalid relationship. must be one of: ' + validRelationships.join(', '));
				return;
			}

			graph.getNodeById(fromid, function(err, fromNode) {
				// note: the thingdom neo4j nodejs library throws an error if the node is not found
				// rather than returning undefined as in other places. a todo indicates this may change
				if (err || fromNode === undefined) {
					fail({name: 'notfound'});
				} else {
					graph.getNodeById(toid, function(err, toNode) {
						if(err || toNode === undefined) {
							fail({name: 'notfound'});
						} else {
							getRelationship(fromid, toid, relationship, function(err, results) {
								if(results && results.length > 0) {
									fail({name: 'duplicate', message: 'Relationship \'' + relationship + '\' already exists between ' + fromid + ' and ' + toid});
								} else {
									fromNode.createRelationshipTo(toNode, relationship, {}, function(err, result) {
										if (err) {
											fail(err);
										} else {
											success();
										}
									});
								}
							});
						}
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

		linkResource: function(id, resid, success, fail) {

			graph.getNodeById(id, function(err, fromNode) {
				// note: the thingdom neo4j nodejs library throws an error if the node is not found
				// rather than returning undefined as in other places. a todo indicates this may change
				if (err || fromNode === undefined) {
					fail({name: 'notfound'});
				} else {
					graph.getNodeById(resid, function(err, toNode) {
						if(err || toNode === undefined) {
							fail({name: 'notfound'});
						} else {
							getRelationship(id, resid, 'resources', function(err, results) {
								if(results && results.length > 0) {
									fail({name: 'duplicate', message: 'The resource with id ' + resid + ' is already linked to the topic with id ' + id});
								} else {
									fromNode.createRelationshipTo(toNode, 'resources', {}, function(err, result) {
										if (err) {
											fail(err);
										} else {
											success();
										}
									});
								}
							});
						}
					});
				}

			});

		},

		unlinkResource: function(id, resid, success, fail) {

			getRelationship(id, resid, 'resources', function(err, results) {
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
