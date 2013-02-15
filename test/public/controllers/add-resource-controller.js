describe('AddResourceController', function() {
	var scope, httpBackend;
	var topic = { id: 2, name: 'topic' };

	beforeEach(inject(function($rootScope, $httpBackend) {
		scope = $rootScope.$new();
		httpBackend = $httpBackend;
	}));

	describe('when constructed with topicId parameter', function() {
		beforeEach(inject(function($controller) {
			httpBackend.expectGET('/topics/2').respond(topic);
			var params = { topicId: topic.id };
			$controller(AddResourceController, {$scope: scope, $routeParams: params});
			httpBackend.flush();
		}));

		it('should request the topic from the server',  function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('should store the topic in scope', function() {
			expect(scope.topic).toEqual(topic);
		});
	});

	describe('when url is submitted', function() {
		var url = 'http://url.to/check';

		describe('and an existing resource is found', function() {
			var existingResource = { id: 1, title: 'title', url: url, source: 'source', verb: 'read' };

			beforeEach(inject(function($controller) {
				httpBackend.expectGET('/topics/2').respond(topic);
				httpBackend.expectGET('/resources?url=http%3A%2F%2Furl.to%2Fcheck').respond([existingResource]);
				var params = { topicId: topic.id };
				$controller(AddResourceController, {$scope: scope, $routeParams: params});
				scope.url = url;
				scope.submitUrl();
				httpBackend.flush();
			}));

			it('should check if the url is already in the system', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should fill in the detail fields', function() {
				expect(scope.title).toEqual('title');
				expect(scope.source).toEqual('source');
				expect(scope.verb).toEqual('read');
			});

			it('should set the resourceId', function() {
				expect(scope.resourceId).toEqual(existingResource.id);
			});

			it('should not set the isNewResource variable', function() {
				expect(scope.isNewResource).toEqual(false);
			});

			it('should set a status message', function() {
				expect(scope.statusMessage).toNotBe(undefined);
			});

			it('should set a urlsubmitted flag', function() {
				expect(scope.urlSubmitted).toEqual(true);
			});
		});

		describe('but no match is found in the system', function() {

			beforeEach(inject(function($controller) {
				httpBackend.expectGET('/topics/2').respond(topic);
				httpBackend.expectGET('/resources?url=http%3A%2F%2Furl.to%2Fcheck').respond([]);
				var params = { topicId: topic.id };
				$controller(AddResourceController, {$scope: scope, $routeParams: params});
				scope.url = url;
				scope.submitUrl();
				httpBackend.flush();
			}));

			it('should check if the url is already in the system', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should not set detail fields', function() {
				expect(scope.title).toBe(null);
				expect(scope.source).toBe(null);
			});

			it('should not set the resourceId', function() {
				expect(scope.resourceId).toEqual(null);
			});

			it('should set the isNewResource variable', function() {
				expect(scope.isNewResource).toEqual(true);
			});

			it('should set a status message', function() {
				expect(scope.statusMessage).toNotBe(undefined);
			});

			it('should set a urlsubmitted flag', function() {
				expect(scope.urlSubmitted).toEqual(true);
			});
		});
	});

	describe('when add is called', function() {

		describe('and isNewResource is true', function() {
			var createdResource = { id: 1, title: 'title', url: 'url', source: 'source', verb: 'read' };
			var location;

			beforeEach(inject(function($controller, $location) {
				var requestedResource = { title: 'title', url: 'url', source: 'source', verb: 'read' };
				httpBackend.expectGET('/topics/2').respond(topic);
				var params = { topicId: topic.id };
				$controller(AddResourceController, {$scope: scope, $routeParams: params});
				httpBackend.flush();

				scope.isNewResource = true;
				scope.title = requestedResource.title;
				scope.url = requestedResource.url;
				scope.source = requestedResource.source;
				scope.verb = 'Read';

				httpBackend.expectPOST('/resources', requestedResource).respond(createdResource);
				httpBackend.expectPOST('/topics/2/resources', { resid: createdResource.id }).respond(200, {});

				location = $location;
				spyOn(location, 'path');

				scope.add();

				httpBackend.flush();
			}));

			it('should create a new resource and link it with the topic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should redirect to topic details view', function() {
				expect(location.path).toHaveBeenCalledWith('topics/2');
			});
		});

		describe('and isNewResource is false', function() {
			var existingResource = { id: 1, title: 'title', url: 'url', source: 'source', verb: 'read' };
			var location;

			beforeEach(inject(function($controller, $location) {
				httpBackend.expectGET('/topics/2').respond(topic);
				var params = { topicId: topic.id };
				$controller(AddResourceController, {$scope: scope, $routeParams: params});
				httpBackend.flush();

				scope.isNewResource = false;
				scope.resourceId = existingResource.id;
				scope.title = existingResource.title;
				scope.url = existingResource.url;
				scope.source = existingResource.source;
				scope.verb = 'Read';

				httpBackend.expectPOST('/topics/2/resources', { resid: existingResource.id }).respond(200, {});

				location = $location;
				spyOn(location, 'path');

				scope.add();
				httpBackend.flush();
			}));

			it('should link existing resource with the topic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should redirect to topic details view', function() {
				expect(location.path).toHaveBeenCalledWith('topics/2');
			});
		});

	});

	describe('when cancel is called', function() {
		var location;

		beforeEach(inject(function($controller, $location) {
			var requestedResource = { title: 'title', url: 'url', source: 'source', verb: 'read' };
			httpBackend.expectGET('/topics/2').respond(topic);
			var params = { topicId: topic.id };
			$controller(AddResourceController, {$scope: scope, $routeParams: params});
			httpBackend.flush();

			location = $location;
			spyOn(location, 'path');

			scope.cancel();
		}));

		it('should redirect back to the topic page', function() {
			expect(location.path).toHaveBeenCalledWith('topics/2');
		});

	});
});
