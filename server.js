var express = require('express');
var neo4j = require('neo4j');
var _ = require('underscore');

var app = express.createServer(express.logger());
var graph = new neo4j.GraphDatabase('http://localhost:7474');

app.use(express.bodyParser());

app.use(express.static('public'));

app.post('/node/', function(request, response) {
	response.json({ "nodes": 1 });
});

app.get('/topic/:id/links', function(request, response) {
});

app.get('/topic', function(request, response) {
	graph.getNodeById(0, function(root) {
		var rootNodes = _.map(root.all, function(node) {
			return { name: node.name };
		});
		response.json(rootNodes);
	});
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

app.post('/link', function(request, response) {
	graph.getNodeById(request.body.from, function(fromNode) {
		graph.getNodeById(request.body.to, function(toNode) {
			var relationshipType = request.body.type;

			fromNode.createRelationship(toNode, relationshipType, function() {
				console.log('Created relationship ' + 
						request.body.from + '-[ ' + 
						request.body.type + ' ]-> ' + request.body.to);

			}, function(err) {
				console.log('Error saving relationship: ' + err);
			});
		});
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
