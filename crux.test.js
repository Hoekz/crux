var assert = require('assert');
var noFunc = function(){};
var prom = function(fn){
	return new Promise(fn);
};
var cons = console.log.bind(console);
var wrappedAssert = {};

for(var method in assert){
	wrappedAssert[method] = assert[method];
}

wrappedAssert.instanceof = function(obj, cls, msg){
	msg = msg || typeof obj + ' should be ' + (cls.name || typeof cls);
	assert(obj instanceof cls, msg);
};

wrappedAssert.hasProp = function(obj, prop, msg){
	msg = msg || typeof obj + ' should have prop ' + prop;
	assert(obj.hasOwnProperty(prop), msg);
};

var suites = 0;
var suiteRunner = null;

var suite = function(msg, fn){
	var stats = {
		pass: 0,
		total: 0
	};

	var timeout = 5000, afterAll, beforeEach, afterEach;

	var runner = prom(function(resolve){
		log.header(msg);
		log.indent();
		resolve(wrappedAssert);
	});

	var test = function(msg, fn){
		if(fn.toString().match(/^function \(\)/)){
			log.warn('No parameters in test function. Beware of using the wrong assert object.');
		}
		stats.total++;
		var testBody = function(){
			var assert = wrappedAssert;
			var timer;
			return prom(function(resolve){
				var finished = false;

				assert.done = function(){
					clearTimeout(timer);
					if(!finished){
						stats.pass++;
						finished = true;
						log.pass(msg);
						resolve(assert);
					}else{
						log.warn(msg + ' - Done called after test finished');
					}
				};

				assert.fail = function(reason){
					clearTimeout(timer);
					if(!finished){
						finished = true;
						log.fail(msg, reason);
						resolve(assert);
					}else{
						log.warn(msg + '- Fail called after test finished');
					}
				};

				timer = setTimeout(function(){
					if(!finished){
						log.fail(msg, 'Timeout - ' + timeout + 'ms passed without resolution.');
						resolve(assert);
					}
				}, timeout);

				fn(assert);
			}).catch(function(err){
				clearTimeout(timer);
				log.fail(msg, err, findFile(err.stack));
			});
		}

		runner = runner.then(beforeEach).then(testBody).then(afterEach);
	};

	test['config'] = function(opts){
		timeout = opts.timeout || timeout;

		if(opts['beforeAll'] instanceof Function){
			runner = runner.then(function(assert){
				return prom(function(res){
					opts['beforeAll'](function(){
						res(assert);
					});
				});
			});
		}

		if(opts['afterAll'] instanceof Function){
			afterAll = function(assert){
				return prom(function(res){
					opts['afterAll'](function(){
						res(assert);
					});
				});
			};
		}else{
			afterAll = noFunc;
		}

		if(opts['beforeEach'] instanceof Function){
			beforeEach = function(assert){
				return prom(function(res){
					opts['beforeEach'](function(){
						res(assert);
					});
				});
			}
		}else{
			beforeEach = noFunc;
		}

		if(opts['afterEach'] instanceof Function){
			afterEach = function(assert){
				return prom(function(res){
					opts['afterEach'](function(){
						res(assert);
					});
				});
			}
		}else{
			afterEach = noFunc;
		}
	};

	test['suite'] = function(msg, fn){
		if(fn.toString().match(/^function \(\/?\)/)){
			log.warn('No parameters in suite function. Beware of using the wrong test object.');
		}
		//indent log
		var nestedSuite = function(){
			return suite(msg, fn).then(function(nestedStats){
				stats.total += nestedStats.total;
				stats.pass += nestedStats.pass;
			});
		};

		runner = runner.then(nestedSuite);
	};

	var data = {};
	fn.call(data, test);
	runner = runner.then(afterAll, afterAll);
	runner = runner.then(function(){
		log.unIndent();
		return stats;
	});
	return runner;
};

var log = (function(){
	var self = this, i = 0, needSpace = true;

	var indent = function(){
		return Array(i+1).join('  ');
	};

	self.indent = function(){
		i++;
		needSpace && cons();
		needSpace = false;
	};

	self.unIndent = function(){
		i--;
		needSpace && cons();
		needSpace = false;
	};

	self.header = function(msg){
		needSpace && cons();
		cons('%s\x1b[4m%s\x1b[0m', indent(), msg);
		needSpace = false;
	};

	self.pass = function(msg){
		needSpace = true;
		cons('%s\x1b[32m✓ %s\x1b[0m', indent(), msg);
	};

	self.warn = function(msg){
		needSpace = true;
		cons('%s\x1b[33m! %s\x1b[0m', indent(), msg);
	};

	self.fail = function(msg){
		needSpace = true;
		cons('%s\x1b[31mX %s\x1b[0m', indent(), msg);
		[].forEach.call(arguments, function(m, i){
			if(i && m)
			cons('%s\x1b[31m  - %s\x1b[0m', indent(), m);
		});
	};

	self.stats = function(stats, header){
		header = header || 'Results';
		cons('\x1b[36m====================');
		cons(
			header + ': %d/%d - %d% of tests passed',
			stats.pass,
			stats.total,
			Math.floor(stats.pass*100/stats.total)
		);
		cons('====================\x1b[0m');
	}
	return self;
})();

var findFile = function(stack){
	var file = stack.split('\n')[1];
	var cwd = process.cwd();
	file = file.substr(file.indexOf(cwd) + cwd.length);
	return 'occured at .' + file;
};

var failed = false;
var totalStats = {
	total: 0,
	pass: 0
};

module.exports = function(msg, fn){
	suites++;
	var createSuite = function(){
		return suite(msg, fn).then(function(stats){
			totalStats.total += stats.total;
			totalStats.pass += stats.pass;
			log.stats(stats);
			suites--;
			setTimeout(function(){
				if(stats.pass != stats.total){
					failed = true;
				}

				if(!suites){
					log.stats(totalStats, 'Overall');
					process.exit(failed ? 1 : 0);
				}
			}, 0);
			return stats.pass == stats.total;
		});
	};

	if(!suiteRunner){
		suiteRunner = createSuite();
	}else{
		suiteRunner = suiteRunner.then(createSuite);
	}
};

if(require.main === module){
	var fs = require('fs');
	//is the main process
	fs.readdir('./tests/', function(err, files){
		if(err){
			throw new Error('no ./tests directory');
		}

		files.forEach(function(file){
			if(file.match(/\-test\.js$/))
				require('./tests/' + file);
		});
	});
}