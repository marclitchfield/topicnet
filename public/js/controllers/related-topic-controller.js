topicnet.controllers.controller('RelatedTopicController', function($scope, $http) {

	// $scope.rel must be defined
	
	$scope.linkfn = function addRelatedTopic(toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/' + $scope.rel, { toid: toTopic.id }).success(function() {
			toTopic.score = 0;
			$scope.topic[$scope.rel].push(toTopic);
		}).error(function(message) {
			$scope.$emit('error', message);
		});
	};

	$scope.hideTopic = function(topic, rel) {
		$http.post('/topics/' + $scope.topic.id + '/' + rel + '/' + topic.id + '/hide').success(function() {
			$scope.topic[rel] = $scope.topic[rel].filter(function(t) {
				return t.id !== topic.id;
			});
		});
	};

	$scope.moveTopic = function(topic, rel, toTopic) {
		$http.post('/topics/' + $scope.topic.id + '/' + rel + '/' + topic.id + '/hide').success(function() {
			return $http.post('/topics/' + topic.id + '/' + rel + '/' + toTopic.id + '/affirm');
		}).success(function() {
			$scope.topic[rel] = $scope.topic[rel].filter(function(t) {
				return t.id !== topic.id;
			});
		});
	};

	$scope.dropped = function(event, ui) {
		var dropTarget = $(event.target);
		dropTarget.removeClass('droptarget');
		var targetTopic = {id: dropTarget.data('topic-id')};
		var rel = dropTarget.data('rel');

		var resid = ui.draggable.data('resource-id');
		if (resid) {
			$scope.moveResource({id:resid}, rel, targetTopic);
		}

		var topicid = ui.draggable.data('topic-id');
		if (topicid) {
			$scope.moveTopic({id:topicid}, rel, targetTopic);
		}
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

	$scope.dragover = function(event, ui) {
		$(event.target).addClass('droptarget');
	};

	$scope.dragout = function(event, ui) {
		$(event.target).removeClass('droptarget');
	};

});