angular.module('artoplasm.directives', []).
	directive('modalAutofocus', function() {
		return function(scope, element, attrs) {
			$(element).on('shown', function() {
				$(this).find('[autofocus]').focus();
			});
		};
	});