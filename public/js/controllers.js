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
}

function DetailController($scope, $http, $routeParams) {
	$http.get('/topics/' + $routeParams.topicId).success(function(topic) {
		$scope.topic = topic;
	});
}