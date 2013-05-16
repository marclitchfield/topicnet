var _ = require('underscore');
var Q = require('q');

exports.create = function(graph) {

	var validRelationships = ['sub', 'next', 'resources'];
	var voteDirections = ['up', 'down'];

	function queryRelationship(fromId, toId, relationshipType) {
		var cypherQuery = 'START from=node(' + fromId +	'), to=node(' + toId + ') ' +
			'MATCH from-[r:' + relationshipType + ']->to RETURN r';

		return graph.queryGraph(cypherQuery);
	}

	function voteUp(relData) {
		relData.upVotes = (relData.upVotes || 0) + 1;
		relData.score = calculateScore({ upVotes: relData.upVotes, downVotes: relData.downVotes});
		return graph.updateRelationship(relData.id, relData)
		.then(function() {
			return { score: relData.score };
		});
	}

	function voteDown(relData) {
		relData.downVotes = (relData.downVotes || 0) + 1;
		relData.score = calculateScore({ upVotes: relData.upVotes, downVotes: relData.downVotes});
		return graph.updateRelationship(relData.id, relData)
		.then(function() {
			return { score: relData.score };
		});
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
				if(results.length < 1) {
					return Q.reject({name: 'notfound', message: 'A ' + relationshipType + ' relationship was not found between ' + fromId + ' and ' + toId});
				} else {
					var relationshipData = results[0].r;
					if(voteDirection === 'down') {
						return voteDown(relationshipData);
					} else {
						return voteUp(relationshipData);
					}
				}
			});
		}
		
	};

};

