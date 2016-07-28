var help = module.exports = function(obj, target){
	if('help' in obj){
		obj.help().split('\n').forEach(function(line){
			if(target && line.match(new RegExp('^@' + target))){
				console.log(line);
			}else if(!target){
				console.log(line);
			}
		});
	}else{
		console.log('no associated help information');
	}
};

help.help = function(){
	return '' +
	'@call - help(obj=[Object])\n' +
	'@call - help(obj=[Object], target=[String])\n' +
	'@param - obj: object to look for help on.\n' +
	'@param - target: specifc @target lines to print\n' +
	'@return - none\n' +
	'@doc - to generate support for help, simply attach a help string to your object';
};