String.prototype.contains = function(searchString) {
	return this.toLowerCase().indexOf(searchString.toLowerCase()) !== -1;
};