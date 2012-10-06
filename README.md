Artoplasm
=========

topic CRUD
----------
- GET  /topics/:id       - get topic details and arrays of entire related nodes
<pre>
	{ id: 1, 
		name: "main node",
		resources: [
			{ id: 88, title: "Resource A", url: "http://example.url", source: "Source A" },
			{ id: 77, title: "Resource B", url: "http://example.url", source: "Source B" },
		],
		sub: [ 
			{ id: 2, name: "sub node" },
			{ id: 78, name: "other sub node" } 
		],
		next: [ 
			{ id: 3, name: "next node" },
			{ id: 10, name: "other next node" }
		]
	}
</pre>

- GET  /topics/          - return root topics
<pre>
	[ 
		{ id: 1, name: "root topic" },
		{ id: 54, name: "other root topic" }
	] 
</pre>

- POST /topics           - create a topic and return the created topic
- PUT  /topics           - update a topic
- DEL  /topics/:id       - delete a topic, and all relationships to it

relationship CRUD
-----------------
- GET  /topics/:fromid/next  - get next topics
- GET  /topics/:fromid/sub   - get subtopics
- POST /topics/:id/root      - makes the node root
- POST /topics/:fromid/next  - creates a 'next' relationship

    { toid:X, score:Z }

- PUT  /topics/:id/next/:toid  - update a relationship

    { score:Z } 

- DEL  /topics/:id/next/:toid  - delete a 'next' relationship

resource CRUD
-------------
- GET  /resources/:id
<pre>
  {
    id: 88,
    title: "Resource Title",
    url: "http://example.url",
    source: "Resource Source"
  }
</pre>
- GET /resources?url=http%3A%2F%2Fexample.com
- GET /resources?title=some%20title
- POST    /resources
- PUT     /resources/:id
- DELETE  /resources/:id

graph API
---------
- GET /graph/:id?depth=3
<pre>
  {
    topics: [
      { id: 1,
        next: [ 3, 2 ],
        sub: [ 8, 3 ]
      },
      { id: 2,
        next: [ 3, 1 ],
        sub: [ 8, 1, 4 ] 
      }
    ]
  }
</pre>


Testing
-------

To run the tests, start the neo4j test database (neo4j-test) running on port 7476 and start node with:
<pre>NODE_ENV=test node server.js</pre>
Then run
<pre>npm test</pre>
to run the test suite.
