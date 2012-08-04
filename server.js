var express = require('express');

var app = express.createServer(express.logger());

app.use(express.static('public'));

app.post('/node/', function(request, response) {
	response.json({ "nodes": 1 });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
