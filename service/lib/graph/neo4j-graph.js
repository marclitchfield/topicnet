var neo4j = require('neo4j');
var config = require('../../config.js');
console.log(config);

var neo4jUrl = process.env.NEO4J_URL || 'http://localhost:' + config.neo4j.port;
var graphDatabase = new neo4j.GraphDatabase(neo4jUrl);

var _ = require('underscore');
var Q = require('q');

function parseNodeId(node) {
	var url = node._data.self;
	return parseInt(url.split('/').pop(), 10);
}

function makeNodeData(node) {
	var nodeData = node.data;
	nodeData.id = parseNodeId(node);
	if(node.type) {
		nodeData.type = node.type;
	}
	return nodeData;
}

function processQueryResults(results) {
	var cleanResults = [];
	_.each(results, function(result) {
		var cleanResult = {};
		for(var attr in result) {
			if(result[attr]) {
				cleanResult[attr] = makeNodeData(result[attr]);
			} else {
				cleanResult[attr] = null;
			}
		}
		cleanResults.push(cleanResult);
	});
	return cleanResults;
}

function getNodeById(id) {
	var deferred = Q.defer();
	graphDatabase.getNodeById(id, deferred.makeNodeResolver());
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

function getRelationshipById(id) {
	var deferred = Q.defer();
	graphDatabase.getRelationshipById(id, deferred.makeNodeResolver());
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

function isMissingIndexError(err) {
	return (err.message.exception === 'org.neo4j.graphdb.NotFoundException' ||
		err.message.match(/^Index.*does not exist$/) !== null);
}

exports.createNode = function(nodeData) {
	var deferred = Q.defer();
	var node = graphDatabase.createNode(nodeData);
	node.save(deferred.makeNodeResolver());
	return deferred.promise.then(function(node) {
		return makeNodeData(node);
	});
};

exports.readNode = function(id) {
	return getNodeById(id)
	.then(function(node) {
		return makeNodeData(node);
	});
};

exports.updateNode = function(id, nodeData) {
	var deferred = Q.defer();
	return getNodeById(id)
	.then(function(node) {
		node.data = _.omit(nodeData, 'id');
		node.save(deferred.makeNodeResolver());
		return deferred.promise;
	})
	.then(function(node) {
		return makeNodeData(node);
	});
};

exports.deleteNode = function(nodeId) {
	var deferred = Q.defer();
	return getNodeById(nodeId)
	.then(function(node) {
		node.del(deferred.makeNodeResolver());
		return deferred.promise;
	});
};

exports.updateIndex = function(nodeId, index, field, value) {
	var deferred = Q.defer();
	return getNodeById(nodeId)
	.then(function(node) {
		node.index(index, field, value.toLowerCase(), deferred.makeNodeResolver());
		return deferred.promise;
	});
};

exports.queryNodeIndex = function(indexName, indexQuery) {
	var deferred = Q.defer();

	graphDatabase.queryNodeIndex(indexName, indexQuery, function(err, results) {
		if(err || results === undefined) {
			deferred.resolve([]);
		} else {
			deferred.resolve(_.map(results, function(r) {
				return makeNodeData(r);
			}));
		}
	});
	return deferred.promise;
};

exports.queryGraph = function(cypherQuery, params) {
	var deferred = Q.defer();
	graphDatabase.query(cypherQuery, params, function(err, results) {
		if (err && isMissingIndexError(err)) {
			return deferred.resolve([]);
		} else if (err && results !== undefined) {
			return deferred.reject(err);
		} else {
			return deferred.resolve(processQueryResults(results));
		}
	});
	return deferred.promise;
};

exports.hasRelationships = function(nodeId, relationshipTypes) {
	relationshipTypes = relationshipTypes || [];
	var deferred = Q.defer();
	return getNodeById(nodeId)
	.then(function(node) {
		node.getRelationships(relationshipTypes, deferred.makeNodeResolver());
		return deferred.promise;
	})
	.then(function(relationships) {
		return (relationships.length > 0);
	});
};

exports.createRelationshipBetween = function(fromNodeId, toNodeId, relationshipType, data) {
	var deferred = Q.defer();
	var fromNode, toNode;
	return getNodeById(fromNodeId)
	.then(function(node) {
		fromNode = node;
		return getNodeById(toNodeId);
	})
	.then(function(node) {
		toNode = node;
		fromNode.createRelationshipTo(toNode, relationshipType, data || {}, deferred.makeNodeResolver());
		return deferred.promise;
	});
};

exports.updateRelationship = function(relationshipId, relationshipData) {
	var deferred = Q.defer();
	return getRelationshipById(relationshipId)
	.then(function(rel) {
		rel.data = _.omit(relationshipData, 'id', 'type');
		rel.save(deferred.makeNodeResolver());
		return deferred.promise;
	})
	.then(function(rel) {
		return makeNodeData(rel);
	});
};

exports.deleteRelationship = function(relationshipId) {
	var deferred = Q.defer();
	return getRelationshipById(relationshipId)
	.then(function(relationship) {
		relationship.del(deferred.makeNodeResolver());
		return deferred.promise;
	});
};
