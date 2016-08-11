var suite = require('../crux.test');
var model = require('../crux.model');

suite('crux.model Tests', function(test){

	test('should accept an object as the initial set', function(assert){
		data = {};
		var myModel = model({
			data: data
		});

		var insert = {prop: 'value'};

		myModel.set(insert);

		assert.deepEqual(data, insert);
		assert.done();
	});

	test.suite('model.has Tests', function(test){
		test('has method returns false when a key does not exist', function(assert){
			var myModel = model();
			
			assert.ok(!myModel.has('prop'));
			assert.ok(!myModel.has('this.is.not.a.prop'));
			assert.done();
		});

		test('has method should accept wildcards', function(assert){
			var myModel = model();

			assert.ok(!myModel.has('*'));

			myModel.set('prop', 'stuff');

			myModel.set('obj', {
				prop: {
					test: 'value'
				}
			});

			myModel.set('deep', {
				a: {b: {c: {d: 1}, d: {e: 3}}},
				b: {a: {c: {d: 1}}},
			});

			assert.ok(myModel.has('*'));
			assert.ok(myModel.has('obj.*.test'));
			assert.ok(myModel.has('deep.*.*.d.e'));
			assert.ok(!myModel.has('deep.*.*.d.d'));
			assert.done();
		});
	});

	test.suite('model.set Tests', function(test){
		test('set method adds a value to the model', function(assert){
			var myModel = model();

			myModel.set('prop', 'stuff');
			myModel.set('obj', {
				prop: {
					test: 'value'
				}
			});

			assert.ok(myModel.has('prop'));
			assert.ok(myModel.has('obj.prop.test'));
			assert.done();
		});

		test('set method should not accept wildcards', function(assert){
			var myModel = model();

			try{
				myModel.set('*', 'blah');
				return assert.fail('was able to set *');
			}catch(e){}

			try{
				myModel.set('prop', {});
				myModel.set('prop.*', 'blah');
				return assert.fail('was able to set prop.*');
			}catch(e){}

			try{
				myModel.set('prop.a', {});
				myModel.set('prop.*.a', 'blah');
				return assert.fail('was able to set prop.*.a');
			}catch(e){}

			try{
				myModel.set('*.a', 'blah');
				return assert.fail('was able to set prop.*.a');
			}catch(e){}

			assert.done();
		});

		test('set method should not allow * as a property name', function(assert){
			var myModel = model();

			try{
				myModel.set('prop', {
					'*': 'test'
				});
				return assert.fail('allowed setting of prop.*');
			}catch(e){}

			try{
				myModel.set('prop', {
					a: {
						'*': {
							c: 'test'
						}
					}
				});
				return assert.fail('allowed setting of prop.a.*.c');
			}catch(e){}

			assert.done();
		});

		test('set should also accept a data model without a key', function(assert){
			var myModel = model();

			myModel.set({prop: 'stuff'});
			myModel.set({
				obj: {
					prop: {
						test: 'value'
					}
				}
			});

			assert.ok(myModel.has('prop'));
			assert.ok(myModel.has('obj.prop.test'));
			assert.done();
		});
	});

	test.suite('model.get Tests', function(test){
		test('get method should return null when key does not exists', function(assert){
			var myModel = model();

			assert.strictEqual(myModel.get('prop'), null);
			assert.strictEqual(myModel.get('a.b'), null);
			assert.done();
		});

		test('get method should return value when key exists', function(assert){
			var myModel = model();
			var propVal = 'this is a property';
			var bVal = 1234;

			myModel.set('prop', propVal);
			myModel.set('a', {b: bVal});
			assert.equal(myModel.get('prop'), propVal);
			assert.equal(myModel.get('a.b'), bVal);
			assert.done();
		});

		test('get method should return deep copy of objects', function(assert){
			var myModel = model();
			var bVal = 1234;
			var dVal = 'other';
			var a = {b: bVal, c : {d: dVal}};

			myModel.set('a', a);

			var modelA = myModel.get('a');

			assert.deepEqual(modelA, a);
			assert.notEqual(modelA, a);

			modelA.b = 4321;

			assert.notDeepEqual(modelA, myModel.get('a'));
			assert.done();
		});

		test('get method should return the whole structure when no key', function(assert){
			var myModel = model();
			var bVal = 1234;
			var dVal = 'other';
			var a = {b: bVal, c : {d: dVal}};

			myModel.set('a', a);

			var wholeModel = myModel.get();

			assert.deepEqual(wholeModel.a, a);
			assert.done();
		});
	});

	test.suite('model.ref Tests', function(test){
		test('should return a model of the ref', function(assert){
			var myModel = model();

			myModel.set('a', {
				b: 'c',
				c: {
					d: 'e'
				}
			});

			var ref = myModel.ref('a');

			assert.instanceof(ref.set, Function);
			assert.instanceof(ref.get, Function);
			assert.instanceof(ref.has, Function);
			assert.instanceof(ref.ref, Function);

			assert.deepEqual(ref.get('c'), myModel.get('a.c'));
			assert.done();
		});

		test('should reference the same data as the original model', function(assert){
			var myModel = model();

			myModel.set('a', {
				b: 'c',
				c: {
					d: 'e'
				}
			});

			var ref = myModel.ref('a');
			ref.set('c.d', 'new val');

			assert.equal(ref.get('c.d'), 'new val');
			assert.equal(myModel.get('a.c.d'), 'new val');
			assert.done();
		});

		test('should not allow references to primitives', function(assert){
			var myModel = model();

			myModel.set({
				a: 123,
				b: 'c',
				c: false,
				d: {}
			});

			try{
				myModel.ref('a');
				return assert.fail('allowed ref to number');
			}catch(e){}

			try{
				myModel.ref('b');
				return assert.fail('allowed ref to string');
			}catch(e){}

			try{
				myModel.ref('c');
				return assert.fail('allowed ref to bool');
			}catch(e){}

			try{
				myModel.ref('d');
			}catch(e){
				return assert.fail('did not allow ref to object');
			}

			assert.done();
		});
	});
});