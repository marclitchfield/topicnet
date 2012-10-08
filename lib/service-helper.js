module.exports = {

	makeNode: function(nodeData) {
		var node = nodeData.data;
		node.id = module.exports.parseNodeId(nodeData);
		return node;
	},

	parseNodeId: function(nodeData) {
		var url = nodeData.self;
		return parseInt(url.split('/').pop(), 10);
	},

	escapeLuceneSpecialChars: function(query) {
		return query.replace(/([ \*\+\-\!\(\)\{\}\[\]\^\"\~\?\:\\])/g, '\\$1');
	}

}
