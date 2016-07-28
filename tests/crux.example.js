var suite = require('../crux.test');
var fs = require('fs');
var cruxFs = require('../crux.fs');

suite('Example Tests', function(test){
	var fileData = {
		num: Math.random(),
		str: 'Hello',
		bool: true
	};

	test.config({
		beforeAll: function(done){
			fs.writeFile('./example.json', JSON.stringify(fileData), function(err){
				if(err) throw err;
				done();
			});
		},
		afterAll: function(done){
			fs.unlink('./example.json', function(err){
				if(err) throw err;
				done();
			});
		},
		beforeEach: function(done){
			console.log('before each test');
			done();
		},
		afterEach: function(done){
			console.log('after each test');
			done();
		},
		timeout: 500
	});

	test('starting test', function(assert){
		setTimeout(assert.done,100);
	});

	test.suite('crux.fs.read Tests', function(test){
		test.config({
			timeout: 1000
		});

		test('should read a file as a promise.', function(assert){
			assert.instanceof(cruxFs.read('./example.json'), Promise);
			assert.done();
		});

		test('should return an error to the catch statement', function(assert){
			cruxFs.read('./not-a-file-at-all.bad').catch(function(err){
				assert.done();
			});
		});

		test('should return file contents to then statement', function(assert){
			cruxFs.read('./example.json').then(function(str){
				var data = JSON.parse(str);
				assert.deepEqual(fileData, data);
				assert.done();
			}).catch(function(err){
				assert.fail(err);
			});
		});
	});

	test('failing test', function(assert){
		setTimeout(assert.fail,100);
	});

	test('failing assert', function(assert){
		assert.equal(1,2);
	});

	test('passing assert with message', function(assert){
		assert.equal(2,2,'The number 2 equals 2');
		assert.done();
	});

	test('timing out test', function(){});

	test('ending test', function(assert){
		setTimeout(assert.done,100);
	});
});