angular.module('controllers', []).
	config(function($routeProvider) {
		$routeProvider.
			when('/', {controller: RootController, templateUrl: 'views/root.html'}).
			when('/detail/:topicId', {controller: DetailController, templateUrl: 'views/detail.html'}).
			otherwise({redirectTo: '/'});
	});

function RootController($scope) {
	$.get('/topics', function(topics) {
		$scope.rootTopics = topics;
		$scope.$apply();
	});
}

function DetailController($scope, $location, $routeParams) {
	$.get('/topics/' + $routeParams.topicId, function(topic) {
		$scope.topic = topic;
		$scope.$apply();
	});
}