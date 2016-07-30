var promise = require('./crux.promise');
var exec = require('child_process').exec;

module.exports = promise(function(pat, cb){
	exec('for i in '+pat+';do echo $i;done', function(err, res){
		cb(err, err || res.split('\n').filter(function(e){
			return e;
		}));
	});
});