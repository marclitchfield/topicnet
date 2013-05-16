var	neo4jGraph = require('../lib/graph/neo4j-graph'),
	topicnetGraph = require('../lib/graph/topicnet-graph').create(neo4jGraph),
	resourceService = require('../lib/resource-service').create(topicnetGraph),
	handler = require('../handler');

exports.create = function(request, response) {
	handler.complete(response, resourceService.create(request.body));
};

exports.get = function(request, response) {
	handler.complete(response, resourceService.get(request.params.id));
};

exports.search = function(request, response) {
	if (request.query.title) {
		handler.complete(response, resourceService.searchByTitle(request.query.title));
	} else if(request.query.url) {
		handler.complete(response, resourceService.searchByUrl(request.query.url));
	} else if(request.query.q) {
		handler.complete(response, resourceService.search(request.query));
	} else {
		response.send(404);
	}
};

exports.update = function(request, response) {
	handler.complete(response, resourceService.update(request.params.id, request.body));
};

exports['delete'] = function(request, response) {
	handler.complete(response, resourceService.deleteResource(request.params.id));
};

