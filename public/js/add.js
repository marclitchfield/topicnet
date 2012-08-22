$(function() {
	$("#submit").click(function() {
		var param = { name: $("#name").val() };

		$.post('/topic/', param, function(node) {
				$("#name").val("");
				var message = "<b>Node Created</b>: " + node.name;
				$("#result").html(message);
				$("#result").removeClass("hide");
		});
	});
});
