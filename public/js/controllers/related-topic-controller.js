var RelatedTopicController = ['$scope', '$http', function($scope, $http) {

	// $scope.rel must be defined
	
	$scope.linkfn = function addRelatedTopic(toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/' + $scope.rel, { toid: toTopic.id }).success(function() {
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

	function vote(relationship, toTopic, dir) {
		var voteUrl = '/topics/' + $scope.topic.id + '/' + relationship + '/' + toTopic.id + '/vote';
		$http.post(voteUrl, {dir: dir}).success(function(response) {
			toTopic.score = response.score;
		}).error(function(message) {
			$scope.$emit('error', message);
		});
	}

	$scope.upvote = function(relationship, toTopic) {
		vote(relationship, toTopic, 'up');
	};

	$scope.downvote = function(relationship, toTopic) {
		vote(relationship, toTopic, 'down');
	};
}];