var RelatedTopicController = ['$scope', '$http', function($scope, $http) {

	// $scope.rel must be defined
	
	$scope.linkfn = function addRelatedTopic(toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/' + $scope.rel, { toid: toTopic.id }).success(function() {
			toTopic.score = 0;
			$scope.topic[$scope.rel].push(toTopic);
		}).error(function(message) {
			$scope.$emit('error', message);
		});
	};

	$scope.removeLink = function(toTopic) {
		$http['delete']('/topics/' + $scope.topic.id + '/' + $scope.rel + '/' + toTopic.id).success(function() {
			$scope.topic[$scope.rel] = $scope.topic[$scope.rel].filter(function(t) {
				return t.id !== toTopic.id;
			});
		}).error(function(message) {
			$scope.$emit('error', message);
		});
	};

	$scope.dropped = function(event, ui, item) {
		var resid = ui.draggable.data('resource-id');
		if (resid) {
			console.log('dropped resource ' + resid);
		}
		var topicid = ui.draggable.data('topic-id');
		if (topicid) {
			console.log('dropped topic ' + topicid);
		}
		ui.draggable.remove();
	};
}];