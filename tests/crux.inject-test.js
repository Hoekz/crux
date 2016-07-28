var suite = require('../crux.test');
var inject = require('../crux.inject');

suite('crux.inject Tests', function(test){
	test.config({timeout:1});

	test('should only inject listed properties', function(assert){
		var model = {a: {}, b: {}, c: {}};
		inject(model, ['a','b'], function(a,b,c){
			assert.equal(a, model.a);
			assert.equal(b, model.b);
			assert.equal(c, undefined);
			assert.done();
		});
	});

	test('should parse args from function if not provided', function(assert){
		var model = {a: {}, b: {}, c: {}};
		inject(model, function(a,b,c){
			assert.equal(a, model.a);
			assert.equal(b, model.b);
			assert.equal(c, model.c);
			assert.done();
		});
	});

	test('should allow function to be last argument of props', function(assert){
		var model = {a: {}, b: {}, c: {}};
		inject(model, ['a','b', function(a,b,c){
			assert.equal(a, model.a);
			assert.equal(b, model.b);
			assert.equal(c, undefined);
			assert.done();
		}]);
	});

	test.suite('crux.inject.prep Tests', function(test){
		test.config({timeout:1});

		test('should bind given arguments to inject', function(assert){
			var model = {a: {}, b: {}, c: {}};
			var prepped = inject.prep(model, ['a', 'b'], function(a,b,c){
				assert.equal(a, model.a);
				assert.equal(b, model.b);
				assert.equal(c, undefined);
				assert.done();
			});

			assert.equal(prepped.toString(), 'function () { [native code] }');

			prepped();
		});
	});

	test.suite('crux.inject.scope Tests', function(test){
		test.config({timeout:1});

		test('should isolate scope as much as possible', function(assert){
			inject.scope({assert: assert}, function(){
				assert.equal(module, undefined);
				assert.equal(exports, undefined);
				assert.equal(process, undefined);
				assert.equal(require, undefined);
				assert.equal(inject, undefined);
				assert.equal(document, undefined);
				assert.equal(window, undefined);
			});

			assert.done();
		});

		test('should inject variables', function(assert){
			var value = {prop: 'test'}, copy = {};
			
			inject.scope({assert: assert, value: value, copy: copy}, function(){
				copy.prop = value.prop;
			});

			assert.equal(value.prop, copy.prop);
			assert.done();
		});

		test('should override early scopes with later scopes', function(assert){
			var scope1 = {prop: 'should be overwritten', unique: 'still here'};
			var scope2 = {prop: 'new value'};
			var assertScope = {assert: assert};

			inject.scope([scope1,scope2,assertScope], function(){
				assert.equal(prop, 'new value');
				assert.equal(unique, 'still here');
			});

			assert.done();
		});
	});
});