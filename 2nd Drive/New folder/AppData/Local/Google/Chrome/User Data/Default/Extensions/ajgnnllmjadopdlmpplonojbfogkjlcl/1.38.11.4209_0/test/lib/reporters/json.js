/**
 * Dependencies.
 */

var Base = require('./base')
  , debug = require('debug')('pbci:reporters:json');

/**
 * Expose `Reporter`.
 */

exports = module.exports = JSONReporter;

/**
 * Make a new `Reporter`.
 *
 * @param {Runner} runner
 */

function JSONReporter(runner){
	var self = this;
	Base.apply(this, arguments);

	var tests = []
	  , failures = []
	  , passes = [];

	runner.on('test end', function(test){
		debug(JSON.stringify(clean(test)));
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

		debug(JSON.stringify(obj, null, 2));
	});
}

/**
 * Inherit from `Base`.
 */

JSONReporter.prototype.__proto__ = Base.prototype;

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  var json =  {
      title: test.title
		, fullTitle: test.fullTitle()
	  , state: test.state
		, runs: test.get('runs')
  }

	if(test.err) json.err = test.err.stack || test.err.toString()
	return json;
}
