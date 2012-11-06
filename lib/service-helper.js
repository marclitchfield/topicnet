var _ = require('underscore');

module.exports = {

	makeNode: function(nodeData) {
		var node = nodeData.data;
		node.id = module.exports.parseNodeId(nodeData);
		return node;
	},

	makeTopics: function(queryResult) {
		var topics = [];

		_.each(queryResult, function(result) {
			var id = module.exports.parseNodeId(result.n._data);

			var topic = _.find(topics, function(t) {
				return t.id === id;
			});

			if (topic === undefined) {
				topic = module.exports.makeNode(result.n._data);
				topics.push(topic);
			}

			if (result.r && result.c) {
				var rel = result.r._data.type;
				if (!topic.hasOwnProperty(rel)) {
					topic[rel] = [];
				}

				topic[rel].push(module.exports.makeNode(result.c._data));
			}
		});

		return topics;
	},

	makeResources: function(queryResults) {
		var resources = _.map(queryResults, function(result) {
			return module.exports.makeNode(result.n._data);
		});
		return resources;
	},

	parseNodeId: function(nodeData) {
		var url = nodeData.self;
		return parseInt(url.split('/').pop(), 10);
	},

	escapeLuceneSpecialChars: function(query) {
		return query.replace(/([ \*\+\-\!\(\)\{\}\[\]\^\"\~\?\:\\])/g, '\\$1');
	},
	
	isMissingIndexError: function(err) {
		return (err.message.exception === 'org.neo4j.graphdb.NotFoundException' ||
			err.message.match(/^Index.*does not exist$/) !== null);
	}

};
