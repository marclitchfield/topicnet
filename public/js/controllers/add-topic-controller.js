var AddTopicController = ['$scope', '$http', function($scope, $http) {
	$scope.$on('topicSelected', function(e, topic) {
		$scope.selectedTopic = topic;
	});

	$scope.show = function() {
		$scope.formVisible = true;
	};

	$scope.add = function() {
		if ($scope.selectedTopic && $scope.selectedTopic.hasOwnProperty('id')) {
			$scope.selectedTopic.score = 0;
			$scope.linkfn($scope.selectedTopic);
		} else {
			$http.post('/topics', { name: $scope.searchQuery }).success(function(topic) {
				topic.score = 0;
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
}];
