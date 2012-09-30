var assert = require('assert');
var request = require('request');
var _ = require('underscore');

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
	},
	del: function(path, body, callback) {
		request({
			uri: 'http://localhost:5000' + path,
			method: 'DELETE',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' }
		}, callback);
	},
	request: function() {
		return {
			postTopic: function(callback) {
				var self = this;
				api.post('/topics', { name: 'testnode' }, function(err, res) {
					self.response = res;
					self.topic = JSON.parse(res.body);
					callback();
				});
			},
			getTopic: function(id, callback) {
				var self = this;
				api.get('/topics/' + id, function(err, res) {
					self.response = res;
					self.topic = JSON.parse(res.body);
					callback();
				});
			}
		}
	}
};

describe('Artoplasm REST Service', function() {

	describe('POST to /topics with no name', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/topics', {}, function(err, res) {
				assert.equal(500, res.statusCode);
				assert.notEqual(-1, res.body.indexOf('name is required'));
				done();
			});
		})
	})

	describe('POST to /topics with valid data', function() {

		var r = api.request();

		before(function(done) {
			r.postTopic(done);
		})

		it('returns status 200', function() {
			assert.equal(r.response.statusCode, 200);
		})

		it('returns new topic with the name specified', function() {
			assert.equal(r.topic.name, 'testnode');
		})

		it('returns new topic with a valid generated id', function() {
			assert.ok(r.topic.id > 0);
		})

	})

	describe('GET /topics/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.get('/topics/-99999', function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
			});
		})

	})

	describe('GET /topics/:id with valid id', function() {
		
		var p = api.request();
		var g = api.request();
	
		before(function(done) {
			p.postTopic(function() {
				g.getTopic(p.topic.id, done);
			});
		})

		it('returns status 200', function() {
			assert.equal(g.response.statusCode, 200);
		})

		it('returns existing topic with the expected name', function() {
			assert.equal(g.topic.name, 'testnode');
		})

		it('returns existing topic with the expected id', function() {
			assert.equal(g.topic.id, p.topic.id);
		})

	})


	describe('GET /topics?q=search', function() {
		var p = api.request();
		var searchResults;

		before(function(done) {
			p.postTopic(function() {
				api.get('/topics?q=' + p.topic.name, function(err, res) {
					searchResults = JSON.parse(res.body);
					done();
				});
			})
		})

		it('returns existing topic', function() {
			assert.ok(_.any(searchResults, function(t) {
				return t.id === p.topic.id;
			}));
		})
	})


	describe('POST /topics/:id/root', function() {

		var p = api.request();
		var rootResponse;

		before(function(done) {
			p.postTopic(function() {
				api.post('/topics/' + p.topic.id + '/root', {}, function(err, res) {
					rootResponse = res;
					done();
				});
			});
		})

		it('returns status 200', function() {
			assert.equal(rootResponse.statusCode, 200);
		})

		describe('then GET /topics', function() {

			var rootTopicsResponse;

			before(function(done) {
				api.get('/topics', function(err, res) {
					rootTopicsResponse = res;
					done();
				});
			})

			it('returns status 200', function() {
				assert.equal(rootTopicsResponse.statusCode, 200);
			})

			it('returns all root topics including our topic', function() {
				var rootTopics = JSON.parse(rootTopicsResponse.body);
				assert.ok(_.any(rootTopics, function(t) {
					return t.id === p.topic.id;
				}));
			})

		})

	})

	describe('POST /topics/:id/sub', function() {

		var postParent = api.request();
		var postChild = api.request();
		var makeSubResponse;

		before(function(done) {
			postParent.postTopic(function() {
				postChild.postTopic(function() {
					api.post('/topics/' + postParent.topic.id + '/sub',
						{ toid: postChild.topic.id }, function(err, res) {
						makeSubResponse = res;
						done();
					});
				});
			});
		})

		it('returns status 200', function() {
			assert.equal(makeSubResponse.statusCode, 200);
		})

		describe('then GET /topics/:id/sub', function() {

			var getSubResponse;		
	
			before(function(done) {
				api.get('/topics/' + postParent.topic.id + '/sub', function(err, res) {
					getSubResponse = res;
					done();
				});
			})

			it('returns status 200', function() {
				assert.equal(getSubResponse.statusCode, 200);
			})

			it('returns the subtopic', function() {
				var returnedTopics = JSON.parse(getSubResponse.body);
				assert.ok(_.any(returnedTopics, function(t) {
					return t.id === postChild.topic.id;
				}));
			})

		})

		describe('then POST a duplicate subtopic to /topics/:id/sub', function() {
			var duplicateResponse;

			before(function(done) {
				api.post('/topics/' + postParent.topic.id + '/sub',
					{ toid: postChild.topic.id }, function(err, res) {
					duplicateResponse = res;
					done();
				});
			})

			it('returns status 400', function() {
				assert.equal(duplicateResponse.statusCode, 400);
			})

			it('returns error message', function() {
				assert.notEqual(-1, duplicateResponse.body.indexOf('Relationship \'sub\' already exists'));
			})
		})

	})

	describe('POST /topics/:id/next', function() {

		var postPrev = api.request();
		var postNext = api.request();
		var makeNextResponse;

		before(function(done) {
			postPrev.postTopic(function() {
				postNext.postTopic(function() {
					api.post('/topics/' + postPrev.topic.id + '/next',
						{ toid: postNext.topic.id }, function(err, res) {
						makeNextResponse = res;
						done();
					});
				});
			});
		})

		it('returns status 200', function() {
			assert.equal(makeNextResponse.statusCode, 200);
		})

		describe('then GET /topics/:id/next', function() {

			var getNextResponse;		
	
			before(function(done) {
				api.get('/topics/' + postPrev.topic.id + '/next', function(err, res) {
					getNextResponse = res;
					done();
				});
			})

			it('returns status 200', function() {
				assert.equal(getNextResponse.statusCode, 200);
			})

			it('returns the next topic', function() {
				var returnedTopics = JSON.parse(getNextResponse.body);
				assert.ok(_.any(returnedTopics, function(t) {
					return t.id === postNext.topic.id;
				}));
			})

		})

	})

	describe('POST /topics/:id/:rel with an invalid relationship', function() {
		
		var r;

		before(function(done) {
			api.post('/topics/1/invalid', { toid: 2 }, function(err, res) {
				r = res;
				done();
			});
		})

		it('returns status 500', function() {
			assert.equal(r.statusCode, 500);
		})

		it('returns error message', function() {
			assert.notEqual(-1, r.body.indexOf('invalid relationship'));
		})

	})

	describe('POST /topics/:id/:rel with an invalid id', function() {

		it('returns status 404', function(done) {
			api.get('/topics/-9999999/sub', function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
			});
		})

	})

	describe('DELETE /topics/:id/sub with an invalid id', function() {

		it('returns status 404', function(done) {
			api.del('/topics/-9999999/sub', { toid: 1 }, function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
			});
		})

	}) 

	describe('DELETE /topics/:id/sub with an invalid toid', function() {

		var post = api.request();

		before(function(done) {
			post.postTopic(done);
		})

		it('returns status 404', function(done) {
			api.del('/topics/' + post.topic.id + '/sub', { toid: -9999999 }, function(err, res) {
				assert.equal(res.statusCode, 404);
				done();
			});
		})

	})

	describe('DELETE /topics/:id/:rel with an invalid relationship type', function() {

		var post = api.request();
		
		before(function(done) {
			post.postTopic(done);
		})

		it('returns status 500', function(done) {
			api.del('/topics/' + post.topic.id + '/invalidrel', { toid: -9999999 }, function(err, res) {
				assert.equal(res.statusCode, 500);
				done();
			});
		})

	})

	describe('DELETE /topics/:id/sub with valid data', function() {

		var postParent = api.request();
		var postChild = api.request();

		before(function(done) {
			postParent.postTopic(function() {
				postChild.postTopic(function() {
					api.post('/topics/' + postParent.topic.id + '/sub', { toid: postChild.topic.id }, 
						function(err, results) {
							done(err);
						}
					);
				})
			});
		})

		it('returns status 200', function(done) {
			api.del('/topics/' + postParent.topic.id + '/sub', { toid: postChild.topic.id }, 
				function(err, results) {
					assert.equal(results.statusCode, 200);
					done(err);
				}
			);
		});

		describe('then GET /topics/:id/sub', function() {

			it('does not include the topic whose sub relationship was deleted', function(done) {
				api.get('/topics/' + postParent.topic.id + '/sub', function(err, results) {
					var subTopics = JSON.parse(results.body);
					assert.ok(!_.any(subTopics, function(t) {
						return t.id === postChild.topic.id;
					}));
					done();
				});
			})

		})

	})

	describe('DELETE /topics/:id/next with valid data', function() {

		var postPrev = api.request();
		var postNext = api.request();

		before(function(done) {
			postPrev.postTopic(function() {
				postNext.postTopic(function() {
					api.post('/topics/' + postPrev.topic.id + '/next', { toid: postNext.topic.id }, 
						function(err, results) {
							done(err);
						}
					);
				})
			});
		})

		it('returns status 200', function(done) {
			api.del('/topics/' + postPrev.topic.id + '/next', { toid: postNext.topic.id }, 
				function(err, results) {
					assert.equal(results.statusCode, 200);
					done(err);
				}
			);
		});

		describe('then GET /topics/:id/next', function() {

			it('does not include the topic whose next relationship was deleted', function(done) {
				api.get('/topics/' + postPrev.topic.id + '/next', function(err, results) {
					var nextTopics = JSON.parse(results.body);
					assert.ok(!_.any(nextTopics, function(t) {
						return t.id === postNext.topic.id;
					}));
					done();
				});
			})

		})

	})

	describe('DELETE /topics/:id/root', function() {

		var rootPost = api.request();

		before(function(done) {
			rootPost.postTopic(function() {
				api.post('/topics/' + rootPost.topic.id + '/root', {}, 
					function(err, results) {
						done(err);
					}
				);
			})
		})

		it('returns status 200', function(done) {
			api.del('/topics/' + rootPost.topic.id + '/root', {}, 
				function(err, results) {
					assert.equal(results.statusCode, 200);
					done(err);
				}
			);
		});

		describe('then GET /topics/:id/root', function() {

			it('does not include the topic in the root relationships', function(done) {
				api.get('/topics', function(err, results) {
					var rootTopics = JSON.parse(results.body);
					assert.ok(!_.any(rootTopics, function(t) {
						return t.id === rootPost.topic.id;
					}));
					done();
				});
			})

		})
	})

	describe('DELETE /topics/:id with invalid id', function() {

		it('returns status 404', function(done) {
			api.del('/topics/-9999999', {}, function(err, res) {
				assert.equal(res.statusCode, 404);
				done(err);
			});
		})

	})

	describe('DELETE /topics/:id with valid id', function() {

		var topicPost = api.request();

		before(function(done) {
			topicPost.postTopic(done);
		})

		it('returns status 200', function(done) {
			api.del('/topics/' + topicPost.topic.id, {}, function(err, res) {
				assert.equal(res.statusCode, 200);
				done(err);
			});
		})

		describe('then GET /topics/:id with the deleted id', function() {

			it('returns status 404', function(done) {
				api.get('/topics/' + topicPost.topic.id, function(err, res) {
					assert.equal(res.statusCode, 404);
					done(err);
				});
			})

		})

	})

})
