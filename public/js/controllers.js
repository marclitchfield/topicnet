angular.module('controllers', []).
	config(function($routeProvider) {
		$routeProvider.
			when('/', {controller: RootController, templateUrl: 'views/root.html'}).
			when('/detail/:topicId', {controller: DetailController, templateUrl: 'views/detail.html'}).
			otherwise({redirectTo: '/'});
	});

function RootController($scope, $http) {
	$http.get('/topics').success(function(topics) {
		$scope.rootTopics = topics;
	});

	$scope.addRootTopic = function() {
		$http.post('/topics', { name: $scope.rootTopicName }).success(function(newTopic) {
			$http.post('/topics/' + newTopic.id + '/root').success(function() {
				$scope.rootTopics.push(newTopic);
				$scope.rootTopicName = '';
			});
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

	$scope.addSubTopic = function() {
		$http.post('/topics', { name: $scope.subTopicName }).success(function(newTopic) {
			$http.post('/topics/' + $scope.topic.id + '/sub', { toid: newTopic.id }).success(function() {
				$scope.subTopics.push(newTopic);
				$scope.subTopicName = '';
			});
		});
	};

	$scope.addNextTopic = function() {
		$http.post('/topics', { name: $scope.nextTopicName }).success(function(newTopic) {
			$http.post('/topics/' + $scope.topic.id + '/next', { toid: newTopic.id }).success(function() {
				$scope.nextTopics.push(newTopic);
				$scope.nextTopicName = '';
			});
		});
	};
}