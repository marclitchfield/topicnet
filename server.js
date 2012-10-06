var express = require('express');
var neo4j = require('neo4j');
var config = require('./config.js');

var app = express.createServer(express.logger());
var neo4jUrl = process.env.NEO4J_URL || 'http://localhost:' + config.neo4j.port;
var graph = new neo4j.GraphDatabase(neo4jUrl);
var topicService = require('./lib/topic-service').createService(graph);
var resourceService = require('./lib/resource-service').createService(graph);

console.log(config);

app.use(express.bodyParser());
app.use(express.static('public'));

function successHandler(response) {
	return function(result) {
		if (result === undefined) {
			response.send(200);
		} else {
			response.json(result);
		}
	};
}

function errorHandler(response, next) {
	return function(err) {
		if (typeof err === 'object' && err.hasOwnProperty('name')) {
			var statusCodes = {
				'notfound': 404,
				'duplicate': 400,
			};

			if (!(err.name in statusCodes)) {
				next(err);
			} else if (err.hasOwnProperty('message')) {
				response.send(err.message, statusCodes[err.name]);
			} else {
				response.send(statusCodes[err.name]);
			}
		} else {
			next(new Error(err));
		}
	};
}

app.get('/topics', function(request, response, next) {
    if (request.query.q) {
        topicService.search(request.query.q,
            successHandler(response),
            errorHandler(response, next));
    } else {
        topicService.getRelated(0, 'root',
            successHandler(response),
            errorHandler(response, next));
    }
});

app.post('/topics', function(request, response, next) {
	topicService.create(request.body,
		successHandler(response),
		errorHandler(response, next));
});

app.put('/topics/:id', function(request, response, next) {
	topicService.update(request.params.id, request.body,
		successHandler(response),
		errorHandler(response, next));
});

app.get('/topics/:id', function(request, response, next) {
	topicService.get(request.params.id,
		successHandler(response),
		errorHandler(response, next));
});

app.get('/topics/:id/:rel', function(request, response, next) {
	topicService.getRelated(request.params.id, request.params.rel,
		successHandler(response),
		errorHandler(response, next));
});

app.post('/topics/:id/root', function(request, response, next) {
	topicService.createRelationship(0, request.params.id, 'root',
		successHandler(response),
		errorHandler(response, next));
});

app.post('/topics/:id/resources', function(request, response, next) {
	topicService.linkResource(request.params.id, request.body.resid,
		successHandler(response),
		errorHandler(response, next));
});

app.post('/topics/:id/:rel', function(request, response, next) {
	topicService.createRelationship(request.params.id, request.body.toid, request.params.rel,
		successHandler(response),
		errorHandler(response, next));
});

app.delete('/topics/:id/root', function(request, response, next) {
	topicService.deleteRelationship(0, request.params.id, 'root',
		successHandler(response),
		errorHandler(response, next));
});

app.delete('/topics/:id/:rel', function(request, response, next) {
	topicService.deleteRelationship(request.params.id, request.body.toid, request.params.rel,
		successHandler(response),
		errorHandler(response, next));
});

app.delete('/topics/:id', function(request, response, next) {
	topicService.deleteTopic(request.params.id,
		successHandler(response),
		errorHandler(response, next));
});

app.post('/resources', function(request, response, next) {
	resourceService.create(request.body,
		successHandler(response),
		errorHandler(response, next));
});

app.get('/resources/:id', function(request, response, next) {
	resourceService.get(request.params.id,
		successHandler(response),
		errorHandler(response, next));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
