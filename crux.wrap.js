var wrap = module.exports = function(obj, model){
	var wrapper = {};

	for(var prop in model){
		wrapper[prop] = model[prop].bind(obj);
	}

	return wrapper;
};

wrap.help = function(){
	return '' +
	'@call - wrap(obj=[Object],model=[Object])';
};