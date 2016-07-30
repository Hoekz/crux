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
	var len = array.length;
	return new Promise(function(resolve, reject){
		if(!len) return resolve();
		var count = 0, results = [];

		var store = function(data, index){
			count++;
			results[index] = data;

			if(count == len){
				resolve(results);
			}
		};

		array.forEach(function(promise, index){
			promise.then(function(data){
				store(data, index);
			}, function(data){
				store(data, index);
			});
		});
	});
};

module.exports.data = function(data){
	return new Promise(function(resolve){
		resolve(data);
	});
};