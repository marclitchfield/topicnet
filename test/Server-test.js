var assert = require('assert'),
	request = require('request'),
	vows = require('vows');

var api = {
	post: function(path, body, callback) {
		request({
			uri: 'http://localhost:5000' + path,
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' }
		}, callback);
	},
	get: function(path, callback) {
		request({
			uri: 'http://localhost:5000' + path,
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		}, callback);
	}
}; 
			

vows.describe('/topic').addBatch({
	'POST to /topic': {
		topic: function() { 
			api.post('/topic', { name: 'testnode' }, this.callback);
		},
		'returns status code 200 OK': function( err, res ) {
			assert.equal(res.statusCode, 200);
		},
		'responds with new topic object': {
			topic: function(res) { return JSON.parse(res.body); },

			'with a name': function( obj ) {
				assert.equal(obj.name, 'testnode');
			},
			'and a valid id': function( obj ) {
				assert.ok( obj.id > 0 );
			}
		}	
	},
	'POST to /topic with no name': {
		topic: function() {
			api.post('/topic', {}, this.callback);
		},
		'returns status code 500': function( err, res ) {
			assert.equal(res.statusCode, 500);
		},
		'responds with error message': function( err, res ) {
			assert.include(res.body, 'name is required');
		}
	}
}).export(module);
				
