module.exports = function(descriptor){
	if(!(descriptor instanceof Object)){
		throw Error('argument is not an object');
	}

	if(!('init' in descriptor)){
		throw Error('descriptor does not contain init method');
	}

	if(!(descriptor.init instanceof Function)){
		throw Error('init must be a function');
	}

	var init = descriptor.init;
	delete descriptor.init;

	return function(){
		var priv = {};
		var pub = {};

		for(var prop in descriptor){
			if(descriptor[prop] instanceof Function){
				pub[prop] = priv[prop] = (function(method){
					return function(){
						var res = method.apply(priv, arguments);
						for(var prop in pub){
							pub[prop] = priv[prop];
						}
						if(res === priv){
							return pub;
						}
						return res;
					};
				})(descriptor[prop]);
			}else{
				pub[prop] = priv[prop] = descriptor[prop];
			}
		}

		init.apply(priv, arguments);
		for(var prop in pub){
			pub[prop] = priv[prop];
		}

		return pub;
	};
};