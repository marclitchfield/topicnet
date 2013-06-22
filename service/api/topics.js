var	neo4jGraph = require('../lib/graph/neo4j-graph'),
	topicnetGraph = require('../lib/graph/topicnet-graph').create(neo4jGraph),
	topicService = require('../lib/topic-service').create(topicnetGraph),
	handler = require('../handler');

exports.root = function(request, response) {
	if (request.query.q) {
		handler.complete(response, topicService.search(request.query));
	} else {
		handler.complete(response, topicService.getLinkedTopics(0, 'root'));
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

exports.getLinkedTopics = function(request, response) {
	handler.complete(response, topicService.getLinkedTopics(request.params.id, request.params.rel));
};

exports.getLink = function(request, response) {
	handler.complete(response, topicService.getLink(request.params.id, request.params.toid, request.params.rel));
};

exports.linkRoot = function(request, response) {
	handler.complete(response, topicService.linkRoot(request.params.id));
};

exports.linkResource = function(request, response) {
	handler.complete(response, topicService.linkResource(request.params.id, request.body.resid));
};

exports.unlinkResource = function(request, response, next) {
	handler.complete(response, topicService.unlinkResource(request.params.id, request.params.resid));
};

exports.linkTopic = function(request, response) {
	handler.complete(response, topicService.linkTopic(request.params.id, request.body.toid, request.params.rel));
};

exports.unlinkRoot = function(request, response) {
	handler.complete(response, topicService.unlinkTopic(0, request.params.id, 'root'));
};

exports.unlinkRelated = function(request, response) {
	handler.complete(response, topicService.unlinkTopic(request.params.id, request.params.toid, request.params.rel));
};

exports['delete'] = function(request, response) {
	handler.complete(response, topicService.destroy(request.params.id));
};
