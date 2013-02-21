var ResourceDetailController = ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
	$http.get('/resources/' + $routeParams.resourceId).success(function(resource) {
		$scope.resource = resource;
	}).error(function(message) {
		$scope.$emit('error', message);
	});
}];