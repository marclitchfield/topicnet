var express = require('express'),
	app = express.createServer(express.logger()),
	neo4jGraph = require('./lib/graph/neo4j-graph'),
	topicnetGraph = require('./lib/graph/topicnet-graph').create(neo4jGraph),
	topicService = require('./lib/topic-service').create(topicnetGraph),
	resourceService = require('./lib/resource-service').create(topicnetGraph),
	userService = require('./lib/user-service').create(topicnetGraph);

app.use(express['static']('public'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'Silly Sampton Likes Plant-Like Petunias' }));

require('./api/authentication-routes.js')(app, userService);
require('./api/topic-routes.js')(app, topicService);
require('./api/resource-routes.js')(app, resourceService);

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log('Listening on ' + port);
});
