var LoginController = ['$scope', '$rootScope', '$http', '$location', function($scope, $rootScope, $http, $location) {

	$scope.login = function() {
		var cryptedPassword = CryptoJS.SHA256($scope.password).toString();
		$http.post('/login', { email: $scope.email, password: cryptedPassword })
		.success(function(user) {
			$rootScope.$broadcast('loggedIn', user);
			$scope.$emit('success', 'Welcome ' + user.email + '!');
			redirectToHome();
		})
		.error(function(message) {
			$scope.$emit('error', message);
		});
	};

	function redirectToHome() {
		$location.path('/');
	}

}];
