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
				'duplicate': 400
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

function promiseSuccessHandler(response, result) {
	if (result === undefined) {
		response.send(200);
	} else {
		response.json(result);
	}
}

function promiseErrorHandler(response, error) {
	var statusCodes = {
		'notfound': 404,
		'duplicate': 400
	};

	response.send(error.message || error, statusCodes[error.name] || 500);
}

function complete(response, promise) {
	promise.then(function(result) { promiseSuccessHandler(response, result); })
		.fail(function(error) { promiseErrorHandler(response, error); })
		.done();
}

app.get('/topics', function(request, response) {
	if (request.query.q) {
		complete(response, topicService.search(request.query));
	} else {
		complete(response, topicService.getRelated(0, 'root'));
	}
});

app.post('/topics', function(request, response) {
	complete(response, topicService.create(request.body));
});

app.put('/topics/:id', function(request, response) {
	complete(response, topicService.update(request.params.id, request.body));
});

app.get('/topics/:id', function(request, response) {
	complete(response, topicService.get(request.params.id));
});

app.get('/topics/:id/:rel', function(request, response) {
	complete(response, topicService.getRelated(request.params.id, request.params.rel));
});

app.post('/topics/:id/root', function(request, response) {
	complete(response, topicService.createRelationship(0, request.params.id, 'root'));
});

app.post('/topics/:id/resources', function(request, response) {
	complete(response, topicService.linkResource(request.params.id, request.body.resid));
});

app.delete('/topics/:id/resources/:resid', function(request, response, next) {
	complete(response, topicService.unlinkResource(request.params.id, request.params.resid));
});

app.post('/topics/:id/:rel', function(request, response) {
	complete(response, topicService.createRelationship(request.params.id, request.body.toid, request.params.rel));
});

app.delete('/topics/:id/root', function(request, response) {
	complete(response, topicService.deleteRelationship(0, request.params.id, 'root'));
});

app.delete('/topics/:id/:rel/:toid', function(request, response) {
	complete(response, topicService.deleteRelationship(request.params.id, request.params.toid, request.params.rel));
});

app.delete('/topics/:id', function(request, response) {
	complete(response, topicService.deleteTopic(request.params.id));
});

app.post('/resources', function(request, response) {
	complete(response, resourceService.create(request.body));
});

app.get('/resources/:id', function(request, response) {
	complete(response, resourceService.get(request.params.id));
});

app.get('/resources', function(request, response) {
	if (request.query.title) {
		complete(response, resourceService.searchByTitle(request.query.title));
	} else if(request.query.url) {
		complete(response, resourceService.searchByUrl(request.query.url));
	} else if(request.query.q) {
		complete(response, resourceService.search(request.query));
	} else {
		response.send(404);
	}
});

app.put('/resources/:id', function(request, response) {
	complete(response, resourceService.update(request.params.id, request.body));
});

app.delete('/resources/:id', function(request, response) {
	complete(response, resourceService.deleteResource(request.params.id));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
