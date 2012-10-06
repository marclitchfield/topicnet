var request = require('request');

exports.get = function(path, callback) {
	request({
		uri: 'http://localhost:5000' + path,
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	}, callback);
};

exports.post = function(path, body, callback) {
	request({
		uri: 'http://localhost:5000' + path,
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	}, callback);
};

exports.put = function(path, body, callback) {
	request({
		uri: 'http://localhost:5000' + path,
		method: 'PUT',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	}, callback);
};

exports.del = function(path, body, callback) {
	request({
		uri: 'http://localhost:5000' + path,
		method: 'DELETE',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	}, callback);
};

exports.request = function() {

	return {

		postTopic: function(callback) {
			var self = this;
			exports.post('/topics', { name: 'testnode' }, function(err, res) {
				self.response = res;
				self.topic = JSON.parse(res.body);
				callback();
			});
		},

		getTopic: function(id, callback) {
			var self = this;
			exports.get('/topics/' + id, function(err, res) {
				self.response = res;
				self.topic = JSON.parse(res.body);
				callback();
			});
		}

	};

};

