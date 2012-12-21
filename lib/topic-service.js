var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function (graph) {

	var validRelationships = ['sub', 'next', 'root'];
	var DEFAULT_RESULTS_PER_PAGE = 10;

	function getRelationship(fromId, toId, relationship, callback) {
		var cypherQuery = 'START from=node(' + fromId +	'), to=node(' + toId + ') ' +
			'MATCH from-[r:' + relationship + ']->to RETURN r';

		graph.query(cypherQuery, callback);
	}

	function updateTopicIndex(node, topic) {
		var deferred = Q.defer();
		node.index('topics_name', 'name', topic.name.toLowerCase(), deferred.makeNodeResolver());
		return deferred.promise;
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

	function checkForDuplicateNew(updatedValues) {
		var deferred = Q.defer();

		findTopicByName(updatedValues.name, function(results) {
			if(results.length > 0)
				deferred.reject({ name: 'duplicate', message: 'A topic with the specified name already exists' });
			else
				deferred.resolve();
		});

		return deferred.promise;
	}

	function checkForDuplicateUpdate(updatedValues, topicId) {
		var deferred = Q.defer();
		
		findTopicByName(updatedValues.name, function(results) {
			var resultsOtherThanThis = _.reject(results, function(t) {
				return t.id === topicId;
			});

			if(resultsOtherThanThis.length > 0)
				deferred.reject({ name: 'duplicate', message: 'Another topic exists with the specified name' });
			else
				deferred.resolve();
		});

		return deferred.promise;
	}

	function getNodeById(id) {
		var deferred = Q.defer();
		graph.getNodeById(id, deferred.makeNodeResolver());
		return deferred.promise.then(function(node) {
			if (node === undefined) {
				return Q.reject({name: 'notfound'});
			} else {
				return node;
			}
		})
		.fail(function(error) {
			error.name = 'notfound';
			throw error;
		});
	}

	function saveNode(node) {
		var deferred = Q.defer();
		node.save(deferred.makeNodeResolver());
		return deferred.promise;
	}

	function queryGraph(cypherQuery, params) {
		var deferred = Q.defer();
		graph.query(cypherQuery, params, function(err, results) {
			if (err && results !== undefined) {
				return deferred.reject(err);
			} else {
				return deferred.resolve(results);
			}
		});
		return deferred.promise;
	}

	function getRelationshipPromise(fromId, toId, relationship) {
		var cypherQuery = 'START from=node(' + fromId +	'), to=node(' + toId + ') ' +
			'MATCH from-[r:' + relationship + ']->to RETURN r';

		return queryGraph(cypherQuery);
	}

	function createRelationshipBetween(fromNode, toNode, relationship, params) {
		var deferred = Q.defer();
		fromNode.createRelationshipTo(toNode, relationship, params || {}, deferred.makeNodeResolver());
		return deferred.promise;
	}

	return {

		get: function(id, success, fail) {
			var cypherQuery = 'START n=node(' + parseInt(id, 10) + ') MATCH n-[r?]->c RETURN n,r,c';

			return queryGraph(cypherQuery)
			.then(function(results) {
				if (results === undefined) {
					return Q.reject({name: 'notfound', message: 'topic with id ' + id + ' not found'});
				} else {
					return helper.makeTopics(results)[0];
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
				query: 'name:*' + search_string.toLowerCase() + '*',
				s: (page - 1) * per_page,
				l: per_page
			};

			return queryGraph(cypherQuery, params)
			.then(function(results) {
				return helper.makeTopics(results);
			})
			.fail(function(error) {
				if (helper.isMissingIndexError(error)) {
					return [];
				}
				throw error;
			});
		},

		getRelated: function(fromid, relationship, success, fail) {
			if (!_.include(validRelationships, relationship)) {
				fail('invalid relationship. must be one of: ' + validRelationships.join(', '));
				return;
			}

			var cypherQuery = 'START origin=node(' + parseInt(fromid, 10) + ') ' +
				'MATCH origin-[:' + relationship + ']->n RETURN n';

			var deferred = Q.defer();
			graph.query(cypherQuery, deferred.makeNodeResolver());

			return deferred.promise.then(function(results) {
				return helper.makeTopics(results);
			})
		},

		create: function(topic, success, fail) {

			if (!topic.hasOwnProperty('name') || !topic.name) {
				return Q.reject('name is required');
			}
	
			return checkForDuplicateNew(topic)
			.then(function() {
				var node = graph.createNode(topic);
				
				return saveNode(node)
				.then(function() {
					return updateTopicIndex(node, topic);
				})
				.then(function() {
					return helper.makeNode(node._data);
				});
			});
		},

		update: function(id, topic) {

			if (!topic.hasOwnProperty('name') || !topic.name) {
				return Q.reject('name is required');
			}

			return checkForDuplicateUpdate(topic, id)
			.then(function() {
				return getNodeById(id);
			})
			.then(function(node) {
				node.data.name = topic.name;
				
				return saveNode(node)
				.then(function() {
					return updateTopicIndex(node, topic);
				})
				.then(function() {
					return helper.makeNode(node._data);
				});
			})

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

		createRelationshipPromise: function(fromid, toid, relationship, success, fail) {
			if (!_.include(validRelationships, relationship)) {
				return Q.reject('invalid relationship. must be one of: ' + validRelationships.join(', '));
			}

			return getNodeById(fromid)
			.then(function(fromNode) {
				
				return getNodeById(toid)
				.then(function(toNode) {

					return getRelationshipPromise(fromid, toid, relationship)
					.then(function(results) {
						if(results && results.length > 0) {
							return Q.reject({name: 'duplicate', message: 'Relationship \'' + relationship + '\' already exists between ' + fromid + ' and ' + toid});
						}
					})
					.then(function() {
						return createRelationshipBetween(fromNode, toNode, relationship, {});
					});
				});
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
