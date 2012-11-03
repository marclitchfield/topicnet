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