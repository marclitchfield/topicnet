describe('TopicDetailController', function() {
	beforeEach(module('topicnet.controllers'));

	describe('is a controller', function() {
		var scope, httpBackend;
		var topic = { id: 1, name: 'topic', resources: [] };

		function setupController(controller, topic) {
			var params = { topicId: topic.id };
			httpBackend.expectGET('/topics/1').respond(topic);
			controller('TopicDetailController', { $scope: scope, $routeParams: params });
			httpBackend.flush();
		}

		beforeEach(inject(function($rootScope, $httpBackend, $controller) {
			scope = $rootScope.$new();
			httpBackend = $httpBackend;
			setupController($controller, topic);
		}));

		describe('when topic detail is loaded', function() {
			it('should request the topic from the server',  function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should store the topic in scope', function() {
				expect(scope.topic.resources).toEqual([]);
				expect(scope.topic.sub).toEqual([]);
				expect(scope.topic.next).toEqual([]);
			});

			it('should set the editedTopicName to the topic name', function() {
				expect(scope.editedTopicName).toEqual('topic');
			});


			describe('and there are hidden resources', function() {

				beforeEach(inject(function($controller) {
					var resources = [{id:1}, {id:2, hidden:true}];
					setupController($controller, { id: 1, resources: resources });
				}));

				it('should not show hidden resources in the resource list', function() {
					expect(scope.topic.resources).toEqual([{id:1}]);
				});

			});

			describe('and there are hidden related topics', function() {

				beforeEach(inject(function($controller) {
					var subTopics = [{id:1}, {id:2, hidden:true}];
					var nextTopics = [{id:3}, {id:4, hidden:true}];
					setupController($controller, { id: 1, sub: subTopics, next: nextTopics });
				}));

				it('should not show hidden sub topics topics in the sub topics list', function() {
					expect(scope.topic.sub).toEqual([{id:1}]);
				});


				it('should not show hidden next topics topics in the next topics list', function() {
					expect(scope.topic.next).toEqual([{id:3}]);
				});
			});

		});

		describe('when update is called', function() {
			beforeEach(function() {
				httpBackend.expectPUT('/topics/1', { name: 'edited' }).respond(200, {});
				scope.editedTopicName = 'edited';
				scope.update();
				httpBackend.flush();
			});

			it('should send the edited name to the server', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should update the topic name in scope', function() {
				expect(scope.topic.name).toEqual(scope.editedTopicName);
			});
		});

		describe('when a resource is removed from a topic', function() {
			beforeEach(function() {
				topic.resources = [ {id: 8}, {id: 9} ];
				httpBackend.expectPOST('/topics/1/resources/8/hide').respond(200, {});
				scope.hideResource({id:8});
				httpBackend.flush();
			});

			it('should tell the service to hide the resource on the current topic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should remove the resource from the list', function() {
				expect(topic.resources).toEqual([{ id: 9 }]);
			});
		});

		describe('when a resource is dragged onto a related topic', function() {
			beforeEach(function() {
				topic.resources = [ {id: 8}, {id: 9} ];
				httpBackend.expectPOST('/topics/1/resources/8/hide').respond(200, {});
				httpBackend.expectPOST('/topics/1/sub/999/affirm').respond(200, {});
				scope.moveResource({id:8}, 'sub', {id:999});
				httpBackend.flush();
			});

			it('should tell the service to hide the resource on the current topic and affirm it on the target topic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should remove the resource from the list', function() {
				expect(topic.resources).toEqual([{ id: 9 }]);
			});
		});
	});
});
