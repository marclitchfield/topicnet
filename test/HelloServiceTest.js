var assert = require('assert');
var vows = require('vows');
var ts = require('../lib/HelloService.js');

vows.describe('Hello Service').addBatch({
    'When you call hello': {
        topic: ts,
        'outputs world': function (ts) {
            assert.equal (ts.hello(), 'World');
        }
    }
}).export(module); // Export the Suite
