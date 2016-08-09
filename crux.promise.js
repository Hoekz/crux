module.exports = function(fn, thisArg){
	thisArg = thisArg || fn;
	return function(){
		var args = [].slice.call(arguments);

		return new Promise(function(resolve, reject){
			args.push(function(err, data){
				err ? reject(err) : resolve(data);
			});

			fn.apply(thisArg, args);
		});
	};
};

module.exports.map = function(array){
	var len = array.length, count = 0, results = [];
	var res = null;
	var prom = new Promise(function(resolve, reject){
		res = resolve;
		if(!len) resolve(results);
	});

	var store = function(data, index){
		count++;
		results[index] = data;

		if(count == len){
			res(results);
		}
	};

	array.forEach(function(promise, index){
		promise.then(function(data){
			store(data, index);
		}, function(data){
			store(data, index);
		});
	});

	return prom;
};

module.exports.data = function(data){
	return new Promise(function(resolve){
		resolve(data);
	});
};