var RootController = ['$scope', '$http', function($scope, $http) {
	$http.get('/topics').success(function(topics) {
		$scope.rootTopics = topics;
	});

	$scope.linkfn = function makeRoot(topic) {
		$http.post('/topics/' + topic.id + '/root').success(function() {
			$scope.rootTopics.push(topic);
		}).error(function(message) {
			$scope.$emit('error', message);
		});
	};

	$scope.removeRoot = function(topic) {
		$http['delete']('/topics/' + topic.id + '/root').success(function() {
			$scope.rootTopics = $scope.rootTopics.filter(function(t) {
				return t.id !== topic.id;
			});
		}).error(function(message) {
			$scope.$emit('error', message);
		});
	};
}];
