var AuthenticationController = ['$scope', '$location', 'AuthenticationService', function($scope, $location, AuthenticationService) {

	var $currentUser;

	AuthenticationService.readCurrentUser()
	.error(function(message) {
		$scope.$emit('error', message);
	});

	$scope.$watch(AuthenticationService.currentUser, function(currentUser) {
		$scope.currentUser = currentUser;
	});

	$scope.logout = function() {
		AuthenticationService.logout()
		.error(function(message) {
			$scope.$emit('error', message);
		});
	};

}];
