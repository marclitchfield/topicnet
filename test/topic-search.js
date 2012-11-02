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
		});
	});

	describe('GET /topics?q with substring', function() {
    var searchString = 'estnod';
    var searchResults;

		before(function(done) {
			api.get('/topics?q=' + searchString, function(err, res) {
				searchResults = JSON.parse(res.body);
				done();
			});
		});

		it('returns a topic containing the search string', function() {
			assert.ok(_.any(searchResults, function(t) {
        return t.name.indexOf(searchString) !== -1;
			}));
		});
	});

	describe('GET /topics?q with spaces', function() {
    var searchString = 'testnode to f';
		var searchResults;

		before(function(done) {
			api.get('/topics?q=' + searchString, function(err, res) {
				searchResults = JSON.parse(res.body);
				done();
			});
		});

		it('returns a topic containing the search string', function() {
			assert.ok(_.any(searchResults, function(t) {
        return t.name.indexOf(searchString) !== -1;
			}));
		});
	});

	describe('GET /topics?q with !', function() {

		it('returns existing topic', function(done) {
      var searchString = 'ind!';
			api.get('/topics?q=' + searchString, function(err, res) {
				var searchResults = JSON.parse(res.body);
				assert.ok(_.any(searchResults, function(t) {
          return t.name.indexOf(searchString) !== -1;
				}));
				done();
			});
		});

	});

  describe('GET /topics?q with query that will return over 10 results', function() {
    
    before(function(done) {
      var count = 0;
      for(var i = 0; i < 11; i++) {
        api.post('/topics', { name: 'similar topic ' + guid.raw() }, function() {
          count++;
          if(count === 11) {
            done();
          }
        });
      }
    });

    it('returns 10 matching results', function(done) {
      var searchString = 'similar';
      api.get('/topics?q=' + searchString, function(err, res) {
        var searchResults = JSON.parse(res.body);
        assert.equal(searchResults.length, 10);
        assert.ok(_.all(searchResults, function(t) {
          return t.name.indexOf(searchString) !== -1;
        }));
        done();
      });
    });

  });

});
