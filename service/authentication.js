var	passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(app) {

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);

	passport.use(new LocalStrategy(function(username, password, done) {
		if (password !== 'secret') {
			done(null, false, { message: 'Incorrect' });
		} else {
			console.log('Logged in');
			done(null, {username:'frammis', id: 11119992});
		}
	}));

	passport.serializeUser(function(user, done) {
		console.log('serialized', user);
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		console.log('deserializing', id);
		done(null, {username:'frammis', id:id});
	});

	app.post('/login', passport.authenticate('local'), function(request, response) {
		response.json(request.user);
	});

	app.get('/whoami', function(request, response) { 
		response.json(request.user); 
	});

	app.get('/logout', function(request, response) { 
		request.logout(); 
		response.send(200);
	});

};