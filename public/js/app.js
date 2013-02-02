angular.module('artoplasm', ['artoplasm.directives']).
	config(function($routeProvider) {
		$routeProvider.
			when('/', {controller: RootController, templateUrl: 'views/root.html'}).
			when('/topics/:topicId', {controller: TopicDetailController, templateUrl: 'views/topic-detail.html'}).
			when('/topics/:topicId/resources/add', {controller: AddResourceController, templateUrl: 'views/resource-add.html'}).
			when('/resources/:resourceId', {controller: ResourceDetailController, templateUrl: 'views/resource-detail.html'}).
			otherwise({redirectTo: '/'});
	});
