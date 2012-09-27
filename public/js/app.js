angular.module('artoplasm', ['artoplasm.directives']).
	config(function($routeProvider) {
		$routeProvider.
			when('/', {controller: RootController, templateUrl: 'views/root.html'}).
			when('/detail/:topicId', {controller: DetailController, templateUrl: 'views/detail.html'}).
			otherwise({redirectTo: '/'});
	});
