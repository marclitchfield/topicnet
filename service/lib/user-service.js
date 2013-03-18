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
			console.log('get', id)
			return graph.getNodeById(id)
			.then(function(user) {
				console.log('got', user)
				return helper.makeNode(user._data);
			});
		}

	}

};
