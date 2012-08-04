var express = require('express');
var neo4js = require('neo4js');

var app = express.createServer(express.logger());
var graph = new neo4js.GraphDatabase('http://localhost:7474');

app.use(express.bodyParser());

app.use(express.static('public'));

app.post('/node/', function(request, response) {
	response.json({ "nodes": 1 });
});

app.get('/topic/:id/links', function(request, response) {
});

app.post('/topic', function(request, response) {
	var node = { 'name': request.body.name };
	graph.node(node).then(function() {
		console.log('Saved node: ' + node.name);
	}, function(err) {
		console.log('Error saving node: ' + node.name + ', ' + err);
	})
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
