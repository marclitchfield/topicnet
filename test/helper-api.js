var request = require('request');
var guid = require('guid');
var assert = require('assert');
var _ = require('underscore');
var Q = require('q');

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

		postTopicPromise: function() {
			var self = this;
			self.postedTopic = { name: 'Topic ' + guid.raw() };
			return exports.postPromise('/topics', self.postedTopic)
			.then(function(res) {
				self.response = res;
				self.returnedTopic = exports.parseBody(res.body);
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
				self.returnedResource = exports.parseBody(res.body);
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

