angular.module('topicnet.directives', []).
	directive('typeaheadTopicSearch',function() {
		return function(scope, el, attrs) {
			el.typeahead({
				source: function(typeahead, query) {
					return $.get('/topics', {q: query.toLowerCase()}).success(function(topics) {
						var foundTopic = _.find(topics, function(t) {
							return t.name.toLowerCase() === query.toLowerCase();
						});
						
						if (foundTopic === undefined) {
							foundTopic = {name: query};
							topics.push(foundTopic);
						}

						scope.$broadcast('topicSelected', foundTopic);
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
	});