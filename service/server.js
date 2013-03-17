var express = require('express');
var app = express.createServer(express.logger());

app.use(express['static']('public'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'Silly Sampton Likes Plant-Like Petunias' }));

require('./authentication.js')(app);

var topics = require('./topics.js');
var resources = require('./resources.js');


// topics

app.get('/topics', topics.root);
app.post('/topics', topics.create);
app.put('/topics/:id', topics.update);
app.get('/topics/:id', topics.get);
app.get('/topics/:id/:rel', topics.getRelated);
app.get('/topics/:id/:rel/:toid', topics.getRelatedById);
app.post('/topics/:id/:rel/:toid/vote', topics.vote);
app.post('/topics/:id/root', topics.linkRoot);
app.post('/topics/:id/resources', topics.linkResource);
app['delete']('/topics/:id/resources/:resid', topics.unlinkResource);
app.post('/topics/:id/:rel', topics.linkRelated);
app['delete']('/topics/:id/root', topics.unlinkRoot);
app['delete']('/topics/:id/:rel/:toid', topics.unlinkRelated);
app['delete']('/topics/:id', topics['delete']);

// resources

app.post('/resources', resources.create);
app.get('/resources/:id', resources.get);
app.get('/resources', resources.search);
app.put('/resources/:id', resources.update);
app['delete']('/resources/:id', resources['delete']);


var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
