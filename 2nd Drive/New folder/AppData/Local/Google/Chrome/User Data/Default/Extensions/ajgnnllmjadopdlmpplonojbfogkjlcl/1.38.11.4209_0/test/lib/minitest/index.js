/**
 * Dependencies.
 */

var Emitter = require('emitter');

/**
 * Expose `Minitest`.
 */

exports = module.exports = Minitest;

/**
 * Expose internals.
 */

exports.Suite = require('./suite');
exports.Runner = require('./runner');
exports.reporters = require('reporters');
exports.Test = require('./test');

/**
 * Setup minitest.
 */

function Minitest(){
	this.suites = [];
}

Emitter(Minitest.prototype);

/**
 * Register a new `suite`
 *
 * @param {String} title
 * @param {Array} tests
 * @return {Suite}
 * @api public
 */

Minitest.prototype.describe = function(title, tests){
	var suite = new exports.Suite(title, tests);
	this.suites.push(suite);
	return suite;
}

/**
 * Run tests.
 *
 * @return {Runner}
 * @api public
 */

Minitest.prototype.run = function(){
	var suites = this.suites.slice();
	var runner = new exports.Runner(suites);
	new exports.reporters.HTML(runner);
	return runner.run();
}

Minitest.prototype.use = function(fn){
  fn(this);
}
