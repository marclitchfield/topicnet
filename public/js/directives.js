angular.module('artoplasm.directives', []).

	directive('typeaheadTopicSearch',function() {
        return function(scope, el, attrs) {
			el.typeahead({
				source: function(typeahead, query) {
					return $.get('/topics', {q: query.toLowerCase()}).success(function(topics) {
						topics.push({name: query});
						var response = typeahead.process(topics);
						scope.$apply();
						return response;
					});
				},
				property: 'name',
				onselect: function(item) {
					scope.$broadcast('topicSelected', item);
				}
			});
        };
    }).

    directive('addTopicForm', function() {
		return {
			templateUrl: 'partials/add-topic-form.html',
			replace: true
		};
    });