var neo4j = require('neo4j');
var config = require('../config.js');
console.log(config);

var neo4jUrl = process.env.NEO4J_URL || 'http://localhost:' + config.neo4j.port;
var graphDatabase = new neo4j.GraphDatabase(neo4jUrl);

var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');


exports.createNode = function(data) {
	return graphDatabase.createNode(data);
};

exports.updateIndex = function(node, index, field, value) {
	var deferred = Q.defer();
	node.index(index, field, value.toLowerCase(), deferred.makeNodeResolver());
	return deferred.promise;
};

exports.saveNode = function(node) {
	var deferred = Q.defer();
	node.save(deferred.makeNodeResolver());
	return deferred.promise;
};

exports.queryNodeIndex = function(indexName, indexQuery) {
	var deferred = Q.defer();
	
	graphDatabase.queryNodeIndex(indexName, indexQuery, function(err, results) {
		if(err || results === undefined) {
			deferred.resolve([]);
		} else {
			deferred.resolve(_.map(results, function(r) {
				return helper.makeNode(r);
			}));
		}
	});
	return deferred.promise;
};

exports.queryGraph = function(cypherQuery, params) {
	var deferred = Q.defer();
	graphDatabase.query(cypherQuery, params, function(err, results) {
		if (err && results !== undefined) {
			return deferred.reject(err);
		} else {
			return deferred.resolve(results);
		}
	});
	return deferred.promise;
};

exports.getNodeById = function(id) {
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
};

exports.deleteNode = function(node) {
	var deferred = Q.defer();
	node.del(deferred.makeNodeResolver());
	return deferred.promise;
};

exports.createRelationshipBetween = function(fromNode, toNode, relationship, params) {
	var deferred = Q.defer();
	fromNode.createRelationshipTo(toNode, relationship, params || {}, deferred.makeNodeResolver());
	return deferred.promise;
};

exports.deleteRelationship = function(rel) {
	var deferred = Q.defer();
	rel.del(deferred.makeNodeResolver());
	return deferred.promise;
};


