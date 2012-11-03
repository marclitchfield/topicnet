function ResourceDetailController($scope, $http, $routeParams) {
	$http.get('/resources/' + $routeParams.resourceId).success(function(resource) {
		$scope.resource = resource;
	});
}
