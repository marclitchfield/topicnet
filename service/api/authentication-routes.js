var	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	handler = require('../handler');

module.exports = function(app, userService) {

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);

	passport.use(new LocalStrategy({
			usernameField: 'email'
		},
		function(email, password, done) {
			userService.verify(email, password)
			.then(function(user) {
				done(null, user);
			})
			.fail(function() {
				done(null, false);
			});
		}
	));

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
		handler.complete(response, userService.create(request.body.email, request.body.password));
	});

	app.post('/login', passport.authenticate('local'), function(request, response) {
		response.json(request.user);
	});

	app.post('/logout', function(request, response) {
		request.logout();
		response.send(200);
	});
};