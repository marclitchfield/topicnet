describe('ResourceDetailController', function() {
	var scope, httpBackend;
	var resource = { id: 1, title: 'title', url: 'url', source: 'source' };

	beforeEach(inject(function($rootScope, $httpBackend) {
		scope = $rootScope.$new();
		httpBackend = $httpBackend;
	}));

	describe('when constructed with resourceId parameter', function() {
		beforeEach(inject(function($controller) {
			var params = { resourceId: resource.id };
			httpBackend.expectGET('/resources/1').respond(resource);
			$controller(ResourceDetailController, { $scope: scope, $routeParams: params });
			httpBackend.flush();
		}));

		it('should request the resource from the server',  function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('should store the resources in scope', function() {
			expect(scope.resource).toEqual(resource);
		});
	});
});
