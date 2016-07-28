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