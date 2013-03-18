var	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	graph = new require('./lib/graph'),
	userService = require('./lib/user-service').createService(graph),
	handler = require('./handler');


module.exports = function(app) {

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);

	passport.use(new LocalStrategy(function(username, password, done) {
		if (password !== 'secret') {
			done(null, false, { message: 'Incorrect' });
		} else {
			done(null, {username:username, id: 11119992});
		}
	}));

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		done(null, user);			
	});

	app.get('/user', function(request, response) { 
		response.json(request.user); 
	});

	app.post('/user', function(request, response) {
		handler.complete(response, userService.create(request.username, request.password));
	});

	app.post('/login', passport.authenticate('local'), function(request, response) {
		response.json(request.user);
	});

	app.post('/logout', function(request, response) { 
		request.logout(); 
		response.send(200);
	});

};