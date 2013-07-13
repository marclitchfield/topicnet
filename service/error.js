var _ = require('underscore'),
	Q = require('q');

exports.promise = function(data) {
	var error = new Error();

	if (typeof data === 'object') {
		_.extend(error, data);
	} else {
		error.message = data;
	}

	return Q.reject(error);
};