var suite = require('../crux.test');
var fs = require('fs');
var cruxFs = require('../crux.fs');

suite('crux.fs Tests', function(test){
	var fileData = {
		num: Math.random(),
		str: 'Hello',
		bool: true
	};

	test.config({
		beforeAll: function(done){
			fs.writeFile('./test-data.json', JSON.stringify(fileData), function(err){
				if(err) throw err;
				done();
			});
		},
		afterAll: function(done){
			fs.unlink('./test-data.json', function(err){
				if(err) throw err;
				done();
			});
		}
	});

	test.suite('crux.fs.read Tests', function(test){
		test.config({
			timeout: 1000
		});

		test('should read a file as a promise', function(assert){
			assert.instanceof(cruxFs.read('./test-data.json'), Promise);
			assert.done();
		});

		test('should return error to catch statement when file does not exist', function(assert){
			cruxFs.read('./not-a-file-at-all.bad').catch(function(err){
				assert.done();
			});
		});

		test('should return file contents to then statement', function(assert){
			cruxFs.read('./test-data.json').then(function(str){
				var data = JSON.parse(str);
				assert.deepEqual(fileData, data);
				assert.done();
			}).catch(function(err){
				assert.fail(err);
			});
		});
	});

	test.suite('crux.fs.details Tests', function(test){
		var fileStats;
		test.config({
			timeout: 1000,
			beforeAll: function(done){
				fs.stat('./test-data.json', function(err, data){
					fileStats = data;
					done();
				});
			}
		});

		test('should read details of a file as a promise', function(assert){
			assert.instanceof(cruxFs.details('./test-data.json'), Promise);
			assert.done();
		});

		test('should return error to catch statement when file does not exist', function(assert){
			cruxFs.details('./not-a-file-at-all.bad').catch(function(err){
				assert.done();
			});
		});

		test('should return file details to then statement', function(assert){
			cruxFs.details('./test-data.json').then(function(data){
				assert.deepEqual(fileStats, data);
				assert.done();
			}).catch(function(err){
				assert.fail(err);
			});
		});
	});

	test.suite('crux.fs.write Tests', function(test){
		test.config({
			timeout: 1000
		});

		test('should write contents of a file as a promise', function(assert){
			assert.instanceof(cruxFs.write('./test-data.json', ''), Promise);
			assert.done();
		});

		test('should return error to catch statement when file cannot be created', function(assert){
			cruxFs.write('./not/a/file/at/all.bad', '').catch(function(err){
				assert.done();
			});
		});

		test('should return flow to then statement', function(assert){
			cruxFs.write('./test-data.json', '').then(function(){
				assert.done();
			}).catch(function(err){
				assert.fail(err);
			});
		});
	});
});