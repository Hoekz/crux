var suite = require('../crux.test');
var promise = require('../crux.promise');

suite('crux.promise Tests', function(test){
	test('should return a function that returns a promise', function(assert){
		var wrappedFunc = promise(function(){});

		assert.instanceof(wrappedFunc, Function);
		assert.instanceof(wrappedFunc(), Promise);

		assert.done();
	});

	test('should throw first arg to catch statement if truthy', function(assert){
		var error = {message: 'test error'};
		var wrappedFunc = promise(function(cb){
			cb(error);
		});

		wrappedFunc().then(function(){
			assert.fail('reached then statement');
		}).catch(function(err){
			assert.equal(err, error);
			assert.done();
		});
	});

	test('should hand second arg to then statement if falsy first arg', function(assert){
		var myData = {message: 'my data'};
		var wrappedFunc = promise(function(cb){
			cb(null, myData);
		});

		wrappedFunc().then(function(data){
			assert.equal(data, myData);
			assert.done();
		}).catch(function(){
			assert.fail('reached catch statement');
		});
	});

	test('should allow for multiple arguments in original function', function(assert){
		var myData = {message: 'my data'};
		var wrappedFunc = promise(function(sent, cb){
			cb(null, sent);
		});

		wrappedFunc(myData).then(function(received){
			assert.equal(received, myData);
			assert.done();
		}).catch(function(){
			assert.fail('reached catch statement');
		});
	});

	test.suite('crux.promise.data Tests', function(test){
		test('should return a Promise that resolves the data', function(assert){
			var data = {};
			var received;
			var error = null;
			promise.data(data).then(function(res){
				received = res;
			}).catch(function(err){
				error = err;
			});

			//use setTimeout because promises do not execute
			//immediately but are instead put in the queue.
			setTimeout(function(){
				assert.equal(error, null, 'Reached catch statment');
				assert.equal(received, data, 'Did not receive correct data');
				assert.done();
			}, 0);
		});
	});

	test.suite('crux.promise.map Tests', function(test){
		test('should return a Promise', function(assert){
			var mapRes = promise.map([]);

			assert.instanceof(mapRes, Promise);
			assert.done();
		});

		test('should accept an array of promises', function(assert){
			var array = [1,2,3];
			var promises = array.map(function(e){
				return promise.data(e);
			});
			var mixed = promises.slice().concat(array);

			try{
				promise.map(array);
				return assert.fail('allowed mapping of numeric array');
			}catch(e){}

			try{
				promise.map(mixed);
				return assert.fail('allowed mapping of mixed array');
			}catch(e){}

			try{
				promise.map(promises);
			}catch(e){
				return assert.fail('failed promise mapping');
			}

			assert.done();
		});

		test('should return an array of results in the same order', function(assert){
			var expected = [1, true, {}, new Date()];

			var wrapped = expected.map(function(data){
				return promise.data(data);
			});

			expected.unshift('data');
			wrapped.unshift(new Promise(function(res){
				setTimeout(function(){res('data')}, 10);
			}));

			promise.map(wrapped).then(function(result){
				assert.deepEqual(result, expected);
				assert.done();
			});
		});
	});
});