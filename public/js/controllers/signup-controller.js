var SignupController = ['$scope', '$http', '$location', function($scope, $http, $location) {

	$scope.signUp = function() {
		var cryptedPassword = CryptoJS.SHA256($scope.password).toString();
		$http.post('/user', { email: $scope.email, password: cryptedPassword })
		.success(function(user) {
			redirectToHome();
			$scope.$emit('info', 'Thanks for signing up. Click login to login with your new credentials!');
		})
		.error(function(message) {
			$scope.$emit('error', message);
		});
	};

	function redirectToHome() {
		$location.path('/');
	}

}];
