var SignupController = ['$scope', '$location', 'AuthenticationService', function($scope, $location, AuthenticationService) {

	$scope.signUp = function() {
		AuthenticationService.signup($scope.email, $scope.password)
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
