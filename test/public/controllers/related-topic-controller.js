describe('RelatedTopicController', function() {
	beforeEach(module('topicnet.controllers'));

	describe('is a controller', function() {
		var scope, httpBackend;
		var relTopic = { id: 2 };

		beforeEach(inject(function($rootScope, $httpBackend, $controller) {
			httpBackend = $httpBackend;
			scope = $rootScope.$new();
		}));

		describe('links topics to other topics', function() {

			beforeEach(inject(function($controller) {
				scope.rel = 'next';
				scope.topic = { id: 1, next: [] };
				httpBackend.expectPOST(
					'/topics/' + scope.topic.id + '/' + scope.rel,
					{ toid: relTopic.id }).respond(200,{});
				$controller('RelatedTopicController', {$scope: scope});
				scope.linkfn(relTopic);
				httpBackend.flush();
			}));

			it('should create relationship between scope.topic and relTopic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should add relTopic to scope.topic[rel]', function() {
				expect(scope.topic[scope.rel]).toEqual([relTopic]);
			});

			it('should initialize the score to 0', function() {
				expect(relTopic.score).toEqual(0);
			});
		});

		describe('when a related topic is removed', function() {

			beforeEach(inject(function($controller) {
				scope.topic = { id: 1, next: [relTopic] };
				scope.rel = 'next';
				httpBackend.expectPOST(
					'/topics/' + scope.topic.id + '/' + scope.rel + '/' + relTopic.id + '/hide').respond(200,{});
				$controller('RelatedTopicController', {$scope: scope});
				scope.hideTopic(relTopic, scope.rel);
				httpBackend.flush();
			}));

			it('should tell the server to hide the topic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should remove the topic from the related topic list', function() {
				expect(scope.topic[scope.rel]).toEqual([]);
			});
		});

		describe('when a topic is dragged onto another related topic', function() {
			var toTopic = {id: 999};

			beforeEach(inject(function($controller) {
				scope.topic = { id: 1, next: [relTopic] };
				scope.rel = 'next';
				httpBackend.expectPOST(
					'/topics/' + scope.topic.id + '/' + scope.rel + '/' + relTopic.id + '/hide').respond(200,{});
				httpBackend.expectPOST(
					'/topics/' + relTopic.id + '/' + scope.rel + '/' + toTopic.id + '/affirm').respond(200,{});
				$controller('RelatedTopicController', {$scope: scope});
				scope.moveTopic(relTopic, scope.rel, toTopic);
				httpBackend.flush();
			}));

			it('should tell the server to hide the topic and affirm the related topic', function() {
				httpBackend.verifyNoOutstandingExpectation();
			});

			it('should remove the topic from the related topic list' ,function() {
				expect(scope.topic[scope.rel]).toEqual([]);
			});
		});
	});
});
