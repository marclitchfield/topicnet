module.exports = function() {
	switch(process.env.NODE_ENV) {
		case 'test': 
			return { neo4j: { port: 7476 }};
		default:
			return { neo4j: { port: 7474 }};
	}
};
