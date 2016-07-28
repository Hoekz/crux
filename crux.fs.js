var fs = require('fs');
var promise = require('./crux.promise');

module.exports = (function(){
	var cache = {};

	var readFile = promise(function(file, opts, callback){
		if(arguments.length == 2){
			callback = opts;
			opts = {encoding: 'utf8'};
		}
		details(file).then(function(specs){
			if(file in cache && specs.ctime <= cache[file].ctime){
				return cache[file].content;
			}
			return putInCache(file, opts);
		}).then(function(data){
			callback(null, data);
		}).catch(function(err){
			callback(err);
		});
	});

	var writeFile = promise(function(file, content, callback){
		cache[file] = {
			content: content,
			ctime: new Date()
		};
		fs.writeFile(file, content, callback);
	});

	var putInCache = promise(function(file, opts, callback){
		opts = opts || {};
		fs.readFile(file, opts, function(err, data){
			if(!err) cache[file] = {
				content: data,
				ctime: new Date()
			};
			callback(err, data);
		});
	});

	var removeFromCache = promise(function(file, callback){
		var inCache = file in cache;
		delete cache[file];
		callback(null, inCache);
	});

	var details = promise(function(file, callback){
		fs.stat(file, callback);
	});
	
	return {
		read: readFile,
		write: writeFile,
		cache: putInCache,
		uncache: removeFromCache,
		details: details
	};
})();