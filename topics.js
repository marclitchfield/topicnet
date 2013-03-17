var	graph = new require('./lib/graph'),
	topicService = require('./lib/topic-service').createService(graph),
	voteService = require('./lib/vote-service').createService(graph),
	handler = require('./handler');

exports.root = function(request, response) {
	if (request.query.q) {
		handler.complete(response, topicService.search(request.query));
	} else {
		handler.complete(response, topicService.getRelated(0, 'root'));
	}
};

exports.create = function(request, response) {
	handler.complete(response, topicService.create(request.body));
};

exports.update = function(request, response) {
	handler.complete(response, topicService.update(request.params.id, request.body));
};

exports.get = function(request, response) {
	handler.complete(response, topicService.get(request.params.id));
};

exports.getRelated = function(request, response) {
	handler.complete(response, topicService.getRelated(request.params.id, request.params.rel));
};

exports.getRelatedById = function(request, response) {
	handler.complete(response, topicService.getRelationship(request.params.id, request.params.toid, request.params.rel));
};

exports.vote = function(request, response) {
	handler.complete(response, voteService.addVote(request.params.id, request.params.toid, request.params.rel, request.body));
};

exports.linkRoot = function(request, response) {
	handler.complete(response, topicService.createRelationship(0, request.params.id, 'root'));
};

exports.linkResource = function(request, response) {
	handler.complete(response, topicService.linkResource(request.params.id, request.body.resid));
};

exports.unlinkResource = function(request, response, next) {
	handler.complete(response, topicService.unlinkResource(request.params.id, request.params.resid));
};

exports.linkRelated = function(request, response) {
	handler.complete(response, topicService.createRelationship(request.params.id, request.body.toid, request.params.rel));
};

exports.unlinkRoot = function(request, response) {
	handler.complete(response, topicService.deleteRelationship(0, request.params.id, 'root'));
};

exports.unlinkRelated = function(request, response) {
	handler.complete(response, topicService.deleteRelationship(request.params.id, request.params.toid, request.params.rel));
};

exports['delete'] = function(request, response) {
	handler.complete(response, topicService.deleteTopic(request.params.id));
};
