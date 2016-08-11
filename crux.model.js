var cls = require('./crux.class');
var copy = require('./crux.copy');

var createMatch = function(pattern){
	if(!pattern){
		return /^+*$/;
	}

	return new RegExp('^' + pattern.split('.').map(function(term){
		return term.replace(/\*/g, '+*');
	}).join('\\.') + '$');
};

var has = function(data, key){
	if(data === undefined){
		//the key is unreachable
		return false;
	}

	if(!(data instanceof Object) && key.length){
		//the key goes deeper, but the data is primitive
		return false;
	}

	if(typeof key === 'string'){
		//easy pass in the form of 'prop.sub.prop' -> ['prop', 'sub', 'prop']
		return has(data, key.split('.'));
	}

	if(key.length){
		//the key goes deeper, keep looking
		var current = key.slice()[0];
		if(current == '*'){
			return Object.keys(data).some(function(prop){
				return has(data[prop], key.slice(1));
			});
		}

		return has(data[current], key.slice(1));
	}

	//key has been fully reached, the data must exist
	return true;
};

var get = function(data, key){
	if(data === undefined){
		//the key is unreachable
		return null;
	}

	if(!(data instanceof Object) && key.length){
		//the key goes deeper, but the data is primitive
		return null;
	}

	if(typeof key === 'string'){
		//easy pass in the form of 'prop.sub.prop' -> ['prop', 'sub', 'prop']
		return get(data, key.split('.'));
	}

	if(!key || !key.length){
		return copy(data);
	}

	//the key goes deeper, keep looking
	return get(data[key[0]], key.slice(1));
};

var set = function(data, key, value, rules){
	if(key[0] && key[0].match(/\*/)) throw Error('set does not support wildcard');

	if(!(data instanceof Object) && key.length){
		//the key goes deeper, but the data is primitive
		return false;
	}

	if(typeof key === 'string'){
		//easy pass in the form of 'prop.sub.prop' -> ['prop', 'sub', 'prop']
		return set(data, key.split('.'), value);
	}

	var len = key.length, current = key.shift();

	if(len){
		//the key goes deeper, keep looking
		if(set(data[current], key, value) && len == 1){
			if(value instanceof Object){
				data[current] = {};
				for(var prop in value){
					set(data[current], [prop], value[prop]);
				}
			}else{
				data[current] = value;
			}
		}
	}

	//key has been fully reached, the data can be set
	return true;
};

var ref = function(data, key){
	if(!data || typeof data !== 'object'){
		throw Error('data is not defined');
	}

	if(key && key.length){
		if(typeof key === 'string'){
			return ref(data, key.split('.'));
		}else{
			return ref(data[key[0]], key.slice(1));
		}
	}else{
		return data;
	}
};

var model = module.exports = cls({
	init: function(opts){
		opts = opts || {};

		if(opts.data){
			this.data = ref(opts.data, opts.key);
		}else{
			this.data = {};
		}

		this.rules = {
			set: []
		};
	},
	has: function(key){
		return has(this.data, key);
	},
	set: function(key, val){
		if(arguments.length == 1 && key instanceof Object){
			for(var prop in key){
				this.set(prop, key[prop]);
			}
		}else{
			set(this.data, key, val, this.rules);
		}

		return this;
	},
	get: function(key){
		return get(this.data, key);
	},
	ref: function(key){
		return model({
			data: this.data,
			key: key
		});
	},
	rule: function(pattern, cmd, listener){
		if(arguments.length == 1){
			throw Error('not enough args');
		}

		if(arguments.length == 2){
			listener = cmd;
			cmd = pattern;
		}

		if(!(listener instanceof Function)){
			throw Error('rule is not a function');
		}

		this.rules[cmd].push({
			pattern: createMatch(pattern),
			listener: listener
		})
		return this;
	},
	copy: function(){
		return model({
			data: copy(this.data)
		});
	}
});