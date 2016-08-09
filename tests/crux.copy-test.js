var suite = require('../crux.test');
var copy = require('../crux.copy');

suite('crux.copy Tests', function(test){
	test('should perform a deep copy of normal JSON objects', function(assert){
		var original = {
			obj: {
				prop: 1
			},
			array: [
				{
					obj: {
						prop: true
					}
				},
				"string"
			]
		};

		var dataCopy = copy(original);

		assert.notEqual(dataCopy, original);
		assert.deepEqual(dataCopy, original);
		assert.done();
	});

	test('should use an object\'s copy method if provided', function(assert){
		var original = new (function(){
			this.myValue = 'stuff';

			this.copy = function(){
				return {
					myValue: 'other'
				};
			};
		})();

		var dataCopy = copy(original);

		assert.notEqual(dataCopy, original);
		assert.notDeepEqual(dataCopy, original);
		assert.done();
	});
});