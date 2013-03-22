var AuthenticationController = ['$scope', '$http', '$location', function($scope, $http, $location) {

	$http.get('/user')
	.success(function(user) {
		$scope.currentUser = user;
	})
	.error(function(message) {
		$scope.$emit('error', message);
	});

	$scope.logout = function() {
		$http.post('/logout', {})
		.success(function() {
			$scope.currentUser = undefined;
		})
		.error(function(message) {
			$scope.$emit('error', message);
		});
	};

	$scope.$on('loggedIn', function(event, user) {
		$scope.currentUser = user;
	});

}];
