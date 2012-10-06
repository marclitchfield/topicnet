function AddTopicController($scope, $http) {
	$scope.$on('topicSelected', function(e, topic) {
		$scope.selectedTopic = topic;
	});

	$scope.add = function() {
		if ($scope.selectedTopic && $scope.selectedTopic.hasOwnProperty('id')) {
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

	$scope.removeRoot = function(topic) {
		$http['delete']('/topics/' + topic.id + '/root').success(function() {
			$scope.rootTopics = $scope.rootTopics.filter(function(t) {
				return t.id !== topic.id;
			});
		});
	};
}

function DetailController($scope, $http, $routeParams) {
	$http.get('/topics/' + $routeParams.topicId).success(function(topic) {
		$scope.topic = topic;
		$scope.topic.resources = [
			{ id: 123, title: 'Herman Module', url: 'http://khaaaan.com', source: 'Internet' },
			{ id: 124, title: 'Shire Baggins Module', url: 'http://khanacademy.com', source: 'Frodo' },
			{ id: 126, title: 'Introductory Mesh Analysis', url: 'http://khanacademy.com', source: 'Toast Vision' }
		];
		$scope.topic.sub = $scope.topic.sub || [];
		$scope.topic.next = $scope.topic.next || [];
		$scope.editedTopicName = topic.name;
	});

	$scope.update = function() {
		$http.put('/topics/' + $scope.topic.id, {name: $scope.editedTopicName}).success(function() {
			$scope.topic.name = $scope.editedTopicName;
		});
	};
}

function SubTopicController($scope, $http) {
	$scope.linkfn = function addSubTopic(toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/sub', { toid: toTopic.id }).success(function() {
			$scope.topic.sub.push(toTopic);
		});
	};

	$scope.removeLink = function(topic, subTopic) {
		$.ajax({
			url: '/topics/' + topic.id + '/sub',
			type: 'DELETE',
			data: { toid: subTopic.id}
		}).success(function() {
			$scope.topic.sub = $scope.topic.sub.filter(function(t) {
				return t.id !== subTopic.id;
			});
			$scope.$apply();
		});
	};
}

function NextTopicController($scope, $http) {
	$scope.linkfn = function addNextTopic(toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/next', { toid: toTopic.id }).success(function() {
			$scope.topic.next.push(toTopic);
		});
	};

	$scope.removeLink = function(topic, nextTopic) {
		$.ajax({
			url: '/topics/' + topic.id + '/next',
			type: 'DELETE',
			data: { toid: nextTopic.id}
		}).success(function() {
			$scope.topic.next = $scope.topic.next.filter(function(t) {
				return t.id !== nextTopic.id;
			});
			$scope.$apply();
		});
	};
}
