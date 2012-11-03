function AddResourceController($scope, $http) {
	$scope.submitUrl = function() {
		if ($scope.url) {
			$http.get('/resources?url=' + encodeURIComponent($scope.url)).success(function(resources) {
				if (resources.length > 0) {
					$scope.title = resources[0].title;
					$scope.source = resources[0].source;
					$scope.statusMessage = 'Resource was found in the system';
				} else {
					$scope.title = null;
					$scope.source = null;
					$scope.statusMessage = 'Resource was not in the system. Please enter details';
				}

				$scope.urlSubmitted = true;
			});
		}
	};

	$scope.add = function() {
		var data = { title: $scope.title, url: $scope.url, source: $scope.source, verb: 'read' };
		$http.post('/resources', data).success(function(resource) {
			$http.post('/topics/' + $scope.topic.id + '/resources', { resid: resource.id }).success(function() {
				$scope.topic.resources.push(resource);
				$scope.clear();
			});
		});
	};

	$scope.clear = function() {
		$scope.title = '';
		$scope.url = '';
		$scope.source = '';
		$scope.statusMessage = '';
		$scope.urlSubmitted = false;
	};
}