function AddResourceController($scope, $http, $routeParams, $location) {
	$scope.allVerbs = ['Read', 'Watch', 'Listen', 'Engage'];

	$http.get('/topics/' + $routeParams.topicId).success(function(topic) {
		$scope.topic = topic;
	}).error(function(message) {
		$scope.$emit('error', message);
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
			}).error(function(message) {
				$scope.$emit('error', message);
			});
		}
	};

	$scope.add = function() {
		var resourceData = { title: $scope.title, url: $scope.url, source: $scope.source, verb: $scope.verb.toLowerCase() };

		if ($scope.isNewResource) {
			$http.post('/resources', resourceData).success(function(resource) {
				$http.post('/topics/' + $scope.topic.id + '/resources', { resid: resource.id }).success(function() {
					redirectToTopic();
				}).error(function(message) {
					$scope.$emit('error', message);
				});
			}).error(function(message) {
				$scope.$emit('error', message);
			});
		} else {
			$http.post('/topics/' + $scope.topic.id + '/resources', { resid: $scope.resourceId }).success(function() {
				redirectToTopic();
			}).error(function(message) {
				$scope.$emit('error', message);
			});
		}
	};

	$scope.cancel = function() {
		redirectToTopic();
	};
}