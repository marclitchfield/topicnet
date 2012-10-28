describe('NextTopicController', function() {

  var scope, httpBackend;
  var toTopic = { id: 2 }

  beforeEach(inject(function($rootScope, $httpBackend) {
    httpBackend = $httpBackend;
    scope = $rootScope.$new();
  }));

  describe('calling linkfn(toTopic)', function() {

    beforeEach(inject(function($controller) {
      scope.topic = { id: 1, next: [] }
      httpBackend.expectPOST(
        '/topics/' + scope.topic.id + '/next',
        { toid: toTopic.id }).respond(200,{});
      $controller(NextTopicController, {$scope: scope});
      scope.linkfn(toTopic); 
      httpBackend.flush();
    }));

    it('creates next relationship between scope.topic and toTopic', function() {
      httpBackend.verifyNoOutstandingExpectation();  
    });

    it("adds toTopic to scope.topic.next", function() {
      expect(scope.topic.next).toEqual([toTopic]);
    });

  });

  describe('calling removeLink(toTopic)', function() {

    beforeEach(inject(function($controller) {
      scope.topic = { id: 1, next: [toTopic] };
      httpBackend.expectDELETE(
        '/topics/' + scope.topic.id + '/next/' + toTopic.id).respond(200,{});
      $controller(NextTopicController, {$scope: scope});
      scope.removeLink(toTopic);
      httpBackend.flush();
    }));

    it('deletes the next relationship between scope.topic and toTopic', function() {
      httpBackend.verifyNoOutstandingExpectation();
    });

    it('removes toTopic from scope.topic.next', function() {
      expect(scope.topic.next).toEqual([]);
    });

  });

});
