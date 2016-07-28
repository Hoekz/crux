var promise = require('./crux.promise');
var obj = require('./crux.object');
var server = require('./crux.server');

var defaultUnit = 'px';

var dom = module.exports = function(def){
	dom[def.name] = process(def);
};

dom.setUnit = function(unit){
	defaultUnit = unit;
	return dom;
};

var process = function(def){
	if(def.name in dom) throw {message: `${def.name} is already defined.`};
	
	def.style = processStyle(def.name, def.style);
};

var processStyle = function(name, style){
	if(!style) return {};
	server.on.get('/style/' + name + '.css', function(req){
		server.css(dom[name].style.toString());
	});
};

dom({
	name: 'div',
	compare: function(e){return e.tagName === 'DIV'},
	render: function(){
		return this.body;
	}
});

dom.help = function(){
	return '' +
	'';
};