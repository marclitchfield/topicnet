function ErrorController($scope) {
	$scope.$on('error', function(e, message) {
		$scope.errorMessage = message;

		setTimeout(function() {
			if ($scope.errorMessage === message) {
				$scope.errorMessage = null;
				$scope.$apply();
			}
		}, 3000);
	})
}
