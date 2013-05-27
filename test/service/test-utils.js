var assert = require('assert');

function findMocha(module) {
	if (module.children) {
		for (var i=0; i<module.children.length; i++) {
			var childModule = module.children[i];

			if (childModule.id && childModule.id.indexOf('/mocha/lib/mocha.js') > -1) {
				return childModule;
			}

			var found = findMocha(childModule);
			if (found) {
				return found;
			}
		}
	}
}

var mocha = findMocha(require.main).exports;
require('mocha-as-promised')(mocha);

String.prototype.contains = function(searchString) {
	return this.toLowerCase().indexOf(searchString.toLowerCase()) !== -1;
};

assert.expectFail = function() {
	assert.fail('failure was expected');
};