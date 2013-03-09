var request = require('request');
var guid = require('guid');
var assert = require('assert');
var _ = require('underscore');
var Q = require('q');

exports.get = function(path) {
	var deferred = Q.defer();
	request({
		uri: 'http://localhost:5000' + path,
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	}, deferred.makeNodeResolver());
	return deferred.promise
	.then(function(res) {
		return res[0];
	});
};

exports.post = function(path, body) {
	var deferred = Q.defer();
	request({
		uri: 'http://localhost:5000' + path,
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	}, deferred.makeNodeResolver());
	return deferred.promise
	.then(function(res) {
		return res[0];
	});
};

exports.put = function(path, body) {
	var deferred = Q.defer();	
	request({
		uri: 'http://localhost:5000' + path,
		method: 'PUT',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	}, deferred.makeNodeResolver());
	return deferred.promise
	.then(function(res) {
		return res[0];
	});
};

exports.del = function(path) {
	var deferred = Q.defer();
	request({
		uri: 'http://localhost:5000' + path,
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' }
	}, deferred.makeNodeResolver());
	return deferred.promise
	.then(function(res) {
		return res[0];
	});
};

exports.parseBody = function(body) {
	try {
		return JSON.parse(body);
	} catch(e) {
		throw new Error(body);
	}
};

exports.postTopic = function() {
	var response = {};
	response.postedData = { name: 'Topic ' + guid.raw() };
	return exports.post('/topics', response.postedData)
	.then(function(res) {
		response.response = res;
		response.returnedData = exports.parseBody(res.body);
		return response;
	});
};

exports.getTopic = function(id) {
	var response = {};
	return exports.get('/topics/' + id)
	.then(function(res) {
		response.response = res;
		response.returnedData = exports.parseBody(res.body);
		return response;
	});
};

exports.postResource = function() {
	var response = {};
	response.postedData = { title: 'Resource ' + guid.raw(),
		url: 'http://example.com/UpperCase/' + guid.raw(),
		source: 'example.com',
		verb: 'read'
	};
	return exports.post('/resources', response.postedData)
	.then(function(res) {
		response.response = res;
		response.returnedData = exports.parseBody(res.body);
		return response;
	});
};

exports.getResource = function(id) {
	var response = {};
	return exports.get('/resources/' + id)
	.then(function(res) {
		response.response = res;
		response.returnedData = exports.parseBody(res.body);
		return response;
	});
};

exports.request = function() {

	return {

		postTopic: function() {
			var self = this;
			self.postedTopic = { name: 'Topic ' + guid.raw() };
			return exports.post('/topics', self.postedTopic)
			.then(function(res) {
				self.response = res;
				self.returnedTopic = exports.parseBody(res.body);
			});
		},

		getTopic: function(id) {
			var self = this;
			return exports.get('/topics/' + id)
			.then(function(res) {
				self.response = res;
				self.returnedTopic = exports.parseBody(res.body);
			});
		},

		postResource: function() {
			var self = this;
			self.postedResource = { title: 'Resource ' + guid.raw(),
				url: 'http://example.com/UpperCase/' + guid.raw(),
				source: 'example.com',
				verb: 'read'
			};
			return exports.post('/resources', self.postedResource)
			.then(function(res) {
				self.response = res;
				self.returnedResource = exports.parseBody(res.body);
			});
		},

		getResource: function(id) {
			var self = this;
			return exports.get('/resources/' + id)
			.then(function(res) {
				self.response = res;
				self.returnedResource = exports.parseBody(res.body);
			});
		}

	};

};

