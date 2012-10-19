describe('AddTopicController', function() {
	var scope, httpBackend;

	beforeEach(inject(function($rootScope, $httpBackend) {
		scope = $rootScope.$new();
		httpBackend = $httpBackend;
		scope.linkfn = function() {};
		spyOn(scope, 'linkfn');
	}));

	describe('when topicSelected event is raised', function() {
		
		it('stores the selectedTopic in scope', inject(function($controller) {
			$controller(AddTopicController, {$scope: scope});
			var topic = { name: 'topic' };
			scope.$broadcast('topicSelected', topic);
			expect(scope.selectedTopic).toBe(topic);
		}));

	});

	describe('add', function() {

		describe('a topic without an id property', function() {
			var createdTopic;

			beforeEach(inject(function($controller) {
				scope.searchQuery = 'topic';
				var selectedTopic = { name: scope.searchQuery };
				createdTopic = { id: 1, name: scope.searchQuery };
				httpBackend.expectPOST('/topics', selectedTopic).respond(createdTopic);
				$controller(AddTopicController, {$scope: scope});
				scope.add();
			}));

			it('creates a new topic', function() {
				httpBackend.flush();
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('calls the link function', function() {
				httpBackend.flush();
				expect(scope.linkfn).toHaveBeenCalledWith(createdTopic);
			});
		});

		describe('a topic with an id property', function() {
		
			beforeEach(inject(function($controller) {
				$controller(AddTopicController, {$scope: scope});
				scope.selectedTopic = { id: 1, name: 'topic' };
				scope.add();
			}));

			it('just calls the link function', function() {
				expect(scope.linkfn).toHaveBeenCalledWith(scope.selectedTopic);
			});
		});
	});
});
