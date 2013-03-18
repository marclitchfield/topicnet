var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph) {

	return {

		create: function(username, password) {
			var node = graph.createNode({ username: username, password: password });
			return graph.saveNode(node)
			.then(function() { 
				return Q.resolve();
			});
		},

		get: function(id) {
			return graph.getNodeById(id)
			.then(function(user) {
				return helper.makeNode(user._data);
			});
		}

	};

};
