var express = require('express');
var neo4j = require('neo4j');
var config = require('./config.js');

var app = express.createServer(express.logger());
console.log(config);
var neo4jUrl = process.env.NEO4J_URL || 'http://localhost:' + config.neo4j.port;
var graph = new neo4j.GraphDatabase(neo4jUrl);
var topicService = require('./lib/TopicService').createService(graph);

app.use(express.bodyParser());
app.use(express.static('public'));

app.get('/topics/:id', function(request, response) {
	topicService.get(request.params.id, function(topic) {
		if (topic === null) {
			response.send(404);
		} else {
			response.json(topic);
		}
	});
});

app.post('/topics', function(request, response, next) {
	var topic  = { 'name': request.body.name };
	topicService.create(topic,
		function(created) {
			response.json(created);
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
