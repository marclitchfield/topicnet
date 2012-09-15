angular.module('api', ['ngResource']).
	factory('Topics', function($resource) {
		var Topics = $resource('/topics/:id');
		return Topics;
	});