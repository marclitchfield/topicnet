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

function assertStatus(code) {
    return function (e, res) {
        assert.equal (res.statusCode, code);
    };
}

vows.describe('/topics').addBatch({
	'POST with valid data': {
		topic: function() {
			api.post('/topics', { name: 'testnode' }, this.callback);
		},
		'returns status code 200 OK': assertStatus(200),
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
	'POST with no name': {
		topic: function() {
			api.post('/topics', {}, this.callback);
		},
		'returns status code 500': assertStatus(500),
		'responds with error message': function( err, res ) {
			assert.include(res.body, 'name is required');
		}
	},
	'GET with valid id': {
		topic: function() {
			var self = this;
			api.post('/topics', { name: 'testnode' }, function(err, res) {
				self.id = JSON.parse(res.body).id;
				api.get('/topics/' + self.id, self.callback);
			});
		},
		'returns status code 200 OK': assertStatus(200),
		'responds with existing topic object': {
			topic: function(res) {
				return JSON.parse(res.body);
			},
			'with the expected name': function(obj) {
				assert.equal(obj.name, 'testnode');
			},
			'with the specified id': function(obj) {
				assert.equal(obj.id, this.id);
			}
		}
	},
	'GET with invalid id: ': {
		topic: function() {
			api.get('/topics/-99999', this.callback);
		},
		'returns 404 not found': assertStatus(404)
	}
}).export(module);
