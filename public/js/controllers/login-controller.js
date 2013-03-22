var LoginController = ['$scope', '$rootScope', '$location', 'AuthenticationService', function($scope, $rootScope, $location, AuthenticationService) {

	$scope.login = function() {

		if($scope.email === undefined || $scope.email.length < 6) {
			$scope.$emit('error', 'Missing or invalid email address.');
			return;
		}
		if($scope.password === undefined || $scope.password.length < 1) {
			$scope.$emit('error', 'Please enter your password.');
			return;
		}

		AuthenticationService.login($scope.email, $scope.password)
		.success(function(user) {
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
