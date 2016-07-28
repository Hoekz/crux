var copy = require('./crux.copy');

var has = function(key){
	if(typeof key === 'string') return has.call(this, key.split('.'));
	if(!key.length) return true;
	var prop = key.shift();
	if(prop in this) return has.call(this[prop], key);
	return false;
};

var get = function(key){
	if(typeof key === 'string') return get.call(this, key.split('.'));
	if(!key.length) return this;
	var prop = key.shift();
	if(prop in this) return get.call(this[prop], key);
	return undefined;
};

var set = function(key, value){
	if(!this instanceof Object) throw {message: `Cannot add properties to type ${typeof this}`};
	if(typeof key === 'string') return set.call(this, key.split('.'));
	if(!key.length) return false;
	var prop = key.shift();
	if(prop in this){
		var attempt = set.call(this[prop], key);
		if(attempt === false) this[prop] = value;
		return true;
	}
	return undefined;
};

var cast = function(base, ignored){
	if(!base) throw {message: 'base must be defined'};
	ignored = ignored || [];
	var newObj = {};

	for(var prop in this){
		if(ignored.indexOf(prop) > -1){
			newObj[prop] = this[prop];
		}
	}

	for(var prop in base){
		if(base[prop] instanceof Object){
			if(prop in this){
				newObj[prop] = cast.call(this[prop], base[prop]);
			}else{
				newObj[prop] = copy(base[prop]);
			}
		}else{
			newObj[prop] = base[prop].constructor(this[prop] || base[prop]);
		}
	}

	return newObj;
};

module.exports = function(obj){
	return {
		has: has.bind(obj),
		get: get.bind(obj),
		set: set.bind(obj),
		cast: cast.bind(obj)
	};
};