var assert = require('assert');
var request = require('request');

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

describe('Artoplasm REST Service', function() {

	describe('POST to /topics with no name', function() {
		it('returns status 500 and error message', function(done) {
			api.post('/topics', {}, function(err, res) {
				assert.equal(500, res.statusCode);
				assert.include(res.body, 'name is required');
				done();
			});
		})
	})

	describe('POST to /topics with valid data', function() {

		var r;

		before(function(done) {
			api.post('/topics', { name: 'testnode' }, function(err, res) {
				r = res;
				done();
			});
		})

		it('returns status 200', function() {
			assert.equal(200, r.statusCode);
		})

		it('returns new topic', function() {
			var topic = JSON.parse(r.body);
			it('with the name specified', function() {
				assert.equal('testnode', topic.name); 
			})
			it('and a valid generated id', function() {
				assert.ok(topic.id > 0);
			})
		})

	})

	describe('GET /topics/:id with invalid id', function() {
		it('returns status 404', function() {
			api.get('/topics/-99999', function(err, res) {
				assert.equal(404, res.statusCode);
				done();
			});
		})
	})

})
