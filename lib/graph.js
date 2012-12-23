var Q = require('q');
var helper = require('./service-helper');

exports.create = function(graphDatabase) {

	return {

		createNode: function(data) {
			return graphDatabase.createNode(data);
		},

		updateIndex: function(node, index, field, value) {
			var deferred = Q.defer();
			node.index(index, field, value.toLowerCase(), deferred.makeNodeResolver());
			return deferred.promise;
		},

		saveNode: function(node) {
			var deferred = Q.defer();
			node.save(deferred.makeNodeResolver());
			return deferred.promise;
		},

		queryNodeIndex: function(indexName, indexQuery) {
			var deferred = Q.defer();
			graph.queryNodeIndex(indexName, indexQuery, function(err, results) {
				if(err || results === undefined) {
					deferred.resolve([]);
				} else {
					deferred.resolve(_.map(results, function(r) {
						return helper.makeNode(r);
					}));
				}
			});
			return deferred.promise;
		},

		queryGraph: function(cypherQuery, params) {
			var deferred = Q.defer();
			graph.query(cypherQuery, params, function(err, results) {
				if (err && results !== undefined) {
					return deferred.reject(err);
				} else {
					return deferred.resolve(results);
				}
			});
			return deferred.promise;
		},

		getNodeById: function(id) {
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
		},

		deleteNode: function(node) {
			var deferred = Q.defer();
			node.del(deferred.makeNodeResolver());
			return deferred.promise;
		},

		createRelationshipBetween: function(fromNode, toNode, relationship, params) {
			var deferred = Q.defer();
			fromNode.createRelationshipTo(toNode, relationship, params || {}, deferred.makeNodeResolver());
			return deferred.promise;
		},

		deleteRelationship: function(rel) {
			var deferred = Q.defer();
			rel.del(deferred.makeNodeResolver());
			return deferred.promise;
		}
	};
};
