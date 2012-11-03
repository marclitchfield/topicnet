describe('AddTopicController', function() {
	var scope, httpBackend;
	var topic = { id: 1, name: 'topic', resources: [] };

	beforeEach(inject(function($rootScope, $httpBackend) {
		scope = $rootScope.$new();
		httpBackend = $httpBackend;
	}));

	describe('when constructed with topicId parameter', function() {
		beforeEach(inject(function($controller) {
			var params = { topicId: topic.id };
			httpBackend.expectGET('/topics/1').respond(topic);
			$controller(TopicDetailController, { $scope: scope, $routeParams: params });
			httpBackend.flush();
		}));

		it('requests the topic from the server',  function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('stores the topic in scope', function() {
			expect(scope.topic.resources).toEqual(topic.resources);
			expect(scope.topic.sub).toEqual([]);
			expect(scope.topic.next).toEqual([]);
		});

		it('sets the editedTopicName to the topic name', function() {
			expect(scope.editedTopicName).toEqual(topic.name);
		});
	});

	describe('when update is called', function() {
		beforeEach(inject(function($controller) {
			var params = { topicId: topic.id };
			httpBackend.expectGET('/topics/1').respond(topic);
			$controller(TopicDetailController, { $scope: scope, $routeParams: params });
			httpBackend.flush();
			
			httpBackend.expectPUT('/topics/1', { name: 'edited' }).respond(200, {});
			scope.editedTopicName = 'edited';
			scope.update();
			httpBackend.flush();
		}));

		it('sends the edited name to the server', function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('updates the topic name in scope', function() {
			expect(scope.topic.name).toEqual(scope.editedTopicName);
		});
	});
});
