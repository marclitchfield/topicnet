var assert = require('assert'),
	request = require('request'),
	_ = require('underscore'),
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

vows.describe('REST service').addBatch({
	'POST to /topics': {
		'with valid data': {
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
		'with no name': {
			topic: function() {
				api.post('/topics', {}, this.callback);
			},
			'returns status code 500': assertStatus(500),
			'responds with error message': function( err, res ) {
				assert.include(res.body, 'name is required');
			}
		}
	},
	'GET /topics/:id': {
		'with valid id': {
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
		'with invalid id': {
			topic: function() {
				api.get('/topics/-99999', this.callback);
			},
			'returns 404 not found': assertStatus(404)
		}
	},
	'POST /topics/:id/root then calling GET /topics': {
		topic: function() {
			var self = this;
			api.post('/topics', { name: 'testnode' }, function(err, res) {
				var id = JSON.parse(res.body).id;
				assert.equal(200, res.statusCode);
				api.post('/topics/' + id + '/root', {}, function(err, res) {
					api.get('/topics', function(err, res) {
						self.callback (err, res, id);
					});
				});
			});
		},
		'returns 200 OK': assertStatus(200),
		'returns the topic': function(err, res, id) {
			var response = JSON.parse(res.body);
			assert.ok(_.any(response, function(t) {
				return t.id === id;
			}));
		}
	},
	// 'POST /topics/:fromid/:type': {
	// 	topic: function() {
	// 		var self = this;
	// 		api.post('/topics', { name: 'tonode'}, function(err, res) {
	// 			self.toid = JSON.parse(res.body).id;
	// 			api.post('/topics', { name: 'fromnode' }, function(err, res) {
	// 				self.fromid = self.toid = JSON.parse(res.body).id;
	// 				api.post('/topics/' + self.fromid + '/sub', { toid: self.toid }, self.callback);
	// 			});
	// 		});
	// 	},
	// 	'returns 200 OK': assertStatus(200)
	// },
	'GET /topics': {
		topic: function() {
			var self = this;
			api.post('/topics', { name: 'testnode' }, function(err, res) {
				self.id = JSON.parse(res.body).id;
				api.post('/topics/' + self.id + '/root', {}, function(err, res) {
					api.get('/topics', self.callback);
				});
			});
		},
		'returns 200 OK': assertStatus(200),
		'returns root node': {
			topic: function(res) {
				var self = this;
				var rootNodes = JSON.parse(res);
				return _.find(rootNodes, function(node) {
					return node.id === self.id;
				});
			},
			'with relationships': {
			}
		}
	}
}).export(module);
