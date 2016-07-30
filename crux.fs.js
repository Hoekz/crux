var fs = require('fs');
var promise = require('./crux.promise');

var cache = {};

var readFile = promise(function(file, opts, callback){
	if(arguments.length == 2){
		callback = opts;
		opts = {encoding: 'utf8'};
	}
	details(file).then(function(specs){
		if(specs instanceof Array){
			return promise.map(specs.map(function(s, i){
				return getFile(file[i], s, opts instanceof Array ? opts[i] : opts);
			}));
		}
		return getFile(file, specs, opts);
	}).then(function(data){
		if(file instanceof Array){
			var files = {};
			file.forEach(function(f){
				files[f] = cache[f].content;
			});

			data = files;
		}

		callback(null, data);
	}).catch(function(err){
		callback(err);
	});
});

var getFile = function(file, specs, opts){
	if(file in cache && specs.ctime <= cache[file].ctime){
		return promise.data(cache[file].content);
	}
	return putInCache(file, opts);
};

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
	if(file instanceof Array){
		promise.map(file.map(function(f){
			return details(f);
		})).then(function(data){
			callback(null, data);
		});
	}else{
		fs.stat(file, callback);
	}
});
	
module.exports = {
	read: readFile,
	write: writeFile,
	cache: putInCache,
	uncache: removeFromCache,
	details: details
};