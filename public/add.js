$(function() {
	$("#submit").click(function() {
		var param = { name: $("#name").val() };

		$.post('http://localhost:5000/topic/', param, function(node) {
				$("#name").val("");
				var message = "<p>Node Created: " + node.name + "</p>";
				$("#add-node-form").after(message);
		});
	});
});
