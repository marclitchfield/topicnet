describe('RelatedTopicController', function() {
	beforeEach(module('topicnet.controllers'));

	describe('is a controller', function() {
		var scope, httpBackend;
		var toTopic = { id: 2 };

		beforeEach(inject(function($rootScope, $httpBackend) {
			httpBackend = $httpBackend;
			scope = $rootScope.$new();
		}));

		describe('links topics to other topics', function() {

			beforeEach(inject(function($controller) {
				scope.rel = 'next';
				scope.topic = { id: 1, next: [] };
				httpBackend.expectPOST(
					'/topics/' + scope.topic.id + '/' + scope.rel,
					{ toid: toTopic.id }).respond(200,{});
				$controller('RelatedTopicController', {$scope: scope});
				scope.linkfn(toTopic);
				httpBackend.flush();
			}));

			it('should create relationship between scope.topic and toTopic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should add toTopic to scope.topic[rel]', function() {
				expect(scope.topic[scope.rel]).toEqual([toTopic]);
			});

			it('should initialize the score to 0', function() {
				expect(toTopic.score).toEqual(0);
			});
		});

		describe('removes link between topics', function() {

			beforeEach(inject(function($controller) {
				scope.topic = { id: 1, next: [toTopic] };
				scope.rel = 'next';
				httpBackend.expectDELETE(
					'/topics/' + scope.topic.id + '/' + scope.rel + '/' + toTopic.id).respond(200,{});
				$controller('RelatedTopicController', {$scope: scope});
				scope.removeLink(toTopic);
				httpBackend.flush();
			}));

			it('should make an http DELETE call to the backend', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should vote down the removed topic', function() {
				
			});

			it('should remove the topic from the ui', function() {
				expect(scope.topic[scope.rel]).toEqual([]);
			});

		});
	});
});
