var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');

describe('Topic Resources', function() {

	describe('POST /topics/:id/resource with invalid id', function() {

		it('returns status 404', function(done) {
			api.post('/topics/-9999999/resource', {}, function(err, res) {
				assert.equal(res.statusCode, 404);
				done(err);
			});
		})

	})

//	describe('POST /topics/:id/resource with invalid resid', function() {
//		
//
//	});


})
