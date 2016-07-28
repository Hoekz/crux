var exec = (function(module,exports,require,document,window,inject,Object,Function,Array,setTimeout,setInterval,process){
	return function(model,str){
		return eval(
			'(function(eval){' +
				'return ' + str + 
			'})()'
		);
	};
})();

var inject = module.exports = function(model, props, fn){
	if(arguments.length === 2){
		if(props instanceof Array){
			props = props.slice();
			fn = props.pop();
		}else{
			fn = props;
			props = fn.toString().match(/function \(([A-Za-z0-9,\$_ ]*)\)\{/)[1];
			props = props.split(',').map(function(arg){return arg.trim()});
		}
	}

	return fn.apply(fn, props.map((arg) => model[arg]));
};

inject.prep = function(model, props, fn){
	return inject.bind(inject, model, props, fn);
};

inject.scope = function(scopes, fn){
	var model = {};
	var props = [];
	if(scopes instanceof Array){	
		scopes.forEach(function(scope){
			for(var prop in scope){
				if(!(prop in model)) props.push(prop);
				model[prop] = scope[prop];
			}
		});
	}else{
		for(var prop in scopes){
			props.push(prop);
			model[prop] = scopes[prop];
		}
	}

	return exec(model,'(function(){' + props.map(function(prop){
		return 'var ' + prop + '=model["' + prop + '"];\n'
	}).join('') + 'return (' + fn.toString() + ')();})()');
};

inject.help = function(){
	return '' +
	'@call - inject(model=[Object],fn=[Function])\n' + 
	'@call - inject(model=[Object],props=[Array[String]],fn=[Function])\n' +
	'@call - inject(model=[Object],props_fn=[Array[String...Function]])\n' +
	'@param - model: object used to insert arguments into function\n' +
	'@param - props: array of properties from model to inject into fn\n' +
	'@param - fn: function to have args injected in, if no props, uses fn args\n' +
	'@return - returns result of injection\n' +
	'@prop - prep=[Function]: prepares an injection but does not execute\n' +
	'\twhich means changes in the model can be reflected\n' +
	'@prop - scope=[Function]: injects scope(s) where the each scope\n' +
	'\toverrides the other to create the illusion of nested scopes.\n' +
	'\tBe warned, this function uses an eval statement, although the\n' +
	'\tscope is well isolated before execution.';
};