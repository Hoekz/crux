//internal requires
var dom = require('./crux.dom');
var promise = require('./crux.promise');
var fs = require('./crux.fs');
var server = require('./crux.server');
var inject = require('./crux.inject');
var help = require('./crux.help');

var crux = function(){
	[].forEach(function(arg){

	}, arguments);
};

crux.dom = dom;
crux.promise = promise;
crux.fs = fs;
crux.server = server;
crux.inject = inject;
crux.help = help;

module.exports = crux;