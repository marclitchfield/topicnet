var assert = require('assert');
require('mocha-as-promised')();

String.prototype.contains = function(searchString) {
	return this.toLowerCase().indexOf(searchString.toLowerCase()) !== -1;
};

assert.expectFail = function() {
	assert.fail('failure was expected');
};