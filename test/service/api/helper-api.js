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

exports.postAndLinkTopics = function(relationshipType) {
	var response = {};
	return exports.postTopic()
	.then(function(res) {
		response.postTopic = res;
		return exports.postTopic();
	})
	.then(function(res) {
		response.postRelatedTopic = res;
		return exports.post('/topics/' + response.postTopic.returnedData.id + '/' + relationshipType,
			{ toid: response.postRelatedTopic.returnedData.id });
	})
	.then(function(res) {
		response.response = res;
		return response;
	});
};

exports.postAndLinkTopicAndResource = function() {
	var result = {};
	return exports.postTopic()
	.then(function(res) {
		result.postTopic = res;
		return exports.postResource();
	})
	.then(function(res) {
		result.postResource = res;
		return exports.post('/topics/' + result.postTopic.returnedData.id + '/resources',
			{ resid: result.postResource.returnedData.id });
	})
	.then(function(res) {
		result.response = res;
		return result;
	});
};

exports.postUserAndLogin = function() {

	function getUniqueEmail() {
		return guid.raw() + '@' + guid.raw() + '.com';
	}

	function getHashedPassword() {
		sha256 = crypto.createHash('sha256');
		sha256.update(guid.raw());
		return sha256.digest('hex');
	}

	var result = {};
	var userData = { email: getUniqueEmail(), password: getHashedPassword() };

	return api.post('/user', userData)
	.then(function(res) {
		result.postUser = res;
		return api.post('/login', userData);
	})
	.then(function(res) {
		return result;
	});
};