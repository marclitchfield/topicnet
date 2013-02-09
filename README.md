Artoplasm
=========

Topic CRUD
----------
- GET  /topics/:id       - get topic details and arrays of entire related nodes
<pre>
	{ id: 1, 
		name: "main node",
		resources: [
			{ id: 88, title: "Res A", url: "http://example.url", source: "Src A", verb: "read" },
			{ id: 77, title: "Res B", url: "http://example.url", source: "Src B", verb: "watch" },
		],
		sub: [ 
			{ id: 2, name: "sub node" }
		],
		next: [
			{ id: 42, title: "next topic" }
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

Topic search
------------
- GET /topics?q=[search_string]&p=[page]&pp=[results_per_page]
where p defaults to 1, and pp defaults to 10

Relationship CRUD
-----------------
- GET  /topics/:fromid/next  - get next topics
			{ id: 78, name: "other sub node" } 
		],
		next: [ 
			{ id: 3, name: "next node" },
			{ id: 10, name: "other next node" }
		]
	}
- GET  /topics/:fromid/sub   - get subtopics
- GET /topics/:id/[rel]/:toid - get relationship data
<pre>
	{
		fromId: 1,
		toId: 2,
		relationshipType: 'next',
		upVotes: 2,
		downVotes: 0,
		score: 2
	}
</pre>
- POST /topics/:id/root      - makes the node root
- POST /topics/:fromid/next  - creates a 'next' relationship

    { toid:X, score:Z }

- PUT  /topics/:id/next/:toid  - update a relationship

    { score:Z } 

- DEL  /topics/:id/next/:toid  - delete a 'next' relationship

- POST /topics/:id/resources - links a resource to a topic
    
    { resid:X }

- DEL /topics/:id/resources/:resid - unlink a resource from a topic

Resource CRUD
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
- POST    /resources
- PUT     /resources/:id
- DELETE  /resources/:id

Resource Search
---------------
- GET /resources?url=[some url]
- GET /resources?title=[some title]

Vote CRUD
---------
- GET /topics/:id/[rel]/:toid/vote - returns votes on a relationship between two topics or between a topic and a resource
- GET /topics/:id/[rel]/:toid/vote?user=1 - returns vote by specified user on a relationship
- POST /topics/:id/[rel]/:toid/vote - creates or updates a vote on a relationship
<pre>
  { dir: 'up', user: 1 }
</pre>
- PUT /topics/:id/[rel]/:toid/vote - updates a vote on a relationship
<pre>
  { dir: 'down', user: 1 }
</pre>
- DEL /topics/:id/[rel]/:toid/vote - delete a vote on a relationship

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

To run the back end tests, start the neo4j test database (neo4j-test) running on port 7476 and start node with:
<pre>NODE_ENV=test node server.js</pre>
Then run
<pre>npm test</pre>
to run the test suite.

To run the front end tests, run
<pre>testem</pre>
Pass the -h switch for help
