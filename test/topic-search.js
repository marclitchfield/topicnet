var assert = require('assert');
var _ = require('underscore');
var api = require('./helper-api.js');
var guid = require('guid');

describe('Topic Search', function() {

	var topicToFind;

	before(function(done) {
		api.post('/topics', { name: 'testnode to find! ' + guid.raw() }, function(err, res) {
			topicToFind = JSON.parse(res.body);
			done();
		})
	})

	describe('GET /topics?q with substring', function() {
		var searchResults;

		before(function(done) {
			api.get('/topics?q=estnod', function(err, res) {
				searchResults = JSON.parse(res.body);
				done();
			})
		})

		it('returns existing topic', function() {
			assert.ok(_.any(searchResults, function(t) {
				return t.id === topicToFind.id;
			}));
		})
	})

	describe('GET /topics?q with spaces', function() {
		var searchResults;

		before(function(done) {
			api.get('/topics?q=testnode to f', function(err, res) {
				searchResults = JSON.parse(res.body);
				done();
			})
		})

		it('returns existing topic', function() {
			assert.ok(_.any(searchResults, function(t) {
				return t.id === topicToFind.id;
			}));
		})
	})

	describe('GET /topics?q with !', function() {

		it('returns existing topic', function(done) {
			api.get('/topics?q=ind!', function(err, res) {
				var searchResults = JSON.parse(res.body);
				assert.ok(_.any(searchResults, function(t) {
					return t.id === topicToFind.id;
				}));
				done();
			});
		})

	})

})
