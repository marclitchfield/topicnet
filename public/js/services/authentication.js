topicnet.factory( 'AuthenticationService', ['$http', function($http) {

  var currentUser;

	function login(email, password) {
		var cryptedPassword = CryptoJS.SHA256(password).toString();
		return $http.post('/login', { email: email, password: cryptedPassword })
		.success(function(user) {
			currentUser = user;
			return user;
		});
	}

  return {

		readCurrentUser: function() {
			return $http.get('/user')
			.success(function(user) {
				currentUser = user;
				return user;
			});
		},

		signup: function(email, password) {
			var cryptedPassword = CryptoJS.SHA256(password).toString();
			return $http.post('/user', { email: email, password: cryptedPassword })
			.success(function() {
				return login(email, password);
			});
		},

    login: login,

    logout: function() {
			return $http.post('/logout', {})
			.success(function() {
				currentUser = undefined;
			});	
		},

    currentUser: function() {
			return currentUser;
		}

  };
	
}]);
