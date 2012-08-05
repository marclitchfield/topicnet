var express = require('express');
var neo4j = require('neo4j');

var app = express.createServer(express.logger());
var graph = new neo4j.GraphDatabase('http://localhost:7474');

app.use(express.bodyParser());

app.use(express.static('public'));

app.post('/node/', function(request, response) {
	response.json({ "nodes": 1 });
});

app.get('/topic/:id/links', function(request, response) {
});

app.post('/topic', function(request, response) {
	var data  = { 'name': request.body.name };
	var node = graph.createNode(data);

	node.save(function() {
		console.log('Saved node: ' + data.name);
		response.json(data);
	}, function(err) {
		console.log('Error saving node: ' + data.name + ', ' + err);
	})
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
