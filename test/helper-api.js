var request = require('request');
var guid = require('guid');
var assert = require('assert');
var _ = require('underscore');
var Q = require('q');

exports.get = function(path, callback) {
	request({
		uri: 'http://localhost:5000' + path,
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	}, callback);
};

exports.getPromise = function(path) {
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

exports.post = function(path, body, callback) {
	request({
		uri: 'http://localhost:5000' + path,
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	}, callback);
};

exports.postPromise = function(path, body) {
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

exports.put = function(path, body, callback) {
	request({
		uri: 'http://localhost:5000' + path,
		method: 'PUT',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	}, callback);
};

exports.putPromise = function(path, body) {
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

exports.del = function(path, callback) {
	request({
		uri: 'http://localhost:5000' + path,
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' }
	}, callback);
};

exports.delPromise = function(path) {
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

		postTopicPromise: function() {
			var self = this;
			self.postedTopic = { name: 'Topic ' + guid.raw() };
			return exports.postPromise('/topics', self.postedTopic)
			.then(function(res) {
				self.response = res;
				self.returnedTopic = exports.parseBody(res.body);
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

		getTopicPromise: function(id) {
			var self = this;
			return exports.getPromise('/topics/' + id)
			.then(function(res) {
				self.response = res;
				self.returnedTopic = exports.parseBody(res.body);
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

		postResourcePromise: function() {
			var self = this;
			self.postedResource = { title: 'Resource ' + guid.raw(),
				url: 'http://example.com/UpperCase/' + guid.raw(),
				source: 'example.com',
				verb: 'read'
			};
			return exports.postPromise('/resources', self.postedResource)
			.then(function(res) {
				self.response = res;
				self.returnedResponse = exports.parseBody(res.body);
			});
		},

		getResource: function(id, callback) {
			var self = this;
			exports.get('/resources/' + id, function(err, res) {
				self.response = res;
				self.returnedResource = exports.parseBody(res.body);
				callback();
			});
		},

		getResourcePromise: function(id) {
			var self = this;
			return exports.getPromise('/resources/' + id)
			.then(function(res) {
				self.response = res;
				self.returnedResource = exports.parseBody(res.body);
			});
		}

	};

};

