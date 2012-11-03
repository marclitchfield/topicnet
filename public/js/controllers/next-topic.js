function NextTopicController($scope, $http) {
	$scope.linkfn = function addNextTopic(toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/next', { toid: toTopic.id }).success(function() {
			$scope.topic.next.push(toTopic);
		});
	};

	$scope.removeLink = function(nextTopic) {
    $http.delete('/topics/' + $scope.topic.id + '/next/' + nextTopic.id).success(function() {
			$scope.topic.next = $scope.topic.next.filter(function(t) {
				return t.id !== nextTopic.id;
			});
		});
	};
}