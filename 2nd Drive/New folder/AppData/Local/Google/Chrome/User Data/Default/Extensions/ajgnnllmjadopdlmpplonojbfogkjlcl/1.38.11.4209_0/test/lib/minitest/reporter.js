
/**
 * Expose `Reporter`.
 */

module.exports = Reporter;

/**
 * Make a new `Reporter`.
 *
 * @param {Runner} runner
 */

function Reporter(runner){
	var self = this;

	var tests = []
	  , failures = []
	  , passes = [];

	runner.on('test end', function(test){
		tests.push(test);
	});

	runner.on('pass', function(test){
		passes.push(test);
	});

	runner.on('fail', function(test){
		failures.push(test);
	});

	runner.on('end', function(){
		var obj = {
			  tests: tests.map(clean)
			, failures: failures.map(clean)
			, passes: passes.map(clean)
		};

		console.log(JSON.stringify(obj, null, 2));
	});
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  return {
      title: test.title
		, fullTitle: test.fullTitle()
	  , state: test.state
  }
}
