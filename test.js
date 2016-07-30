var fs = require('./crux.fs');
var glob = require('./crux.glob');
var log = console.log.bind(console);

glob('./tests/*-test.js').then(log);
glob('./tests/*-test.js').then(fs.read).then(function(files){
	for(file in files){
		console.log(file + ': ' + files[file].length);
	}
});