
/**
 * Dependencies.
 */

var Emitter = require('emitter')

/**
 * Expose `Runner`.
 */

module.exports = Runner;

/**
 * Create a new `Runner`.
 */

function Runner(suites){
  this.suites = suites;
}

/**
 * Mixin `Emitter`.
 */

Emitter(Runner.prototype);

/**
 * Run tests.
 *
 * @return {Runner} for chaining
 * @api public
 */

Runner.prototype.run = function(){
  var self = this
    , suites = this.suites.slice()
    , suite;

  function next(){

    // next suite
    suite = suites.shift();

    // all done
    if (!suite) {
      self.emit('end');
      return self;
    }

    self.emit('suite start', suite);
    suite.start();

    suite.on('test end', function(test){
      self.emit('test end', test);
    });

    suite.on('pass', function(test){
      self.emit('pass', test);
    });

    suite.on('fail', function(test){
      self.emit('fail', test);
    });

    suite.on('end', function(err){
      self.emit('suite end', suite);
      next();
    });

  }

  self.emit('start');
  next();
  return this;
}
