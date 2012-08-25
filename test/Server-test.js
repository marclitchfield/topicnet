var APIeasy = require('api-easy'),
    assert = require('assert');

var suite = APIeasy.describe('artoplasm REST API');

suite.discuss('When using the API')
	.use('localhost', 5000)
	.path('/topic')
    .setHeader('Content-Type', 'application/json')
    	.post({ name: 'testnode' })
			.expect(200)
 	    	.expect({ "name": "testnode" })
		.post({  })
			.expect(500)
			.expect('should respond with error', function(err, res, body) {
				assert.include(res.body, 'name is required');
			})
	.export(module);
