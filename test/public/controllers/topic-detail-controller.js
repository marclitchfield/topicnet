describe('TopicDetailController', function() {
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

		it('should request the topic from the server',  function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('should store the topic in scope', function() {
			expect(scope.topic.resources).toEqual(topic.resources);
			expect(scope.topic.sub).toEqual([]);
			expect(scope.topic.next).toEqual([]);
		});

		it('should set the editedTopicName to the topic name', function() {
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

		it('should send the edited name to the server', function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('should update the topic name in scope', function() {
			expect(scope.topic.name).toEqual(scope.editedTopicName);
		});
	});

	describe('resource voting', function() {
		var location;
		var params = { topicId: topic.id };
		var resource = { id: 2 };

		beforeEach(inject(function($controller, $location) {
			httpBackend.expectGET('/topics/1').respond(topic);
			$controller(TopicDetailController, { $scope: scope, $routeParams: params });
			httpBackend.flush();

			location = $location;
			spyOn(location, 'path');
		}));

		describe('upvote a resource', function() {
			beforeEach(inject(function($controller) {
				httpBackend.expectPOST('/topics/1/resources/2/vote', { dir: 'up' }).respond(200, { score: 1 });
				scope.upvote(resource);
				httpBackend.flush();
			}));

			it('should send vote to the server with direction "up"', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should set the score returned from the service', function() {
				expect(resource.score).toEqual(1);
			});
		});

		describe('downvote a resource', function() {
			beforeEach(inject(function($controller) {
				httpBackend.expectPOST('/topics/1/resources/2/vote', { dir: 'down' }).respond(200, { score: -1 });
				scope.downvote(resource);
				httpBackend.flush();
			}));

			it('should send vote to the server with direction "down"', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should set the score returned from the service', function() {
				expect(resource.score).toEqual(-1);
			});
		});	
	});
});
