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


	$scope.dropped = function(event, ui) {
		var dropTarget = $(event.target);
		dropTarget.removeClass('droptarget');

		var resid = ui.draggable.data('resource-id');
		if (resid) {
			removeResource(resid);
		}

		var topicid = ui.draggable.data('topic-id');
		if (topicid) {
			removeTopic(ui.draggable.data('rel'), topicid);
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

	function removeTopic(rel, topicId) {
		$scope.topic[rel] = $scope.topic[rel].filter(function(t) {
			return t.id !== topicId;
		});
	}

	function removeResource(resourceId) {
		$scope.topic.resources = $scope.topic.resources.filter(function(r) {
			return r.id !== resourceId;
		});
	}
}];