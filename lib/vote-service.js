var _ = require('underscore');
var Q = require('q');
var helper = require('./service-helper');

exports.createService = function(graph) {

	var validRelationships = ['sub', 'next', 'resources'];
	var voteDirections = ['up', 'down'];

	function queryRelationship(fromId, toId, relationship) {
		var cypherQuery = 'START from=node(' + fromId +	'), to=node(' + toId + ') ' +
			'MATCH from-[r:' + relationship + ']->to RETURN r';

		return graph.queryGraph(cypherQuery);
	}

	function voteUp(relationshipObject) {
		var data = relationshipObject._data.data;
		data.upVotes = (data.upVotes || 0) + 1;
		data.score = calculateScore({ upVotes: data.upVotes, downVotes: data.downVotes});
		return graph.saveNode(relationshipObject);
	}

	function voteDown(relationshipObject) {
		var data = relationshipObject._data.data;
		data.downVotes = (data.downVotes || 0) + 1;
		data.score = calculateScore({ upVotes: data.upVotes, downVotes: data.downVotes});
		return graph.saveNode(relationshipObject);
	}

	function calculateScore(factors) {
		var upVotes = factors.upVotes || 0;
		var downVotes = factors.downVotes || 0;
		return upVotes - downVotes;
	}

	return {

		addVote: function(fromId, toId, relationshipType, params) {
			var voteDirection = params.dir || 'up';

			return queryRelationship(fromId, toId, relationshipType)
			.then(function(results) {
				if(results === undefined) {
					return Q.reject({name: 'notfound', message: 'A ' + relationshipType + ' relationship was not found between ' + fromId + ' and ' + toId});
				} else {
					var rel = results[0].r;
					if(voteDirection === 'down') {
						return voteDown(rel);
					} else {
						return voteUp(rel);
					}
				}
			});
		}
		
	};

};

