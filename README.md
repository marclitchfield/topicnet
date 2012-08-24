topic CRUD
----------
GET  /topics/:id       - get topic details
GET  /topics/          - return root topics
	{name:NN, next: [3,4], sub: [8, 9]} 
POST /topics           - create a topic
PUT  /topics           - update a topic
DEL  /topics/:id       - delete a topic, and all relationships to it

relationship CRUD
-----------------
GET  /topics/:fromid/next  - get next topics
GET  /topics/:fromid/sub   - get subtopics
POST /topics/:id/root      - makes the node root
POST /topics/:fromid/next  - creates a 'next' relationship
    {toid:X, score:Z}
PUT  /topics/:id/next/:toid  - update a relationship
    {score:Z} 
DEL  /topics/:id/next/:toid  - delete a 'next' relationship

graph API
---------
GET /graph/:id?depth=3
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
	}
