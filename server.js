var express = require('express');
var neo4j = require('neo4j');
var config = require('./config.js');

var app = express.createServer(express.logger());
var neo4jUrl = process.env.NEO4J_URL || 'http://localhost:' + config.neo4j.port;
var graph = new neo4j.GraphDatabase(neo4jUrl);
var topicService = require('./lib/TopicService').createService(graph);

console.log(config);

app.use(express.bodyParser());
app.use(express.static('public'));

function successHandler(response) {
	return function(result) {
		if (result === null) {
			response.send(404);
		} else if (result === undefined) {
			response.send(200);
		} else {
			response.json(result);
		}
	};
}

function errorHandler(next) {
	return function(err) {
		next(new Error(err));
	};
}


app.get('/topics', function(request, response, next) {
	topicService.getRootTopics(
		successHandler(response),
		errorHandler(next));
});

app.post('/topics', function(request, response, next) {
	topicService.create(request.body,
		successHandler(response),
		errorHandler(next));
});

app.get('/topics/:id', function(request, response, next) {
	topicService.get(request.params.id,
		successHandler(response),
		errorHandler(next));
});

app.post('/topics/:id/root', function(request, response, next) {
	topicService.makeRoot(request.params.id,
		successHandler(response),
		errorHandler(next));
});

app.get('/topics/:id/:rel', function(request, response, next) {
	topicService.getRelated(request.params.id, request.params.rel,
		successHandler(response),
		errorHandler(next));
});

app.post('/topics/:id/:rel', function(request, response, next) {
	topicService.createRelationship(request.params.id, request.body.toid, request.params.rel,
		successHandler(response),
		errorHandler(next));
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
