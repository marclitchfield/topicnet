angular.module('artoplasm.directives', []).

	directive('typeaheadTopicSearch',function() {
        return function(scope, el, attrs) {
			el.typeahead({
				source: function(typeahead, query) {
					var queryTopic = {name: query};
					scope.$broadcast('topicSelected', queryTopic);

					return $.get('/topics', {q: query.toLowerCase()}).success(function(topics) {
						topics.push(queryTopic);
						var response = typeahead.process(topics);
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
    }).

    directive('gestureSwipe', function() {
		return function(scope, el, attrs) {
			el.bind('touchy-swipe', function() {
				scope.$eval(attrs.gestureSwipe);
				scope.$apply();
			});
		};
    });
