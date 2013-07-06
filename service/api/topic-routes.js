var	handler = require('../handler'),
	Q = require('q');

module.exports = function(app, topicService) {

	function root(request, response) {
		if (request.query.q) {
			handler.complete(response, topicService.search(request.query));
		} else {
			handler.complete(response, topicService.getLinkedTopics(0, 'root'));
		}
	}

	function create(request, response) {
		handler.complete(response, topicService.create(request.body));
	}

	function update(request, response) {
		handler.complete(response, topicService.update(parseInt(request.params.id, 10), request.body));
	}

	function get(request, response) {
		handler.complete(response, topicService.get(parseInt(request.params.id, 10)));
	}

	function getLinkedTopics(request, response) {
		handler.complete(response, topicService.getLinkedTopics(parseInt(request.params.id, 10), request.params.rel));
	}

	function getLink(request, response) {
		handler.complete(response, topicService.getLink(parseInt(request.params.id, 10), parseInt(request.params.toid, 10), request.params.rel));
	}

	function linkRoot(request, response) {
		handler.complete(response, topicService.linkRoot(parseInt(request.params.id, 10)));
	}

	function linkResource(request, response) {
		handler.complete(response, topicService.linkResource(parseInt(request.params.id, 10), request.body.resid));
	}

	function unlinkResource(request, response, next) {
		handler.complete(response, topicService.unlinkResource(parseInt(request.params.id, 10), parseInt(request.params.resid, 10)));
	}

	function linkTopic(request, response) {
		handler.complete(response, topicService.linkTopic(parseInt(request.params.id, 10), parseInt(request.body.toid, 10), request.params.rel));
	}

	function unlinkRoot(request, response) {
		handler.complete(response, topicService.unlinkRoot(parseInt(request.params.id, 10)));
	}

	function unlinkRelated(request, response) {
		handler.complete(response, topicService.unlinkTopic(parseInt(request.params.id, 10), parseInt(request.params.toid, 10), request.params.rel));
	}

	function destroy(request, response) {
		handler.complete(response, topicService.destroy(parseInt(request.params.id, 10)));
	}

	function hideResource(request, response) {
		if (!request.user) {
			handler.complete(response, Q.reject({ name: 'noauth', message:'not authenticated' }));
		} else {
			handler.complete(response, topicService.hideResource(parseInt(request.params.id, 10), parseInt(request.params.resid, 10), request.user.id));
		}
	}

	app.get('/topics', root);
	app.post('/topics', create);
	app.put('/topics/:id', update);
	app.get('/topics/:id', get);
	app.get('/topics/:id/:rel', getLinkedTopics);
	app.get('/topics/:id/:rel/:toid', getLink);
	app.post('/topics/:id/root', linkRoot);
	app.post('/topics/:id/resources', linkResource);
	app['delete']('/topics/:id/resources/:resid', unlinkResource);
	app.post('/topics/:id/:rel', linkTopic);
	app.post('/topics/:id/resources/:resid/hide', hideResource);
	app['delete']('/topics/:id/root', unlinkRoot);
	app['delete']('/topics/:id/:rel/:toid', unlinkRelated);
	app['delete']('/topics/:id', destroy);
};