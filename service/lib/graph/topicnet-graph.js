var topics = require('./topicnet-graph/topics');
var relationships = require('./topicnet-graph/relationships');
var resources = require('./topicnet-graph/resources');
var users = require('./topicnet-graph/users');

exports.create = function(neo4jGraph) {

	return {

		topics: topics.create(neo4jGraph),
		relationships: relationships.create(neo4jGraph),
		resources: resources.create(neo4jGraph),
		users: users.create(neo4jGraph)

	};
};
