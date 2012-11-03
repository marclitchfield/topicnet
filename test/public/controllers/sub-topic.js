describe('SubTopicController', function() {

	var scope, httpBackend;
	var toTopic = { id: 2 }

	beforeEach(inject(function($rootScope, $httpBackend) {
		httpBackend = $httpBackend;
		scope = $rootScope.$new();
	}));

	describe('calling linkfn(toTopic)', function() {

		beforeEach(inject(function($controller) {
			scope.topic = { id: 1, sub: [] }
			httpBackend.expectPOST(
				'/topics/' + scope.topic.id + '/sub',
				{ toid: toTopic.id }).respond(200,{});
			$controller(SubTopicController, {$scope: scope});
			scope.linkfn(toTopic); 
			httpBackend.flush();
		}));

		it('creates sub relationship between scope.topic and toTopic', function() {
			httpBackend.verifyNoOutstandingExpectation();  
		});

		it("adds toTopic to scope.topic.sub", function() {
			expect(scope.topic.sub).toEqual([toTopic]);
		});

	});

	describe('calling removeLink(toTopic)', function() {

		beforeEach(inject(function($controller) {
			scope.topic = { id: 1, sub: [toTopic] };
			httpBackend.expectDELETE(
				'/topics/' + scope.topic.id + '/sub/' + toTopic.id).respond(200,{});
			$controller(SubTopicController, {$scope: scope});
			scope.removeLink(toTopic);
			httpBackend.flush();
		}));

		it('deletes the sub relationship between scope.topic and toTopic', function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('removes toTopic from scope.topic.sub', function() {
			expect(scope.topic.sub).toEqual([]);
		});

	});

});
