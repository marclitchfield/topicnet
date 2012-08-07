var APIeasy = require('api-easy'),
    assert = require('assert');

var suite = APIeasy.describe('your/awesome/api');

suite.discuss('When using your awesome API')
     .discuss('and your awesome resource')
     .use('localhost', 5000)
     .setHeader('Content-Type', 'application/json')
     .post({ name: 'testnode' })
 	    .expect(200, { ok: true })
		.expect('should respond with new node', function (err, res, body) {
        	assert.equal(res.body, '{ "name": "testnode" }');
         })
	.export(module);
