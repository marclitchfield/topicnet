var request = require('request');
var guid = require('guid');

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

exports.del = function(path, callback) {
	request({
		uri: 'http://localhost:5000' + path,
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' }
	}, callback);
};

exports.request = function() {

	return {

		postTopic: function(callback) {
			var self = this;
			self.postedTopic = { name: 'topic ' + guid.raw() };
			exports.post('/topics', self.postedTopic, function(err, res) {
				self.response = res;
				self.returnedTopic = JSON.parse(res.body);
				callback();
			});
		},

		getTopic: function(id, callback) {
			var self = this;
			exports.get('/topics/' + id, function(err, res) {
				self.response = res;
				self.returnedTopic = JSON.parse(res.body);
				callback();
			});
		},

		postResource: function(callback) {
			var self = this;
			self.postedResource = { title: 'resource ' + guid.raw(), 
				url: 'http://example.com/' + guid.raw(),
				source: 'example.com',
				verb: 'read'
			};
			exports.post('/resources', self.postedResource, 
				function(err, res) {
				self.response = res;
				self.returnedResource = JSON.parse(res.body);
				callback();
			});
		},

		getResource: function(id, callback) {
			var self = this;
			exports.get('/resources/' + id, function(err, res) {
				self.response = res;
				self.returnedResource = JSON.parse(res.body);
				callback();
			});
		}

	};

};

