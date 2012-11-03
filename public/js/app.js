angular.module('artoplasm', ['artoplasm.directives']).
	config(function($routeProvider) {
		$routeProvider.
			when('/', {controller: RootController, templateUrl: 'views/root.html'}).
			when('/detail/:topicId', {controller: TopicDetailController, templateUrl: 'views/topic-detail.html'}).
			when('/resources/:resourceId', {controller: ResourceDetailController, templateUrl: 'views/resource-detail.html'}).
			otherwise({redirectTo: '/'});
	});
