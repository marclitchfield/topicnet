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

function postSubtopic(res, obj) {
	var self = this;
	api.post('/topics', { name: 'subtopic' }, function(err, res) {
		var sub = JSON.parse(res.body);
		api.post('/topics/' + obj.id + '/sub', { toid: sub.id }, function(err, res) {
			self.callback(err, res, obj, sub);
		});
	});
}

vows.describe('REST service').addBatch({
	'POST to /topics': {
		'with no name': {
			topic: function() {
				api.post('/topics', {}, this.callback);
			},
			'returns 500 server error': assertStatus(500),
			'returns error message': function( err, res ) {
				assert.include(res.body, 'name is required');
			}
		},
		'with valid data': {
			topic: function() {
				var self = this;
				api.post('/topics', { name: 'testnode' }, function(err, res) {
					self.callback(err, res, JSON.parse(res.body));
				});
			},
			'returns 200 OK': assertStatus(200),
			'returns new topic object': {
				'with a name': function(res, obj) {
					assert.equal(obj.name, 'testnode');
				},
				'and a valid id': function(res, obj) {
					assert.ok( obj.id > 0 );
				}
			},

			'. then GET /topics/:id': {
				'with invalid id': {
					topic: function() {
						api.get('/topics/-99999', this.callback);
					},
					'returns 404 not found': assertStatus(404)
				},
				'with valid id': {
					topic: function(res, obj) {
						var self = this;
						api.get('/topics/' + obj.id, function(err, res) {
							self.callback(err, res, obj.id);
						});
					},
					'returns 200 OK': assertStatus(200),
					'returns existing topic': {
						topic: function(res, id) {
							this.callback(JSON.parse(res.body), id);
						},
						'with the expected name': function(obj, id) {
							assert.equal(obj.name, 'testnode');
						},
						'with the specified id': function(obj, id) {
							assert.equal(obj.id, id);
						}
					}
				}
			},

			'. then POST /topics/:id/root': {
				topic: function(res, obj) {
					var self = this;
					api.post('/topics/' + obj.id + '/root', {}, function(err, res) {
						self.callback(err, res, obj);
					});
				},
				'returns 200 OK': assertStatus(200),
				'. then GET /topics': {
					topic: function(res, obj) {
						var self = this;
						api.get('/topics', function(err, res) {
							self.callback (err, res, obj.id);
						});
					},
					'returns 200 OK': assertStatus(200),
					'returns all root topics, including our topic': function(err, res, id) {
						var rootTopics = JSON.parse(res.body);
						assert.ok(_.any(rootTopics, function(t) {
							return t.id === id;
						}));
					}
				},
				'. then POST /topics/:id/:rel with a subtopic': {
					topic: postSubtopic,
					'. then GET /topics': {
						topic: function(res, obj, sub) {
							var self = this;
							api.get('/topics', function(err, res) {
								self.callback (err, res, obj.id, sub.id);
							});
						},
						'returns 200 OK': assertStatus(200),
						'returns root topics with links to subtopics': function(err, res, id, subtopicId) {
							var rootTopics = JSON.parse(res.body);
							var ourTopic = _.find(rootTopics, function(t) { return t.id === id; });
							assert.ok(ourTopic.sub);
							assert.include(ourTopic.sub, subtopicId);
						}
					}
				}
			},

			'. then POST /topics/:id/:rel with a subtopic': {
				topic: postSubtopic,
				'. then GET /topics/:id/:rel': {
					topic: function(res, obj, sub) {
						var self = this;
						api.get('/topics/' + obj.id + '/sub', function(err, res) {
							self.callback(err, res, obj, sub);
						});
					},
					'returns 200 OK': assertStatus(200),
					'returns the subtopic': function(err, res, obj, sub) {
						var self = this;
						var subTopics = JSON.parse(res.body);
						assert.ok(_.any(subTopics, function(t) {
							return t.id === sub.id;
						}));
					}
				},
				'. then GET /topics/:id': {
					topic: function(res, obj, sub) {
						var self = this;
						api.get('/topics/' + obj.id, function(err, res) {
							self.callback(err, res, sub.id);
						});
					},
					'returns 200 OK': assertStatus(200),
					'returns a link to the subtopic': function(err, res, subtopicId) {
						var topic = JSON.parse(res.body);
						assert.ok(topic.sub);
						assert.include(topic.sub, subtopicId);
					}
				},
				'. then POST /topics/:id/:rel with a sub-subtopic': {
					topic: function(res, obj, sub) {
						var self = this;
						api.post('/topics', { name: 'subsubtopic' }, function(err, res) {
							var subsub = JSON.parse(res.body);
							api.post('/topics/' + sub.id + '/sub', { toid: subsub.id }, function(err, res) {
								self.callback(err, res, obj, sub, subsub);
							});
						});
					},
					'returns 200 OK': assertStatus(200),
					'. then GET /topics/:id/:rel': {
						topic: function(res, obj, sub, subsub) {
							var self = this;
							api.get('/topics/' + obj.id + '/sub', function(err, res) {
								self.callback(err, res, sub.id, subsub.id);
							});
						},
						'returns 200 OK': assertStatus(200),
						'returns subtopics with link to the sub-subtopic': function(err, res, subtopicId, subsubtopicId) {
							var subtopics = JSON.parse(res.body);
							var ourSubtopic = _.find(subtopics, function(t) { return t.id === subtopicId; });
							assert.ok(ourSubtopic.sub);
							assert.include(ourSubtopic.sub, subsubtopicId);
						}
					}
				}
			}
		}
	},
	'POST /topics/:id/:rel with an invalid relationship': {
		topic: function() {
			var self = this;
			api.post('/topics/1/invalid', { toid: 2 }, self.callback);
		},
		'returns 500 server error': assertStatus(500),
		'returns error message': function(err, res) {
			assert.include(res.body, 'invalid relationship');
		}
	},
	'GET /topics/:id/:rel': {
		'with an invalid relationship': {
			topic: function() {
				var self = this;
				api.get('/topics/1/invalid', self.callback);
			},
			'returns 500 server error': assertStatus(500),
			'returns error message': function(err, res) {
				assert.include(res.body, 'invalid relationship');
			}
		},
		'with an invalid id': {
			topic: function() {
				var self = this;
				api.get('/topics/-9999999/sub', self.callback);
			},
			'returns 404 not found': assertStatus(404)
		}
	}
}).export(module);
