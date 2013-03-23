module.exports = function() {
	console.log('[' + process.env.NODE_ENV + ']');

	if(process.env.NODE_ENV === 'test') {
		return { neo4j: { port: 7476 }};
	}
	else {
		return { neo4j: { port: 7474 }};
	}
}();
