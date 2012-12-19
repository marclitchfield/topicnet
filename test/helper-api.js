var request = require('request');
var guid = require('guid');
var assert = require('assert');
var _ = require('underscore');

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

exports.parseBody = function(body) {
	try {
		return JSON.parse(body);
	} catch(e) {
		throw new Error(body);
	}
}

exports.request = function() {

	return {

		postTopic: function(callback) {
			var self = this;
			self.postedTopic = { name: 'Topic ' + guid.raw() };
			exports.post('/topics', self.postedTopic, function(err, res) {
				self.response = res;
				self.returnedTopic = exports.parseBody(res.body);
				callback();
			});
		},

		getTopic: function(id, callback) {
			var self = this;
			exports.get('/topics/' + id, function(err, res) {
				self.response = res;
				self.returnedTopic = exports.parseBody(res.body);
				callback();
			});
		},

		postResource: function(callback) {
			var self = this;
			self.postedResource = { title: 'Resource ' + guid.raw(),
				url: 'http://example.com/UpperCase/' + guid.raw(),
				source: 'example.com',
				verb: 'read'
			};
			exports.post('/resources', self.postedResource,
				function(err, res) {
				self.response = res;
				self.returnedResource = exports.parseBody(res.body);
				callback();
			});
		},

		getResource: function(id, callback) {
			var self = this;
			exports.get('/resources/' + id, function(err, res) {
				self.response = res;
				self.returnedResource = exports.parseBody(res.body);
				callback();
			});
		}

	};

};

