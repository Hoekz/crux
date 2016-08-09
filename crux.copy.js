module.exports = function(data){
	if(data.copy instanceof Function){
		return data.copy.call(data);
	}

	return JSON.parse(JSON.stringify(data));
};