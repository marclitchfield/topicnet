function AddController($scope, $http) {
	$scope.$on('topicSelected', function(e, topic) {
		$scope.selectedTopic = topic;
	});

	$scope.add = function() {
		if ($scope.selectedTopic.hasOwnProperty('id')) {
			$scope.linkfn($scope.selectedTopic);
		} else {
			$http.post('/topics', { name: $scope.searchQuery }).success(function(topic) {
				$scope.linkfn(topic);
			});
		}
		$scope.searchQuery = '';
	};
}

function RootController($scope, $http) {
	$http.get('/topics').success(function(topics) {
		$scope.rootTopics = topics;
	});

	$scope.linkfn = function makeRoot(topic) {
		$http.post('/topics/' + topic.id + '/root').success(function() {
			$scope.rootTopics.push(topic);
		});
	};
}

function DetailController($scope, $http, $routeParams) {
	$http.get('/topics/' + $routeParams.topicId).success(function(topic) {
		$scope.topic = topic;
		$scope.subTopics = topic.sub || [];
		$scope.nextTopics = topic.next || [];
		$scope.resources = topic.resources || [];
	});
}

function SubTopicController($scope, $http) {
	$scope.linkfn = function addSubTopic(toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/sub', { toid: toTopic.id }).success(function() {
			$scope.subTopics.push(toTopic);
		});
	};
}

function NextTopicController($scope, $http) {
	$scope.linkfn = function addNextTopic(toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/next', { toid: toTopic.id }).success(function() {
			$scope.nextTopics.push(toTopic);
		});
	};
}
