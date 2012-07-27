#!/usr/bin/env node
var port = process.env.PORT || 8080;
var http = require('http');
http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(port);
console.log('Server running at http://127.0.0.1:' + port + '/');
