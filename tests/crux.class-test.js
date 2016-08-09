var suite = require('../crux.test');
var cls = require('../crux.class');

suite('crux.class Tests', function(test){
	test('should require an init method', function(assert){
		try{
			var myClass = cls();
			return assert.fail('allowed creation of class without descriptor object');
		}catch(e){
			assert.equal(e.message, 'argument is not an object');
		}

		try{
			var myClass = cls({});
			return assert.fail('allowed creation of class without init method');
		}catch(e){
			assert.equal(e.message, 'descriptor does not contain init method');
		}

		try{
			var myClass = cls({
				init: 'not a function'
			});
			return assert.fail('allowed creation of class with init that is not method');
		}catch(e){
			assert.equal(e.message, 'init must be a function');
		}

		try{
			var myClass = cls({
				init: function(){}
			});
		}catch(e){
			return assert.fail('unknown qualified throw: ' + e.message);
		}

		assert.done();
	});

	test('should decorate this keyword in it with all other provided props', function(assert){
		var prop = {a: 'b'};
		var initProp;
		var myClass = cls({
			init: function(){
				initProp = this.prop;
			},
			prop: prop
		});

		var myInstance = myClass();

		assert.equal(initProp, prop);
		assert.done();
	});

	test('should decorate this keyword for all methods that are provided', function(assert){
		var prop = {a: 'b'};
		var methodProp;
		var myClass = cls({
			init: function(){},
			method: function(){
				methodProp = this.prop;
			},
			prop: prop
		});

		var myInstance = myClass();
		myInstance.method();

		assert.equal(methodProp, prop);
		assert.done();
	});

	test('should use arguments to constructor as arguments in init', function(assert){
		var args = [0, true, {}, "str"];
		var initArgs;

		var myClass = cls({
			init: function(){
				initArgs = arguments;
			}
		});

		var myInstance = myClass(args[0], args[1], args[2], args[3]);

		assert.equal(initArgs.length, args.length);
		args.forEach(function(arg, index){
			assert.equal(initArgs[index], arg);
		});

		assert.done();
	});

	test('should provide all public props to instance', function(assert){
		var prop = {a: 'b'};
		var methodProp;
		var myClass = cls({
			init: function(){},
			method: function(){
				methodProp = this.prop;
			},
			prop: prop
		});

		var myInstance = myClass();
		myInstance.method();

		assert.equal(myInstance.prop, methodProp);
		assert.done();
	});

	test('any properties added internally are not reflected externally', function(assert){
		var prop = {a: 'b'};
		var myClass = cls({
			init: function(){},
			method: function(){
				this.prop = prop;
			}
		});

		var myInstance = myClass();
		myInstance.method();

		assert.ok(!('prop' in myInstance));
		assert.done();
	});

	test('any properties changed internally are reflected externally', function(assert){
		var prop = 'a property';
		var changedTo = 'changed';
		var myClass = cls({
			init: function(){},
			method: function(){
				this.prop = changedTo;
			},
			prop: prop
		});

		var myInstance = myClass();
		myInstance.method();

		assert.equal(myInstance.prop, changedTo);
		assert.done();
	});

	test('should not be able to expose private version of instance', function(assert){
		var myClass = cls({
			init: function(){},
			method: function(){
				return this;
			}
		});

		var myInstance = myClass();
		var retInstance = myInstance.method();

		assert.equal(retInstance, myInstance);
		assert.done();
	});
});