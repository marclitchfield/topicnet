var _ = require('underscore');

module.exports = {

	parsePositiveInt: function(param) {
		if(param === undefined) return false;
		var parseResult = parseInt(param, 10);
		if(parseResult < 1 || parseResult !== parseResult) return false;
		return parseResult;
	},

	escapeLuceneSpecialChars: function(query) {
		return query.replace(/([ \*\+\-\!\(\)\{\}\[\]\^\"\~\?\:\\])/g, '\\$1');
	}

};
