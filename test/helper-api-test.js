var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');

describe('Test Helper', function() {

	describe('postTopic', function() {
	
		var response;
		
		before(function(done) {
			api.postTopic()
			.then(function(res) {
				response = res;
				done();
			})
			.done();
		});		

		it('returns a promise whose value is an object', function() {
			assert.ok(typeof response === 'object');		
		});	
		
		describe('and the returned object', function() {

			it('has a postedData attribute with expected values', function() {
				assert.notEqual(response.postedData, undefined);
				assert.notEqual(response.postedData.name, undefined);
			});

			it('has a response attribute with expected values', function() {
				assert.notEqual(response.response, undefined);
				assert.equal(response.response.statusCode, 200);
			});

			it('has a returnedData attribute with expected values', function() {
				assert.notEqual(response.returnedData, undefined);
				assert.ok(response.returnedData.id > 0);
				assert.notEqual(response.returnedData.name, undefined);
			});
			
		});	
	
	});

	describe('getTopic', function() {
		
		var postedData;
		var response;

		before(function(done) {
			api.postTopic()
			.then(function(res) {
				postedData = res.returnedData;
				return api.getTopic(postedData.id);
			})
			.then(function(res) {
				response = res;
				done();
			})
			.done();
		});

		it('returns a promise whose value is an object', function() {
			assert.ok(typeof response == 'object');
		});

		describe('and the returned object', function() {

			it('has a response attribute with expected values', function() {
				assert.notEqual(response.response, undefined);
				assert.equal(response.response.statusCode, 200);
				assert.notEqual(response.response.body, undefined);
			});

			it('has a returnedData attribute with expected values', function() {
				assert.notEqual(response.returnedData, undefined);
				assert.equal(response.returnedData.id, postedData.id);
				assert.equal(response.returnedData.name, postedData.name);
			});

		});

	});

	describe('postResource', function() {
		
		var response;
		
		before(function(done) {
			api.postResource()
			.then(function(res) {
				response = res;
				done();
			})
			.done();
		});		

		it('returns a promise whose value is an object', function() {
			assert.ok(typeof response === 'object');		
		});	
		
		describe('and the returned object', function() {

			it('has a postedData attribute with expected values', function() {
				assert.notEqual(response.postedData, undefined);
				assert.notEqual(response.postedData.title, undefined);
			});

			it('has a response attribute with expected values', function() {
				assert.notEqual(response.response, undefined);
				assert.equal(response.response.statusCode, 200);
			});

			it('has a returnedData attribute with expected values', function() {
				assert.notEqual(response.returnedData, undefined);
				assert.ok(response.returnedData.id > 0);
				assert.notEqual(response.returnedData.title, undefined);
			});
			
		});	
		
	});
		
	describe('getResource', function() {
		
		var postedData;
		var response;

		before(function(done) {
			api.postResource()
			.then(function(res) {
				postedData = res.returnedData;
				return api.getResource(postedData.id);
			})
			.then(function(res) {
				response = res;
				done();
			})
			.done();
		});

		it('returns a promise whose value is an object', function() {
			assert.ok(typeof response == 'object');
		});

		describe('and the returned object', function() {

			it('has a response attribute with expected values', function() {
				assert.notEqual(response.response, undefined);
				assert.equal(response.response.statusCode, 200);
				assert.notEqual(response.response.body, undefined);
			});

			it('has a returnedData attribute with expected values', function() {
				assert.notEqual(response.returnedData, undefined);
				assert.equal(response.returnedData.id, postedData.id);
				assert.equal(response.returnedData.title, postedData.title);
			});

		});

	});

});
