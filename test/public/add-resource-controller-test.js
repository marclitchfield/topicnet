describe('AddResourceController', function() {
	var scope, httpBackend;

	beforeEach(inject(function($rootScope, $httpBackend) {
		scope = $rootScope.$new();
		httpBackend = $httpBackend;
	}));

	describe('when add is called', function() {
		var createdResource = { id: 1, title: 'title', url: 'url', source: 'source' };

		beforeEach(inject(function($controller) {
			var requestedResource = { title: 'title', url: 'url', source: 'source' };
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
});
