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
		}));

		it('gets the root topics and stores them in scope', function() {
			httpBackend.flush();
			expect(scope.rootTopics).toEqual(rootTopics);
		});
	});

	describe('link function', function() {
		var topic = { id: 1, name: 'topic' };

		beforeEach(inject(function($controller) {
			httpBackend.expectGET('/topics').respond([]);
			httpBackend.expectPOST('/topics/1/root').respond(200, {});
			$controller(RootController, {$scope: scope});
			scope.linkfn(topic);
		}));

		it('makes the topic a root topic', function() {
			httpBackend.flush();
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('adds the topic to the rootTopics list', function() {
			httpBackend.flush();
			expect(scope.rootTopics).toEqual([topic]);
		});
	});

	describe('removeRoot', function() {
		var topic = { id: 1, name: 'topic' };

		beforeEach(inject(function($controller) {
			httpBackend.expectGET('/topics').respond([topic]);
			httpBackend.expect('DELETE', '/topics/1/root').respond(200, {});
			$controller(RootController, {$scope: scope});
			scope.removeRoot(topic);
		}));

		it('deletes the root-topic relationship', function() {
			httpBackend.flush();
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('removes the topic from the rootTopics list', function() {
			httpBackend.flush();
			expect(scope.rootTopics).toEqual([]);
		});
	});
});
