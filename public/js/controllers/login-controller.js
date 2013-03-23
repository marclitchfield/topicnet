var LoginController = ['$scope', '$rootScope', '$location', 'AuthenticationService', function($scope, $rootScope, $location, AuthenticationService) {

	$scope.login = function() {

		if(!$scope.email) {
			$scope.$emit('error', 'Please enter a valid email address.');
			return;
		}
		if(!$scope.password) {
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
