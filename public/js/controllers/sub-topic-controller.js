function SubTopicController($scope, $http) {
	$scope.linkfn = function addSubTopic(toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/sub', { toid: toTopic.id }).success(function() {
			$scope.topic.sub.push(toTopic);
		}).error(function(message) {
			$scope.$emit('error', message);
		});
	};

	$scope.removeLink = function(subTopic) {
    $http['delete']('/topics/' + $scope.topic.id + '/sub/' + subTopic.id).success(function() {
			$scope.topic.sub = $scope.topic.sub.filter(function(t) {
				return t.id !== subTopic.id;
			});
		}).error(function(message) {
			$scope.$emit('error', message);
		});
	};
}