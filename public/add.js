$(function() {
	$("#submit").click(function() {
		$.post('http://localhost:5000/node/', $("#add-node-form").serialize(), function(data) {
				$("#name").val("");
				var message = "<p>Nodes Created: " + data.nodes + "</p>";
				$("#add-node-form").after(message);
		});
	});
});
