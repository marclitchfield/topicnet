var topicnet = angular.module('topicnet', ['topicnet.directives', 'ngDragDrop']).
	config(['$routeProvider', function($routeProvider) {
		
		$routeProvider.
			when('/', {controller: RootController, templateUrl: 'views/root.html'}).
			when('/signup', {controller: SignupController, templateUrl: 'views/signup.html'}).
			when('/login', {controller: LoginController, templateUrl: 'views/login.html'}).
			when('/topics/:topicId', {controller: TopicDetailController, templateUrl: 'views/topic-detail.html'}).
			when('/topics/:topicId/resources/add', {controller: AddResourceController, templateUrl: 'views/resource-add.html'}).
			when('/resources/:resourceId', {controller: ResourceDetailController, templateUrl: 'views/resource-detail.html'}).
			otherwise({redirectTo: '/'});
	}]);
