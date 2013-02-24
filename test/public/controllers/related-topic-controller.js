describe('RelatedTopicController', function() {

	var scope, httpBackend;
	var toTopic = { id: 2 };

	beforeEach(inject(function($rootScope, $httpBackend) {
		httpBackend = $httpBackend;
		scope = $rootScope.$new();
	}));

	describe('calling linkfn with toTopic', function() {

		beforeEach(inject(function($controller) {
			scope.rel = 'next';
			scope.topic = { id: 1, next: [] };
			httpBackend.expectPOST(
				'/topics/' + scope.topic.id + '/' + scope.rel,
				{ toid: toTopic.id }).respond(200,{});
			$controller(RelatedTopicController, {$scope: scope});
			scope.linkfn(toTopic);
			httpBackend.flush();
		}));

		it('should create relationship between scope.topic and toTopic', function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it("should add toTopic to scope.topic[rel]", function() {
			expect(scope.topic[scope.rel]).toEqual([toTopic]);
		});

	});

	describe('calling removeLink with toTopic', function() {

		beforeEach(inject(function($controller) {
			scope.topic = { id: 1, next: [toTopic] };
			scope.rel = 'next'
			httpBackend.expectDELETE(
				'/topics/' + scope.topic.id + '/' + scope.rel + '/' + toTopic.id).respond(200,{});
			$controller(RelatedTopicController, {$scope: scope});
			scope.removeLink(toTopic);
			httpBackend.flush();
		}));

		it('should delete the relationship between scope.topic and toTopic', function() {
			httpBackend.verifyNoOutstandingExpectation();
		});

		it('should remove toTopic from scope.topic[rel]', function() {
			expect(scope.topic[scope.rel]).toEqual([]);
		});

	});

	describe('related topic voting', function() {
		beforeEach(inject(function($controller) {
			scope.topic = { id: 1, next: [toTopic] };
			scope.rel = 'next'
			$controller(RelatedTopicController, {$scope: scope});
		}));

		describe('upvote a related topic', function() {
			beforeEach(inject(function($controller) {
				httpBackend.expectPOST('/topics/1/next/' + toTopic.id + '/vote', { dir: 'up' }).respond(200, { score: 1 });
				scope.upvote('next', toTopic);
				httpBackend.flush();
			}));

			it('should send vote to the server with direction "up"', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should set the score on the related topic', function() {
				expect(toTopic.score).toEqual(1);
			});
		});

		describe('downvote a related topic', function() {
			beforeEach(inject(function($controller) {
				httpBackend.expectPOST('/topics/1/next/' + toTopic.id + '/vote', { dir: 'down' }).respond(200, { score: -1 });
				scope.downvote('next', toTopic);
				httpBackend.flush();
			}));

			it('should send vote to the server with direction "down"', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should set the score on the related topic', function() {
				expect(toTopic.score).toEqual(-1);
			});
		});
	});
});
