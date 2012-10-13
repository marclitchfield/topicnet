angular.module('artoplasm', ['artoplasm.directives']).
	config(function($routeProvider) {
		$routeProvider.
			when('/', {controller: RootController, templateUrl: 'views/root.html'}).
			when('/detail/:topicId', {controller: DetailController, templateUrl: 'views/detail.html'}).
			when('/resources/:resourceId', {controller: ResourceController, templateUrl: 'views/resource.html'}).
			otherwise({redirectTo: '/'});
	});
