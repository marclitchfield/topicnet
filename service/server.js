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

app.use(function(req, res, next) {
	// The global user object is set in the authentication routes if the user is authenticated.
	global.user = undefined;
	next();
});

require('./routes/authentication-routes.js')(app, userService);
require('./routes/topic-routes.js')(app, topicService);
require('./routes/resource-routes.js')(app, resourceService);

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log('Listening on ' + port);
});
