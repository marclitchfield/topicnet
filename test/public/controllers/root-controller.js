describe('RootController', function() {
	var scope, httpBackend;

	beforeEach(inject(function($rootScope, $httpBackend) {
		scope = $rootScope.$new();
		httpBackend = $httpBackend;
	}));

	describe('when constructed', function() {
		var rootTopics;

		beforeEach(inject(function($controller) {
			rootTopics = [{name:'topic1', id:1}, {name:'topic2', id:2}];
			httpBackend.expectGET('/topics').respond(rootTopics);
			controller = $controller(RootController, {$scope: scope});
			httpBackend.flush();
		}));

		it('should get the root topics and store them in scope', function() {
			expect(scope.rootTopics).toEqual(rootTopics);
		});
	});

	describe('when link function is called', function() {
		var topic = { id: 1, name: 'topic' };

		beforeEach(inject(function($controller) {
			httpBackend.expectGET('/topics').respond([]);
			httpBackend.expectPOST('/topics/1/root').respond(200, {});
			$controller(RootController, {$scope: scope});
			scope.linkfn(topic);
			httpBackend.flush();
		}));

		it('should make the topic a root topic', function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('should add the topic to the rootTopics list', function() {
			expect(scope.rootTopics).toEqual([topic]);
		});
	});

	describe('when removeRoot is called', function() {
		var topic = { id: 1, name: 'topic' };

		beforeEach(inject(function($controller) {
			httpBackend.expectGET('/topics').respond([topic]);
			httpBackend.expectDELETE('/topics/1/root').respond(200, {});
			$controller(RootController, {$scope: scope});
			scope.removeRoot(topic);
			httpBackend.flush();
		}));

		it('should delete the root-topic relationship', function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('should remove the topic from the rootTopics list', function() {
			expect(scope.rootTopics).toEqual([]);
		});
	});
});
