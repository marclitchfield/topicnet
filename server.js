var express = require('express');
var neo4j = require('neo4j');

var app = express.createServer(express.logger());
var neo4jUrl = process.env.NEO4J_URL || 'http://localhost:7474'; 
var graph = new neo4j.GraphDatabase(neo4jUrl);
var topicService = require('./lib/TopicService').createService(graph);

app.use(express.bodyParser());
app.use(express.static('public'));

app.post('/topic', function(request, response) {
	var topic  = { 'name': request.body.name };
	topicService.create(topic, 
		function(created) {
			response.json(created);
		},
		function(error) {
			response.send(500, error); 
		}
	); 
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
