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
});