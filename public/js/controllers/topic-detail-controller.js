var TopicDetailController = ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
	$http.get('/topics/' + $routeParams.topicId).success(function(topic) {
		$scope.topic = topic;
		$scope.topic.resources = $scope.topic.resources || [];
		$scope.topic.sub = $scope.topic.sub || [];
		$scope.topic.next = $scope.topic.next || [];
		$scope.editedTopicName = topic.name;
	}).error(function(message) {
		$scope.$emit('error', message);
	});

	$scope.update = function() {
		$http.put('/topics/' + $scope.topic.id, {name: $scope.editedTopicName}).success(function() {
			$scope.topic.name = $scope.editedTopicName;
		}).error(function(message) {
			$scope.$emit('error', message);
		});
	};
}];