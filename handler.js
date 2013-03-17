function successHandler(response, result) {
	if (result === undefined) {
		response.send(200);
	} else {
		response.json(result);
	}
};

function errorHandler(response, error) {
	var statusCodes = {
		'notfound': 404,
		'duplicate': 400
	};

	response.send(error.message || error, statusCodes[error.name] || 500);
};

exports.complete = function(response, promise) {
	promise.then(function(result) { successHandler(response, result); })
		.fail(function(error) { errorHandler(response, error); })
		.done();
};
