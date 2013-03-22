var LoginController = ['$scope', '$rootScope', '$location', 'AuthenticationService', function($scope, $rootScope, $location, AuthenticationService) {

	$scope.login = function() {
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
