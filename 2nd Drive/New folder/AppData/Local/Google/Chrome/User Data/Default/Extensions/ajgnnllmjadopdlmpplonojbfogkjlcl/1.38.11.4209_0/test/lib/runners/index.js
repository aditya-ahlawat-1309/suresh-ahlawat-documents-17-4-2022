var asyncRunner = require('./async');

exports = module.exports = function(){
  /**
   * Sets the concurrency - the number of tests to run in parrallel
   *
   * @param {Number} num
   * @return {Mocha}
   * @api public
   */
  this.concurrency = function(num){
    this.options.concurrency = parseInt(num, 10) || 1;
    return this;
  }

  /**
   * Run tests and invoke `fn()` when complete.
   *
   * @param {Function} fn
   * @return {Runner}
   * @api public
   */

  this.run = function(fn){
    if (this.files.length) this.loadFiles();
    var suite = this.suite;
    var options = this.options;
    var runner = new asyncRunner(suite);
    var reporter = new this._reporter(runner);
    runner.ignoreLeaks = false !== options.ignoreLeaks;
    runner.asyncOnly = options.asyncOnly;
    if (options.grep) runner.grep(options.grep, options.invert);
    if (options.globals) runner.globals(options.globals);
    if (options.concurrency) runner.concurrency(options.concurrency);
    if (options.growl) this._growl(runner, reporter);
    return runner.run(fn);
  };
}

exports.asyncRunner = asyncRunner;
