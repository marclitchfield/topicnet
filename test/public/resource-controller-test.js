describe('ResourceController', function() {
	var scope, httpBackend;
	var resource = { id: 1, title: 'title', url: 'url', source: 'source' };

	beforeEach(inject(function($rootScope, $httpBackend) {
		scope = $rootScope.$new();
		httpBackend = $httpBackend;
	}));

	describe('when constructed with resourceId parameter', function() {
		beforeEach(inject(function($controller) {
			var params = { resourceId: resource.id };
			httpBackend.whenGET('/resources/1').respond(resource);
			$controller(ResourceController, { $scope: scope, $routeParams: params });
			httpBackend.flush();
		}));

		it('requests the resource from the server',  function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('stores the resources in scope', function() {
			expect(scope.resource).toEqual(resource);
		});
	});
});
