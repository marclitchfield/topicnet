topicnet.controllers.controller('SignupController', function($scope, $location, AuthenticationService) {

	$scope.signUp = function() {

		if(!$scope.email) {
			$scope.$emit('error', 'Please enter a valid email address.');
			return;
		}
		if(!$scope.password || $scope.password.length < 6) {
			$scope.$emit('error', 'Please enter a password that is at least 6 characters long.');
			return;
		}

		AuthenticationService.signup($scope.email, $scope.password)
		.success(function(user) {
			redirectToHome();
			$scope.$emit('success', 'Welcome ' + user.email + '! Thanks for signing up!');
		})
		.error(function(message) {
			$scope.$emit('error', message);
		});
	};

	function redirectToHome() {
		$location.path('/');
	}

});
