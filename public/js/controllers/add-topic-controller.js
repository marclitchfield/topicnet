function AddTopicController($scope, $http) {
	$scope.$on('topicSelected', function(e, topic) {
		$scope.selectedTopic = topic;
	});

	$scope.show = function() {
		$scope.formVisible = true;
	};

	$scope.add = function() {
		if ($scope.selectedTopic && $scope.selectedTopic.hasOwnProperty('id')) {
			$scope.linkfn($scope.selectedTopic);
		} else {
			$http.post('/topics', { name: $scope.searchQuery }).success(function(topic) {
				$scope.linkfn(topic);
			}).error(function(message) {
				$scope.$emit('error', message);
			});
		}
		 
		$scope.clear();
	};

	$scope.clear = function() {
		$scope.formVisible = false;
		$scope.searchQuery = '';
	};
}
