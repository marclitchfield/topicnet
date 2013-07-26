var	handler = require('../handler');

module.exports = function(app, resourceService) {
	function create(request, response) {
		handler.complete(response, resourceService.create(request.body));
	}

	function get(request, response) {
		handler.complete(response, resourceService.get(parseInt(request.params.id, 10)));
	}

	function search(request, response) {
		if (request.query.title) {
			handler.complete(response, resourceService.searchByTitle(request.query.title));
		} else if(request.query.url) {
			handler.complete(response, resourceService.searchByUrl(request.query.url));
		} else if(request.query.q) {
			handler.complete(response, resourceService.search(request.query));
		} else {
			response.send(404);
		}
	}

	function update(request, response) {
		handler.complete(response, resourceService.update(parseInt(request.params.id, 10), request.body));
	}

	function destroy(request, response) {
		handler.complete(response, resourceService.destroy(parseInt(request.params.id, 10)));
	}

	app.get('/resources', search);
	app.get('/resources/:id', get);
	app.post('/resources', create);
	app.put('/resources/:id', update);
	app['delete']('/resources/:id', destroy);
};