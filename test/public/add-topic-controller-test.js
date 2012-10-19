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

	describe('when add is called', function() {

		describe('with a topic that does not have an id property', function() {
			var createdTopic;

			beforeEach(inject(function($controller) {
				scope.searchQuery = 'topic';
				var selectedTopic = { name: scope.searchQuery };
				createdTopic = { id: 1, name: scope.searchQuery };
				httpBackend.expectPOST('/topics', selectedTopic).respond(createdTopic);
				$controller(AddTopicController, {$scope: scope});
				scope.add();
				httpBackend.flush();
			}));

			it('creates a new topic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('calls the link function', function() {
				expect(scope.linkfn).toHaveBeenCalledWith(createdTopic);
			});

			it('clears the search query', function() {
				expect(scope.searchQuery).toEqual('');
			});
		});

		describe('with topic that has an id property', function() {
		
			beforeEach(inject(function($controller) {
				$controller(AddTopicController, {$scope: scope});
				scope.selectedTopic = { id: 1, name: 'topic' };
				scope.add();
			}));

			it('just calls the link function', function() {
				expect(scope.linkfn).toHaveBeenCalledWith(scope.selectedTopic);
			});

			it('clears the search query', function() {
				expect(scope.searchQuery).toEqual('');
			});
		});
	});
});
