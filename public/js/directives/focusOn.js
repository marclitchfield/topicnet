angular.module('topicnet.directives', []).
	directive('focusOn', function() {
		return function (scope, element, attrs) {
			scope.$watch(attrs.focusOn, function(value) {
				if(attrs.focusOn) {
					window.setTimeout(function() {
						element.focus();
					}, 0);
				}
			});
		};
	});