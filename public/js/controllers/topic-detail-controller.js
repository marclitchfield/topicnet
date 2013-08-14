topicnet.controllers.controller('TopicDetailController', function($scope, $http, $routeParams, $location) {

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

	$scope.dragstart = function(event, ui) {
		$(event.target).addClass('dragging');
		$scope.topic.isDragging = true;
		$scope.$apply();
	};

	$scope.dragstop = function(event, ui) {
		$(event.target).removeClass('dragging');
		$scope.topic.isDragging = false;
		$scope.$apply();
	};

	$scope.hideResource = function(resource) {
		$http.post('/topics/' + $scope.topic.id + '/resources/' + resource.id + '/hide').success(function() {
			$scope.topic.resources = $scope.topic.resources.filter(function(r) {
				return r.id !== resource.id;
			});
		});
	};

	$scope.moveResource = function(resource, toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/resources/' + resource.id + '/hide').success(function() {
			return $http.post('/topics/' + toTopic.id + '/resources/' + resource.id + '/affirm');
		}).success(function() {
			$scope.topic.resources = $scope.topic.resources.filter(function(r) {
				return r.id !== resource.id;
			});
		});
	};
});