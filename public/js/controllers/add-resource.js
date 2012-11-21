function AddResourceController($scope, $http, $routeParams, $location) {
	$http.get('/topics/' + $routeParams.topicId).success(function(topic) {
		$scope.topic = topic;
	});

	function redirectToTopic() {
		$location.path('topics/' + $scope.topic.id);
	}

	$scope.submitUrl = function() {
		if ($scope.url) {
			$http.get('/resources?url=' + encodeURIComponent($scope.url)).success(function(resources) {
				$scope.urlSubmitted = true;
				if (resources.length > 0) {
					$scope.title = resources[0].title;
					$scope.source = resources[0].source;
					$scope.resourceId = resources[0].id;
					$scope.isNewResource = false;
					$scope.statusMessage = 'Resource was found in the system';
				} else {
					$scope.title = null;
					$scope.source = null;
					$scope.resourceId = null;
					$scope.isNewResource = true;
					$scope.statusMessage = 'Resource was not in the system. Please enter details';
				}
			});
		}
	};

	$scope.add = function() {
		var resourceData = { title: $scope.title, url: $scope.url, source: $scope.source, verb: 'read' };

		if ($scope.isNewResource) {
			$http.post('/resources', resourceData).success(function(resource) {
				$http.post('/topics/' + $scope.topic.id + '/resources', { resid: resource.id }).success(function() {
					redirectToTopic();
				});
			});
		} else {
			$http.post('/topics/' + $scope.topic.id + '/resources', { resid: $scope.resourceId }).success(function() {
				redirectToTopic();
			});
		}
	};

	$scope.cancel = function() {
		redirectToTopic();
	};
}