var APIeasy = require('api-easy'),
    assert = require('assert');

var suite = APIeasy.describe('your/awesome/api');

suite.discuss('When using the API')
	.use('localhost', 5000)
	.path('/topic')
    .setHeader('Content-Type', 'application/json')
    	.post({ name: 'testnode' })
			.expect(200)
 	    	.expect({ "name": "testnode" })
	.export(module);
