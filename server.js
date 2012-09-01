var express = require('express');
var neo4j = require('neo4j');

var app = express.createServer(express.logger());
var neo4jUrl = process.env.NEO4J_URL || 'http://localhost:7474';
var graph = new neo4j.GraphDatabase(neo4jUrl);
var topicService = require('./lib/TopicService').createService(graph);

app.use(express.bodyParser());
app.use(express.static('public'));

app.get('/topics', function(request, response) {
	topicService.getRootTopics(function(topics) {
		response.json(topics);
	});
});

app.post('/topics', function(request, response, next) {
	topicService.create(request.body,
		function(created) {
			response.json(created);
		},
		function(err) {
			next(new Error(err));
		}
	);
});

app.get('/topics/:id', function(request, response) {
	topicService.get(request.params.id, function(topic) {
		if (topic === null) {
			response.send(404);
		} else {
			response.json(topic);
		}
	});
});

app.post('/topics/:id/root', function(request, response, next) {
	topicService.makeRoot(request.params.id,
		function(created) {
			response.send(200);
		},
		function(err) {
			next(new Error(err));
		}
	);
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
