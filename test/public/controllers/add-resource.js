describe('AddResourceController', function() {
	var scope, httpBackend;

	beforeEach(inject(function($rootScope, $httpBackend) {
		scope = $rootScope.$new();
		httpBackend = $httpBackend;
	}));

	describe('when url is submitted', function() {
		var url = 'http://url.to/check';

		describe('and an existing resource is found', function() {
			var existingResource = { id: 1, title: 'title', url: url, source: 'source', verb: 'read' };

			beforeEach(inject(function($controller) {
				httpBackend.expectGET('/resources?url=http%3A%2F%2Furl.to%2Fcheck').respond([existingResource]);
				$controller(AddResourceController, {$scope: scope});
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
		});

		describe('but no match is found in the system', function() {

			beforeEach(inject(function($controller) {
				httpBackend.expectGET('/resources?url=http%3A%2F%2Furl.to%2Fcheck').respond([]);
				$controller(AddResourceController, {$scope: scope});
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
		});
	});

	describe('when add is called', function() {

		describe('and isNewResource is true', function() {
			var createdResource = { id: 1, title: 'title', url: 'url', source: 'source', verb: 'read' };

			beforeEach(inject(function($controller) {
				var requestedResource = { title: 'title', url: 'url', source: 'source', verb: 'read' };
				httpBackend.expectPOST('/resources', requestedResource).respond(createdResource);
				httpBackend.expectPOST('/topics/100/resources', { resid: createdResource.id }).respond(200, {});
				$controller(AddResourceController, {$scope: scope});

				scope.topic = { id: 100, resources: [] };
				scope.isNewResource = true;

				scope.title = requestedResource.title;
				scope.url = requestedResource.url;
				scope.source = requestedResource.source;
				scope.add();
				httpBackend.flush();
			}));

			it('should create a new resource and links it with the topic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should add the resource to the topic\'s resource list in the scope', function() {
				expect(scope.topic.resources).toEqual([createdResource]);
			});
		});

		describe('and isNewResource is false', function() {
			var existingResource = { id: 1, title: 'title', url: 'url', source: 'source', verb: 'read' };

			beforeEach(inject(function($controller) {
				httpBackend.expectPOST('/topics/100/resources', { resid: existingResource.id }).respond(200, {});
				$controller(AddResourceController, {$scope: scope});

				scope.topic = { id: 100, resources: [] };
				scope.isNewResource = false;
				scope.resourceId = existingResource.id;

				scope.topic = { id: 100, resources: [] };
				scope.title = existingResource.title;
				scope.url = existingResource.url;
				scope.source = existingResource.source;
				scope.add();
				httpBackend.flush();
			}));

			it('should link existing resource with the topic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should add the resource to the topic\'s resource list in the scope', function() {
				expect(scope.topic.resources).toEqual([existingResource]);
			});
		});
	});


	describe('when clear is called', function() {

		beforeEach(inject(function($controller) {
			$controller(AddResourceController, {$scope: scope});
			scope.title = 'title';
			scope.url = 'url';
			scope.source = 'source';
			scope.clear();
		}));

		it('should clear the value of the input fields', function() {
			expect(scope.url).toEqual('');
			expect(scope.title).toEqual('');
			expect(scope.source).toEqual('');
		});

		it('should reset the statusMessage', function() {
			expect(scope.statusMessage).toEqual('');
		});

		it('should reset isNewResource', function() {
			expect(scope.isNewResource).toEqual(false);
		});
	});


});
