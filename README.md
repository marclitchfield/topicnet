Topicnet
=========

[![Build Status](https://travis-ci.org/marclitchfield/topicnet.png?branch=master)](https://travis-ci.org/marclitchfield/topicnet)
 
Topic CRUD
----------
- GET  /topics/:id  - Get the details of the specified topic and all related topics and resources

```js
{ 
	id: 1,
	name: "main node",
	resources: [
		{ id: 88, title: "Res A", url: "http://example.url",
			source: "Src A", verb: "read", score: 1 },
		{ id: 77, title: "Res B", url: "http://example.url",
			source: "Src B", verb: "watch", score: 0 },
	],
	sub: [ 
		{ id: 2, name: "sub node", score: 0 }
	],
	next: [
		{ id: 42, title: "next topic", score: -1 }
	]
}
```

- GET  /topics/  - Get the root topics

```js
[ 
	{ id: 1, name: "root topic" },
	{ id: 54, name: "other root topic" }
] 
```

- POST /topics  - Create a topic and return the created topic
- PUT  /topics - Update a topic
- DEL  /topics/:id - Delete a topic and all its relationships

Topic search
------------
- GET /topics?q=[search_string]&p=[page]&pp=[results_per_page]
where p defaults to 1, and pp defaults to 10

Relationship CRUD
-----------------
- GET  /topics/:fromid/next  - Get next topics

```js
[
	{ id: 3, name: "next topic" },
	{ id: 10, name: "other next topic" }
]
```

- GET  /topics/:fromid/sub  - Get subtopics

```js
[
	{ id: 3, name: "sub topic" },
	{ id: 10, name: "other sub topic" }
]
```

- GET /topics/:id/[rel]/:toid - Get relationship data

```js
{
	fromId: 1,
	toId: 2,
	relationshipType: 'next',
	upVotes: 2,
	downVotes: 0,
	score: 2
}
```

- POST /topics/:id/root  - Makes the specified topic a root topic
- POST /topics/:fromid/next  - Create a 'next' relationship

```js
	{ toid: 4 }
```

- DEL  /topics/:id/next/:toid  - Delete the 'next' relationship

- POST /topics/:id/resources -  Link a resource to a topic

```js 
    { resid: 5 }
```

- DEL /topics/:id/resources/:resid  - Unlink a resource from a topic

Resource CRUD
-------------
- GET /resources/:id  - Get the details of the specified resource

```js
  {
    id: 88,
    title: "Resource Title",
    url: "http://example.url",
    source: "Resource Source"
  }
```

- POST /resources  - Create a new resource
- PUT /resources/:id  - Update the specified resource
- DELETE  /resources/:id  - Delete the specified resource

Resource Search
---------------
- GET /resources?url=[some url]  - Search for a resource by url
- GET /resources?title=[some title]  - Search for a resource by title

Vote CRUD
---------
- POST /topics/:id/[rel]/:toid/vote - Vote on a relationship

```js
  { dir: 'up' }
```

Local Setup
-------

- Install neo4j. Use  the default port of 7474

- Install dependencies
<pre>npm install</pre>

- Build
<pre>grunt</pre>
