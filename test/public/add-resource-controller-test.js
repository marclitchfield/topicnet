describe('AddResourceController', function() {
	var scope, httpBackend;

	beforeEach(inject(function($rootScope, $httpBackend) {
		scope = $rootScope.$new();
		httpBackend = $httpBackend;
	}));

	describe('when add is called', function() {
		var createdResource = { id: 1, title: 'title', url: 'url', source: 'source', verb: 'read' };

		beforeEach(inject(function($controller) {
			var requestedResource = { title: 'title', url: 'url', source: 'source', verb: 'read' };
			httpBackend.expectPOST('/resources', requestedResource).respond(createdResource);
			httpBackend.expectPOST('/topics/100/resources', { resid: createdResource.id }).respond(200, {});
			$controller(AddResourceController, {$scope: scope});

			scope.topic = { id: 100, resources: [] };
			scope.title = requestedResource.title;
			scope.url = requestedResource.url;
			scope.source = requestedResource.source;
			scope.add();
			httpBackend.flush();
		}));

		it('creates a new resource and links it with the topic', function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('adds the resource to the topic\'s resource list in the scope', function() {
			expect(scope.topic.resources).toEqual([createdResource]);
		});

		it('clears the scope input fields', function() {
			expect(scope.title).toEqual('');
			expect(scope.url).toEqual('');
			expect(scope.source).toEqual('');
		});
	});

	describe('when url is submitted', function() {
		var url = 'http://url.to/check';

		describe('and a match is found in the system', function() {

			beforeEach(inject(function($controller) {
				var existingResource = { title: 'title', url: url, source: 'source', verb: 'read' };
				httpBackend.expectGET('/resources?url=http%3A%2F%2Furl.to%2Fcheck').respond([existingResource]);
				$controller(AddResourceController, {$scope: scope});
				scope.url = url;
				scope.submitUrl();
				httpBackend.flush();
			}));

			it('checks if the url is already in the system', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('fills in the detail fields if found', function() {
				expect(scope.title).toEqual('title');
				expect(scope.source).toEqual('source');
			});

			it('should set the urlSubmitted variable', function() {
				expect(scope.urlSubmitted).toEqual(true);
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

			it('checks if the url is already in the system', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('detail fields are undefined if not found', function() {
				expect(scope.title).toBe(null);
				expect(scope.source).toBe(null);
			});

			it('should set the urlSubmitted variable', function() {
				expect(scope.urlSubmitted).toEqual(true);
			});

			it('should set a status message', function() {
				expect(scope.statusMessage).toNotBe(undefined);
			});
		});
	});
});
