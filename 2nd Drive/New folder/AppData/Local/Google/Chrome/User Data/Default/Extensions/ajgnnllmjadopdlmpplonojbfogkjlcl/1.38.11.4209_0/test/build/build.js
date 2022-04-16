
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-autoscale-canvas/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Retina-enable the given `canvas`.\n\
 *\n\
 * @param {Canvas} canvas\n\
 * @return {Canvas}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(canvas){\n\
  var ctx = canvas.getContext('2d');\n\
  var ratio = window.devicePixelRatio || 1;\n\
  if (1 != ratio) {\n\
    canvas.style.width = canvas.width + 'px';\n\
    canvas.style.height = canvas.height + 'px';\n\
    canvas.width *= ratio;\n\
    canvas.height *= ratio;\n\
    ctx.scale(ratio, ratio);\n\
  }\n\
  return canvas;\n\
};//@ sourceURL=component-autoscale-canvas/index.js"
));
require.register("component-progress/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var autoscale = require('autoscale-canvas');\n\
\n\
/**\n\
 * Expose `Progress`.\n\
 */\n\
\n\
module.exports = Progress;\n\
\n\
/**\n\
 * Initialize a new `Progress` indicator.\n\
 */\n\
\n\
function Progress() {\n\
  this.percent = 0;\n\
  this.el = document.createElement('canvas');\n\
  this.ctx = this.el.getContext('2d');\n\
  this.size(50);\n\
  this.fontSize(11);\n\
  this.font('helvetica, arial, sans-serif');\n\
}\n\
\n\
/**\n\
 * Set progress size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.size = function(n){\n\
  this.el.width = n;\n\
  this.el.height = n;\n\
  autoscale(this.el);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set text to `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.text = function(str){\n\
  this._text = str;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set font size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.fontSize = function(n){\n\
  this._fontSize = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set font `family`.\n\
 *\n\
 * @param {String} family\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.font = function(family){\n\
  this._font = family;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Update percentage to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.update = function(n){\n\
  this.percent = n;\n\
  this.draw(this.ctx);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Draw on `ctx`.\n\
 *\n\
 * @param {CanvasRenderingContext2d} ctx\n\
 * @return {Progress}\n\
 * @api private\n\
 */\n\
\n\
Progress.prototype.draw = function(ctx){\n\
  var percent = Math.min(this.percent, 100)\n\
    , ratio = window.devicePixelRatio || 1\n\
    , size = this.el.width / ratio\n\
    , half = size / 2\n\
    , x = half\n\
    , y = half\n\
    , rad = half - 1\n\
    , fontSize = this._fontSize;\n\
\n\
  ctx.font = fontSize + 'px ' + this._font;\n\
\n\
  var angle = Math.PI * 2 * (percent / 100);\n\
  ctx.clearRect(0, 0, size, size);\n\
\n\
  // outer circle\n\
  ctx.strokeStyle = '#9f9f9f';\n\
  ctx.beginPath();\n\
  ctx.arc(x, y, rad, 0, angle, false);\n\
  ctx.stroke();\n\
\n\
  // inner circle\n\
  ctx.strokeStyle = '#eee';\n\
  ctx.beginPath();\n\
  ctx.arc(x, y, rad - 1, 0, angle, true);\n\
  ctx.stroke();\n\
\n\
  // text\n\
  var text = this._text || (percent | 0) + '%'\n\
    , w = ctx.measureText(text).width;\n\
\n\
  ctx.fillText(\n\
      text\n\
    , x - w / 2 + 1\n\
    , y + fontSize / 2 - 1);\n\
\n\
  return this;\n\
};\n\
\n\
//@ sourceURL=component-progress/index.js"
));
require.register("visionmedia-debug/index.js", Function("exports, require, module",
"if ('undefined' == typeof window) {\n\
  module.exports = require('./lib/debug');\n\
} else {\n\
  module.exports = require('./debug');\n\
}\n\
//@ sourceURL=visionmedia-debug/index.js"
));
require.register("visionmedia-debug/debug.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `debug()` as the module.\n\
 */\n\
\n\
module.exports = debug;\n\
\n\
/**\n\
 * Create a debugger with the given `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {Type}\n\
 * @api public\n\
 */\n\
\n\
function debug(name) {\n\
  if (!debug.enabled(name)) return function(){};\n\
\n\
  return function(fmt){\n\
    fmt = coerce(fmt);\n\
\n\
    var curr = new Date;\n\
    var ms = curr - (debug[name] || curr);\n\
    debug[name] = curr;\n\
\n\
    fmt = name\n\
      + ' '\n\
      + fmt\n\
      + ' +' + debug.humanize(ms);\n\
\n\
    // This hackery is required for IE8\n\
    // where `console.log` doesn't have 'apply'\n\
    window.console\n\
      && console.log\n\
      && Function.prototype.apply.call(console.log, console, arguments);\n\
  }\n\
}\n\
\n\
/**\n\
 * The currently active debug mode names.\n\
 */\n\
\n\
debug.names = [];\n\
debug.skips = [];\n\
\n\
/**\n\
 * Enables a debug mode by name. This can include modes\n\
 * separated by a colon and wildcards.\n\
 *\n\
 * @param {String} name\n\
 * @api public\n\
 */\n\
\n\
debug.enable = function(name) {\n\
  try {\n\
    localStorage.debug = name;\n\
  } catch(e){}\n\
\n\
  var split = (name || '').split(/[\\s,]+/)\n\
    , len = split.length;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    name = split[i].replace('*', '.*?');\n\
    if (name[0] === '-') {\n\
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));\n\
    }\n\
    else {\n\
      debug.names.push(new RegExp('^' + name + '$'));\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Disable debug output.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
debug.disable = function(){\n\
  debug.enable('');\n\
};\n\
\n\
/**\n\
 * Humanize the given `ms`.\n\
 *\n\
 * @param {Number} m\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
debug.humanize = function(ms) {\n\
  var sec = 1000\n\
    , min = 60 * 1000\n\
    , hour = 60 * min;\n\
\n\
  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';\n\
  if (ms >= min) return (ms / min).toFixed(1) + 'm';\n\
  if (ms >= sec) return (ms / sec | 0) + 's';\n\
  return ms + 'ms';\n\
};\n\
\n\
/**\n\
 * Returns true if the given mode name is enabled, false otherwise.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
debug.enabled = function(name) {\n\
  for (var i = 0, len = debug.skips.length; i < len; i++) {\n\
    if (debug.skips[i].test(name)) {\n\
      return false;\n\
    }\n\
  }\n\
  for (var i = 0, len = debug.names.length; i < len; i++) {\n\
    if (debug.names[i].test(name)) {\n\
      return true;\n\
    }\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Coerce `val`.\n\
 */\n\
\n\
function coerce(val) {\n\
  if (val instanceof Error) return val.stack || val.message;\n\
  return val;\n\
}\n\
\n\
// persist\n\
\n\
try {\n\
  if (window.localStorage) debug.enable(localStorage.debug);\n\
} catch(e){}\n\
//@ sourceURL=visionmedia-debug/debug.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("moment-moment/moment.js", Function("exports, require, module",
"//! moment.js\n\
//! version : 2.2.1\n\
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors\n\
//! license : MIT\n\
//! momentjs.com\n\
\n\
(function (undefined) {\n\
\n\
    /************************************\n\
        Constants\n\
    ************************************/\n\
\n\
    var moment,\n\
        VERSION = \"2.2.1\",\n\
        round = Math.round, i,\n\
        // internal storage for language config files\n\
        languages = {},\n\
\n\
        // check for nodeJS\n\
        hasModule = (typeof module !== 'undefined' && module.exports),\n\
\n\
        // ASP.NET json date format regex\n\
        aspNetJsonRegex = /^\\/?Date\\((\\-?\\d+)/i,\n\
        aspNetTimeSpanJsonRegex = /(\\-)?(?:(\\d*)\\.)?(\\d+)\\:(\\d+)\\:(\\d+)\\.?(\\d{3})?/,\n\
\n\
        // format tokens\n\
        formattingTokens = /(\\[[^\\[]*\\])|(\\\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,\n\
        localFormattingTokens = /(\\[[^\\[]*\\])|(\\\\)?(LT|LL?L?L?|l{1,4})/g,\n\
\n\
        // parsing token regexes\n\
        parseTokenOneOrTwoDigits = /\\d\\d?/, // 0 - 99\n\
        parseTokenOneToThreeDigits = /\\d{1,3}/, // 0 - 999\n\
        parseTokenThreeDigits = /\\d{3}/, // 000 - 999\n\
        parseTokenFourDigits = /\\d{1,4}/, // 0 - 9999\n\
        parseTokenSixDigits = /[+\\-]?\\d{1,6}/, // -999,999 - 999,999\n\
        parseTokenWord = /[0-9]*['a-z\\u00A0-\\u05FF\\u0700-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]+|[\\u0600-\\u06FF\\/]+(\\s*?[\\u0600-\\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.\n\
        parseTokenTimezone = /Z|[\\+\\-]\\d\\d:?\\d\\d/i, // +00:00 -00:00 +0000 -0000 or Z\n\
        parseTokenT = /T/i, // T (ISO seperator)\n\
        parseTokenTimestampMs = /[\\+\\-]?\\d+(\\.\\d{1,3})?/, // 123456789 123456789.123\n\
\n\
        // preliminary iso regex\n\
        // 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000\n\
        isoRegex = /^\\s*\\d{4}-\\d\\d-\\d\\d((T| )(\\d\\d(:\\d\\d(:\\d\\d(\\.\\d\\d?\\d?)?)?)?)?([\\+\\-]\\d\\d:?\\d\\d)?)?/,\n\
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',\n\
\n\
        // iso time formats and regexes\n\
        isoTimes = [\n\
            ['HH:mm:ss.S', /(T| )\\d\\d:\\d\\d:\\d\\d\\.\\d{1,3}/],\n\
            ['HH:mm:ss', /(T| )\\d\\d:\\d\\d:\\d\\d/],\n\
            ['HH:mm', /(T| )\\d\\d:\\d\\d/],\n\
            ['HH', /(T| )\\d\\d/]\n\
        ],\n\
\n\
        // timezone chunker \"+10:00\" > [\"10\", \"00\"] or \"-1530\" > [\"-15\", \"30\"]\n\
        parseTimezoneChunker = /([\\+\\-]|\\d\\d)/gi,\n\
\n\
        // getter and setter names\n\
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),\n\
        unitMillisecondFactors = {\n\
            'Milliseconds' : 1,\n\
            'Seconds' : 1e3,\n\
            'Minutes' : 6e4,\n\
            'Hours' : 36e5,\n\
            'Days' : 864e5,\n\
            'Months' : 2592e6,\n\
            'Years' : 31536e6\n\
        },\n\
\n\
        unitAliases = {\n\
            ms : 'millisecond',\n\
            s : 'second',\n\
            m : 'minute',\n\
            h : 'hour',\n\
            d : 'day',\n\
            w : 'week',\n\
            W : 'isoweek',\n\
            M : 'month',\n\
            y : 'year'\n\
        },\n\
\n\
        // format function strings\n\
        formatFunctions = {},\n\
\n\
        // tokens to ordinalize and pad\n\
        ordinalizeTokens = 'DDD w W M D d'.split(' '),\n\
        paddedTokens = 'M D H h m s w W'.split(' '),\n\
\n\
        formatTokenFunctions = {\n\
            M    : function () {\n\
                return this.month() + 1;\n\
            },\n\
            MMM  : function (format) {\n\
                return this.lang().monthsShort(this, format);\n\
            },\n\
            MMMM : function (format) {\n\
                return this.lang().months(this, format);\n\
            },\n\
            D    : function () {\n\
                return this.date();\n\
            },\n\
            DDD  : function () {\n\
                return this.dayOfYear();\n\
            },\n\
            d    : function () {\n\
                return this.day();\n\
            },\n\
            dd   : function (format) {\n\
                return this.lang().weekdaysMin(this, format);\n\
            },\n\
            ddd  : function (format) {\n\
                return this.lang().weekdaysShort(this, format);\n\
            },\n\
            dddd : function (format) {\n\
                return this.lang().weekdays(this, format);\n\
            },\n\
            w    : function () {\n\
                return this.week();\n\
            },\n\
            W    : function () {\n\
                return this.isoWeek();\n\
            },\n\
            YY   : function () {\n\
                return leftZeroFill(this.year() % 100, 2);\n\
            },\n\
            YYYY : function () {\n\
                return leftZeroFill(this.year(), 4);\n\
            },\n\
            YYYYY : function () {\n\
                return leftZeroFill(this.year(), 5);\n\
            },\n\
            gg   : function () {\n\
                return leftZeroFill(this.weekYear() % 100, 2);\n\
            },\n\
            gggg : function () {\n\
                return this.weekYear();\n\
            },\n\
            ggggg : function () {\n\
                return leftZeroFill(this.weekYear(), 5);\n\
            },\n\
            GG   : function () {\n\
                return leftZeroFill(this.isoWeekYear() % 100, 2);\n\
            },\n\
            GGGG : function () {\n\
                return this.isoWeekYear();\n\
            },\n\
            GGGGG : function () {\n\
                return leftZeroFill(this.isoWeekYear(), 5);\n\
            },\n\
            e : function () {\n\
                return this.weekday();\n\
            },\n\
            E : function () {\n\
                return this.isoWeekday();\n\
            },\n\
            a    : function () {\n\
                return this.lang().meridiem(this.hours(), this.minutes(), true);\n\
            },\n\
            A    : function () {\n\
                return this.lang().meridiem(this.hours(), this.minutes(), false);\n\
            },\n\
            H    : function () {\n\
                return this.hours();\n\
            },\n\
            h    : function () {\n\
                return this.hours() % 12 || 12;\n\
            },\n\
            m    : function () {\n\
                return this.minutes();\n\
            },\n\
            s    : function () {\n\
                return this.seconds();\n\
            },\n\
            S    : function () {\n\
                return ~~(this.milliseconds() / 100);\n\
            },\n\
            SS   : function () {\n\
                return leftZeroFill(~~(this.milliseconds() / 10), 2);\n\
            },\n\
            SSS  : function () {\n\
                return leftZeroFill(this.milliseconds(), 3);\n\
            },\n\
            Z    : function () {\n\
                var a = -this.zone(),\n\
                    b = \"+\";\n\
                if (a < 0) {\n\
                    a = -a;\n\
                    b = \"-\";\n\
                }\n\
                return b + leftZeroFill(~~(a / 60), 2) + \":\" + leftZeroFill(~~a % 60, 2);\n\
            },\n\
            ZZ   : function () {\n\
                var a = -this.zone(),\n\
                    b = \"+\";\n\
                if (a < 0) {\n\
                    a = -a;\n\
                    b = \"-\";\n\
                }\n\
                return b + leftZeroFill(~~(10 * a / 6), 4);\n\
            },\n\
            z : function () {\n\
                return this.zoneAbbr();\n\
            },\n\
            zz : function () {\n\
                return this.zoneName();\n\
            },\n\
            X    : function () {\n\
                return this.unix();\n\
            }\n\
        };\n\
\n\
    function padToken(func, count) {\n\
        return function (a) {\n\
            return leftZeroFill(func.call(this, a), count);\n\
        };\n\
    }\n\
    function ordinalizeToken(func, period) {\n\
        return function (a) {\n\
            return this.lang().ordinal(func.call(this, a), period);\n\
        };\n\
    }\n\
\n\
    while (ordinalizeTokens.length) {\n\
        i = ordinalizeTokens.pop();\n\
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);\n\
    }\n\
    while (paddedTokens.length) {\n\
        i = paddedTokens.pop();\n\
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);\n\
    }\n\
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);\n\
\n\
\n\
    /************************************\n\
        Constructors\n\
    ************************************/\n\
\n\
    function Language() {\n\
\n\
    }\n\
\n\
    // Moment prototype object\n\
    function Moment(config) {\n\
        extend(this, config);\n\
    }\n\
\n\
    // Duration Constructor\n\
    function Duration(duration) {\n\
        var years = duration.years || duration.year || duration.y || 0,\n\
            months = duration.months || duration.month || duration.M || 0,\n\
            weeks = duration.weeks || duration.week || duration.w || 0,\n\
            days = duration.days || duration.day || duration.d || 0,\n\
            hours = duration.hours || duration.hour || duration.h || 0,\n\
            minutes = duration.minutes || duration.minute || duration.m || 0,\n\
            seconds = duration.seconds || duration.second || duration.s || 0,\n\
            milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;\n\
\n\
        // store reference to input for deterministic cloning\n\
        this._input = duration;\n\
\n\
        // representation for dateAddRemove\n\
        this._milliseconds = +milliseconds +\n\
            seconds * 1e3 + // 1000\n\
            minutes * 6e4 + // 1000 * 60\n\
            hours * 36e5; // 1000 * 60 * 60\n\
        // Because of dateAddRemove treats 24 hours as different from a\n\
        // day when working around DST, we need to store them separately\n\
        this._days = +days +\n\
            weeks * 7;\n\
        // It is impossible translate months into days without knowing\n\
        // which months you are are talking about, so we have to store\n\
        // it separately.\n\
        this._months = +months +\n\
            years * 12;\n\
\n\
        this._data = {};\n\
\n\
        this._bubble();\n\
    }\n\
\n\
\n\
    /************************************\n\
        Helpers\n\
    ************************************/\n\
\n\
\n\
    function extend(a, b) {\n\
        for (var i in b) {\n\
            if (b.hasOwnProperty(i)) {\n\
                a[i] = b[i];\n\
            }\n\
        }\n\
        return a;\n\
    }\n\
\n\
    function absRound(number) {\n\
        if (number < 0) {\n\
            return Math.ceil(number);\n\
        } else {\n\
            return Math.floor(number);\n\
        }\n\
    }\n\
\n\
    // left zero fill a number\n\
    // see http://jsperf.com/left-zero-filling for performance comparison\n\
    function leftZeroFill(number, targetLength) {\n\
        var output = number + '';\n\
        while (output.length < targetLength) {\n\
            output = '0' + output;\n\
        }\n\
        return output;\n\
    }\n\
\n\
    // helper function for _.addTime and _.subtractTime\n\
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {\n\
        var milliseconds = duration._milliseconds,\n\
            days = duration._days,\n\
            months = duration._months,\n\
            minutes,\n\
            hours;\n\
\n\
        if (milliseconds) {\n\
            mom._d.setTime(+mom._d + milliseconds * isAdding);\n\
        }\n\
        // store the minutes and hours so we can restore them\n\
        if (days || months) {\n\
            minutes = mom.minute();\n\
            hours = mom.hour();\n\
        }\n\
        if (days) {\n\
            mom.date(mom.date() + days * isAdding);\n\
        }\n\
        if (months) {\n\
            mom.month(mom.month() + months * isAdding);\n\
        }\n\
        if (milliseconds && !ignoreUpdateOffset) {\n\
            moment.updateOffset(mom);\n\
        }\n\
        // restore the minutes and hours after possibly changing dst\n\
        if (days || months) {\n\
            mom.minute(minutes);\n\
            mom.hour(hours);\n\
        }\n\
    }\n\
\n\
    // check if is an array\n\
    function isArray(input) {\n\
        return Object.prototype.toString.call(input) === '[object Array]';\n\
    }\n\
\n\
    // compare two arrays, return the number of differences\n\
    function compareArrays(array1, array2) {\n\
        var len = Math.min(array1.length, array2.length),\n\
            lengthDiff = Math.abs(array1.length - array2.length),\n\
            diffs = 0,\n\
            i;\n\
        for (i = 0; i < len; i++) {\n\
            if (~~array1[i] !== ~~array2[i]) {\n\
                diffs++;\n\
            }\n\
        }\n\
        return diffs + lengthDiff;\n\
    }\n\
\n\
    function normalizeUnits(units) {\n\
        return units ? unitAliases[units] || units.toLowerCase().replace(/(.)s$/, '$1') : units;\n\
    }\n\
\n\
\n\
    /************************************\n\
        Languages\n\
    ************************************/\n\
\n\
\n\
    extend(Language.prototype, {\n\
\n\
        set : function (config) {\n\
            var prop, i;\n\
            for (i in config) {\n\
                prop = config[i];\n\
                if (typeof prop === 'function') {\n\
                    this[i] = prop;\n\
                } else {\n\
                    this['_' + i] = prop;\n\
                }\n\
            }\n\
        },\n\
\n\
        _months : \"January_February_March_April_May_June_July_August_September_October_November_December\".split(\"_\"),\n\
        months : function (m) {\n\
            return this._months[m.month()];\n\
        },\n\
\n\
        _monthsShort : \"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec\".split(\"_\"),\n\
        monthsShort : function (m) {\n\
            return this._monthsShort[m.month()];\n\
        },\n\
\n\
        monthsParse : function (monthName) {\n\
            var i, mom, regex;\n\
\n\
            if (!this._monthsParse) {\n\
                this._monthsParse = [];\n\
            }\n\
\n\
            for (i = 0; i < 12; i++) {\n\
                // make the regex if we don't have it already\n\
                if (!this._monthsParse[i]) {\n\
                    mom = moment.utc([2000, i]);\n\
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');\n\
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');\n\
                }\n\
                // test the regex\n\
                if (this._monthsParse[i].test(monthName)) {\n\
                    return i;\n\
                }\n\
            }\n\
        },\n\
\n\
        _weekdays : \"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday\".split(\"_\"),\n\
        weekdays : function (m) {\n\
            return this._weekdays[m.day()];\n\
        },\n\
\n\
        _weekdaysShort : \"Sun_Mon_Tue_Wed_Thu_Fri_Sat\".split(\"_\"),\n\
        weekdaysShort : function (m) {\n\
            return this._weekdaysShort[m.day()];\n\
        },\n\
\n\
        _weekdaysMin : \"Su_Mo_Tu_We_Th_Fr_Sa\".split(\"_\"),\n\
        weekdaysMin : function (m) {\n\
            return this._weekdaysMin[m.day()];\n\
        },\n\
\n\
        weekdaysParse : function (weekdayName) {\n\
            var i, mom, regex;\n\
\n\
            if (!this._weekdaysParse) {\n\
                this._weekdaysParse = [];\n\
            }\n\
\n\
            for (i = 0; i < 7; i++) {\n\
                // make the regex if we don't have it already\n\
                if (!this._weekdaysParse[i]) {\n\
                    mom = moment([2000, 1]).day(i);\n\
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');\n\
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');\n\
                }\n\
                // test the regex\n\
                if (this._weekdaysParse[i].test(weekdayName)) {\n\
                    return i;\n\
                }\n\
            }\n\
        },\n\
\n\
        _longDateFormat : {\n\
            LT : \"h:mm A\",\n\
            L : \"MM/DD/YYYY\",\n\
            LL : \"MMMM D YYYY\",\n\
            LLL : \"MMMM D YYYY LT\",\n\
            LLLL : \"dddd, MMMM D YYYY LT\"\n\
        },\n\
        longDateFormat : function (key) {\n\
            var output = this._longDateFormat[key];\n\
            if (!output && this._longDateFormat[key.toUpperCase()]) {\n\
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {\n\
                    return val.slice(1);\n\
                });\n\
                this._longDateFormat[key] = output;\n\
            }\n\
            return output;\n\
        },\n\
\n\
        isPM : function (input) {\n\
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays\n\
            // Using charAt should be more compatible.\n\
            return ((input + '').toLowerCase().charAt(0) === 'p');\n\
        },\n\
\n\
        _meridiemParse : /[ap]\\.?m?\\.?/i,\n\
        meridiem : function (hours, minutes, isLower) {\n\
            if (hours > 11) {\n\
                return isLower ? 'pm' : 'PM';\n\
            } else {\n\
                return isLower ? 'am' : 'AM';\n\
            }\n\
        },\n\
\n\
        _calendar : {\n\
            sameDay : '[Today at] LT',\n\
            nextDay : '[Tomorrow at] LT',\n\
            nextWeek : 'dddd [at] LT',\n\
            lastDay : '[Yesterday at] LT',\n\
            lastWeek : '[Last] dddd [at] LT',\n\
            sameElse : 'L'\n\
        },\n\
        calendar : function (key, mom) {\n\
            var output = this._calendar[key];\n\
            return typeof output === 'function' ? output.apply(mom) : output;\n\
        },\n\
\n\
        _relativeTime : {\n\
            future : \"in %s\",\n\
            past : \"%s ago\",\n\
            s : \"a few seconds\",\n\
            m : \"a minute\",\n\
            mm : \"%d minutes\",\n\
            h : \"an hour\",\n\
            hh : \"%d hours\",\n\
            d : \"a day\",\n\
            dd : \"%d days\",\n\
            M : \"a month\",\n\
            MM : \"%d months\",\n\
            y : \"a year\",\n\
            yy : \"%d years\"\n\
        },\n\
        relativeTime : function (number, withoutSuffix, string, isFuture) {\n\
            var output = this._relativeTime[string];\n\
            return (typeof output === 'function') ?\n\
                output(number, withoutSuffix, string, isFuture) :\n\
                output.replace(/%d/i, number);\n\
        },\n\
        pastFuture : function (diff, output) {\n\
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];\n\
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);\n\
        },\n\
\n\
        ordinal : function (number) {\n\
            return this._ordinal.replace(\"%d\", number);\n\
        },\n\
        _ordinal : \"%d\",\n\
\n\
        preparse : function (string) {\n\
            return string;\n\
        },\n\
\n\
        postformat : function (string) {\n\
            return string;\n\
        },\n\
\n\
        week : function (mom) {\n\
            return weekOfYear(mom, this._week.dow, this._week.doy).week;\n\
        },\n\
        _week : {\n\
            dow : 0, // Sunday is the first day of the week.\n\
            doy : 6  // The week that contains Jan 1st is the first week of the year.\n\
        }\n\
    });\n\
\n\
    // Loads a language definition into the `languages` cache.  The function\n\
    // takes a key and optionally values.  If not in the browser and no values\n\
    // are provided, it will load the language file module.  As a convenience,\n\
    // this function also returns the language values.\n\
    function loadLang(key, values) {\n\
        values.abbr = key;\n\
        if (!languages[key]) {\n\
            languages[key] = new Language();\n\
        }\n\
        languages[key].set(values);\n\
        return languages[key];\n\
    }\n\
\n\
    // Remove a language from the `languages` cache. Mostly useful in tests.\n\
    function unloadLang(key) {\n\
        delete languages[key];\n\
    }\n\
\n\
    // Determines which language definition to use and returns it.\n\
    //\n\
    // With no parameters, it will return the global language.  If you\n\
    // pass in a language key, such as 'en', it will return the\n\
    // definition for 'en', so long as 'en' has already been loaded using\n\
    // moment.lang.\n\
    function getLangDefinition(key) {\n\
        if (!key) {\n\
            return moment.fn._lang;\n\
        }\n\
        if (!languages[key] && hasModule) {\n\
            try {\n\
                require('./lang/' + key);\n\
            } catch (e) {\n\
                // call with no params to set to default\n\
                return moment.fn._lang;\n\
            }\n\
        }\n\
        return languages[key] || moment.fn._lang;\n\
    }\n\
\n\
\n\
    /************************************\n\
        Formatting\n\
    ************************************/\n\
\n\
\n\
    function removeFormattingTokens(input) {\n\
        if (input.match(/\\[.*\\]/)) {\n\
            return input.replace(/^\\[|\\]$/g, \"\");\n\
        }\n\
        return input.replace(/\\\\/g, \"\");\n\
    }\n\
\n\
    function makeFormatFunction(format) {\n\
        var array = format.match(formattingTokens), i, length;\n\
\n\
        for (i = 0, length = array.length; i < length; i++) {\n\
            if (formatTokenFunctions[array[i]]) {\n\
                array[i] = formatTokenFunctions[array[i]];\n\
            } else {\n\
                array[i] = removeFormattingTokens(array[i]);\n\
            }\n\
        }\n\
\n\
        return function (mom) {\n\
            var output = \"\";\n\
            for (i = 0; i < length; i++) {\n\
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];\n\
            }\n\
            return output;\n\
        };\n\
    }\n\
\n\
    // format date using native date object\n\
    function formatMoment(m, format) {\n\
\n\
        format = expandFormat(format, m.lang());\n\
\n\
        if (!formatFunctions[format]) {\n\
            formatFunctions[format] = makeFormatFunction(format);\n\
        }\n\
\n\
        return formatFunctions[format](m);\n\
    }\n\
\n\
    function expandFormat(format, lang) {\n\
        var i = 5;\n\
\n\
        function replaceLongDateFormatTokens(input) {\n\
            return lang.longDateFormat(input) || input;\n\
        }\n\
\n\
        while (i-- && (localFormattingTokens.lastIndex = 0,\n\
                    localFormattingTokens.test(format))) {\n\
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);\n\
        }\n\
\n\
        return format;\n\
    }\n\
\n\
\n\
    /************************************\n\
        Parsing\n\
    ************************************/\n\
\n\
\n\
    // get the regex to find the next token\n\
    function getParseRegexForToken(token, config) {\n\
        switch (token) {\n\
        case 'DDDD':\n\
            return parseTokenThreeDigits;\n\
        case 'YYYY':\n\
            return parseTokenFourDigits;\n\
        case 'YYYYY':\n\
            return parseTokenSixDigits;\n\
        case 'S':\n\
        case 'SS':\n\
        case 'SSS':\n\
        case 'DDD':\n\
            return parseTokenOneToThreeDigits;\n\
        case 'MMM':\n\
        case 'MMMM':\n\
        case 'dd':\n\
        case 'ddd':\n\
        case 'dddd':\n\
            return parseTokenWord;\n\
        case 'a':\n\
        case 'A':\n\
            return getLangDefinition(config._l)._meridiemParse;\n\
        case 'X':\n\
            return parseTokenTimestampMs;\n\
        case 'Z':\n\
        case 'ZZ':\n\
            return parseTokenTimezone;\n\
        case 'T':\n\
            return parseTokenT;\n\
        case 'MM':\n\
        case 'DD':\n\
        case 'YY':\n\
        case 'HH':\n\
        case 'hh':\n\
        case 'mm':\n\
        case 'ss':\n\
        case 'M':\n\
        case 'D':\n\
        case 'd':\n\
        case 'H':\n\
        case 'h':\n\
        case 'm':\n\
        case 's':\n\
            return parseTokenOneOrTwoDigits;\n\
        default :\n\
            return new RegExp(token.replace('\\\\', ''));\n\
        }\n\
    }\n\
\n\
    function timezoneMinutesFromString(string) {\n\
        var tzchunk = (parseTokenTimezone.exec(string) || [])[0],\n\
            parts = (tzchunk + '').match(parseTimezoneChunker) || ['-', 0, 0],\n\
            minutes = +(parts[1] * 60) + ~~parts[2];\n\
\n\
        return parts[0] === '+' ? -minutes : minutes;\n\
    }\n\
\n\
    // function to convert string input to date\n\
    function addTimeToArrayFromToken(token, input, config) {\n\
        var a, datePartArray = config._a;\n\
\n\
        switch (token) {\n\
        // MONTH\n\
        case 'M' : // fall through to MM\n\
        case 'MM' :\n\
            if (input != null) {\n\
                datePartArray[1] = ~~input - 1;\n\
            }\n\
            break;\n\
        case 'MMM' : // fall through to MMMM\n\
        case 'MMMM' :\n\
            a = getLangDefinition(config._l).monthsParse(input);\n\
            // if we didn't find a month name, mark the date as invalid.\n\
            if (a != null) {\n\
                datePartArray[1] = a;\n\
            } else {\n\
                config._isValid = false;\n\
            }\n\
            break;\n\
        // DAY OF MONTH\n\
        case 'D' : // fall through to DD\n\
        case 'DD' :\n\
            if (input != null) {\n\
                datePartArray[2] = ~~input;\n\
            }\n\
            break;\n\
        // DAY OF YEAR\n\
        case 'DDD' : // fall through to DDDD\n\
        case 'DDDD' :\n\
            if (input != null) {\n\
                datePartArray[1] = 0;\n\
                datePartArray[2] = ~~input;\n\
            }\n\
            break;\n\
        // YEAR\n\
        case 'YY' :\n\
            datePartArray[0] = ~~input + (~~input > 68 ? 1900 : 2000);\n\
            break;\n\
        case 'YYYY' :\n\
        case 'YYYYY' :\n\
            datePartArray[0] = ~~input;\n\
            break;\n\
        // AM / PM\n\
        case 'a' : // fall through to A\n\
        case 'A' :\n\
            config._isPm = getLangDefinition(config._l).isPM(input);\n\
            break;\n\
        // 24 HOUR\n\
        case 'H' : // fall through to hh\n\
        case 'HH' : // fall through to hh\n\
        case 'h' : // fall through to hh\n\
        case 'hh' :\n\
            datePartArray[3] = ~~input;\n\
            break;\n\
        // MINUTE\n\
        case 'm' : // fall through to mm\n\
        case 'mm' :\n\
            datePartArray[4] = ~~input;\n\
            break;\n\
        // SECOND\n\
        case 's' : // fall through to ss\n\
        case 'ss' :\n\
            datePartArray[5] = ~~input;\n\
            break;\n\
        // MILLISECOND\n\
        case 'S' :\n\
        case 'SS' :\n\
        case 'SSS' :\n\
            datePartArray[6] = ~~ (('0.' + input) * 1000);\n\
            break;\n\
        // UNIX TIMESTAMP WITH MS\n\
        case 'X':\n\
            config._d = new Date(parseFloat(input) * 1000);\n\
            break;\n\
        // TIMEZONE\n\
        case 'Z' : // fall through to ZZ\n\
        case 'ZZ' :\n\
            config._useUTC = true;\n\
            config._tzm = timezoneMinutesFromString(input);\n\
            break;\n\
        }\n\
\n\
        // if the input is null, the date is not valid\n\
        if (input == null) {\n\
            config._isValid = false;\n\
        }\n\
    }\n\
\n\
    // convert an array to a date.\n\
    // the array should mirror the parameters below\n\
    // note: all values past the year are optional and will default to the lowest possible value.\n\
    // [year, month, day , hour, minute, second, millisecond]\n\
    function dateFromArray(config) {\n\
        var i, date, input = [], currentDate;\n\
\n\
        if (config._d) {\n\
            return;\n\
        }\n\
\n\
        // Default to current date.\n\
        // * if no year, month, day of month are given, default to today\n\
        // * if day of month is given, default month and year\n\
        // * if month is given, default only year\n\
        // * if year is given, don't default anything\n\
        currentDate = currentDateArray(config);\n\
        for (i = 0; i < 3 && config._a[i] == null; ++i) {\n\
            config._a[i] = input[i] = currentDate[i];\n\
        }\n\
\n\
        // Zero out whatever was not defaulted, including time\n\
        for (; i < 7; i++) {\n\
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];\n\
        }\n\
\n\
        // add the offsets to the time to be parsed so that we can have a clean array for checking isValid\n\
        input[3] += ~~((config._tzm || 0) / 60);\n\
        input[4] += ~~((config._tzm || 0) % 60);\n\
\n\
        date = new Date(0);\n\
\n\
        if (config._useUTC) {\n\
            date.setUTCFullYear(input[0], input[1], input[2]);\n\
            date.setUTCHours(input[3], input[4], input[5], input[6]);\n\
        } else {\n\
            date.setFullYear(input[0], input[1], input[2]);\n\
            date.setHours(input[3], input[4], input[5], input[6]);\n\
        }\n\
\n\
        config._d = date;\n\
    }\n\
\n\
    function dateFromObject(config) {\n\
        var o = config._i;\n\
\n\
        if (config._d) {\n\
            return;\n\
        }\n\
\n\
        config._a = [\n\
            o.years || o.year || o.y,\n\
            o.months || o.month || o.M,\n\
            o.days || o.day || o.d,\n\
            o.hours || o.hour || o.h,\n\
            o.minutes || o.minute || o.m,\n\
            o.seconds || o.second || o.s,\n\
            o.milliseconds || o.millisecond || o.ms\n\
        ];\n\
\n\
        dateFromArray(config);\n\
    }\n\
\n\
    function currentDateArray(config) {\n\
        var now = new Date();\n\
        if (config._useUTC) {\n\
            return [\n\
                now.getUTCFullYear(),\n\
                now.getUTCMonth(),\n\
                now.getUTCDate()\n\
            ];\n\
        } else {\n\
            return [now.getFullYear(), now.getMonth(), now.getDate()];\n\
        }\n\
    }\n\
\n\
    // date from string and format string\n\
    function makeDateFromStringAndFormat(config) {\n\
        // This array is used to make a Date, either with `new Date` or `Date.UTC`\n\
        var lang = getLangDefinition(config._l),\n\
            string = '' + config._i,\n\
            i, parsedInput, tokens;\n\
\n\
        tokens = expandFormat(config._f, lang).match(formattingTokens);\n\
\n\
        config._a = [];\n\
\n\
        for (i = 0; i < tokens.length; i++) {\n\
            parsedInput = (getParseRegexForToken(tokens[i], config).exec(string) || [])[0];\n\
            if (parsedInput) {\n\
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);\n\
            }\n\
            // don't parse if its not a known token\n\
            if (formatTokenFunctions[tokens[i]]) {\n\
                addTimeToArrayFromToken(tokens[i], parsedInput, config);\n\
            }\n\
        }\n\
\n\
        // add remaining unparsed input to the string\n\
        if (string) {\n\
            config._il = string;\n\
        }\n\
\n\
        // handle am pm\n\
        if (config._isPm && config._a[3] < 12) {\n\
            config._a[3] += 12;\n\
        }\n\
        // if is 12 am, change hours to 0\n\
        if (config._isPm === false && config._a[3] === 12) {\n\
            config._a[3] = 0;\n\
        }\n\
        // return\n\
        dateFromArray(config);\n\
    }\n\
\n\
    // date from string and array of format strings\n\
    function makeDateFromStringAndArray(config) {\n\
        var tempConfig,\n\
            tempMoment,\n\
            bestMoment,\n\
\n\
            scoreToBeat = 99,\n\
            i,\n\
            currentScore;\n\
\n\
        for (i = 0; i < config._f.length; i++) {\n\
            tempConfig = extend({}, config);\n\
            tempConfig._f = config._f[i];\n\
            makeDateFromStringAndFormat(tempConfig);\n\
            tempMoment = new Moment(tempConfig);\n\
\n\
            currentScore = compareArrays(tempConfig._a, tempMoment.toArray());\n\
\n\
            // if there is any input that was not parsed\n\
            // add a penalty for that format\n\
            if (tempMoment._il) {\n\
                currentScore += tempMoment._il.length;\n\
            }\n\
\n\
            if (currentScore < scoreToBeat) {\n\
                scoreToBeat = currentScore;\n\
                bestMoment = tempMoment;\n\
            }\n\
        }\n\
\n\
        extend(config, bestMoment);\n\
    }\n\
\n\
    // date from iso format\n\
    function makeDateFromString(config) {\n\
        var i,\n\
            string = config._i,\n\
            match = isoRegex.exec(string);\n\
\n\
        if (match) {\n\
            // match[2] should be \"T\" or undefined\n\
            config._f = 'YYYY-MM-DD' + (match[2] || \" \");\n\
            for (i = 0; i < 4; i++) {\n\
                if (isoTimes[i][1].exec(string)) {\n\
                    config._f += isoTimes[i][0];\n\
                    break;\n\
                }\n\
            }\n\
            if (parseTokenTimezone.exec(string)) {\n\
                config._f += \" Z\";\n\
            }\n\
            makeDateFromStringAndFormat(config);\n\
        } else {\n\
            config._d = new Date(string);\n\
        }\n\
    }\n\
\n\
    function makeDateFromInput(config) {\n\
        var input = config._i,\n\
            matched = aspNetJsonRegex.exec(input);\n\
\n\
        if (input === undefined) {\n\
            config._d = new Date();\n\
        } else if (matched) {\n\
            config._d = new Date(+matched[1]);\n\
        } else if (typeof input === 'string') {\n\
            makeDateFromString(config);\n\
        } else if (isArray(input)) {\n\
            config._a = input.slice(0);\n\
            dateFromArray(config);\n\
        } else if (input instanceof Date) {\n\
            config._d = new Date(+input);\n\
        } else if (typeof(input) === 'object') {\n\
            dateFromObject(config);\n\
        } else {\n\
            config._d = new Date(input);\n\
        }\n\
    }\n\
\n\
\n\
    /************************************\n\
        Relative Time\n\
    ************************************/\n\
\n\
\n\
    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize\n\
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {\n\
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);\n\
    }\n\
\n\
    function relativeTime(milliseconds, withoutSuffix, lang) {\n\
        var seconds = round(Math.abs(milliseconds) / 1000),\n\
            minutes = round(seconds / 60),\n\
            hours = round(minutes / 60),\n\
            days = round(hours / 24),\n\
            years = round(days / 365),\n\
            args = seconds < 45 && ['s', seconds] ||\n\
                minutes === 1 && ['m'] ||\n\
                minutes < 45 && ['mm', minutes] ||\n\
                hours === 1 && ['h'] ||\n\
                hours < 22 && ['hh', hours] ||\n\
                days === 1 && ['d'] ||\n\
                days <= 25 && ['dd', days] ||\n\
                days <= 45 && ['M'] ||\n\
                days < 345 && ['MM', round(days / 30)] ||\n\
                years === 1 && ['y'] || ['yy', years];\n\
        args[2] = withoutSuffix;\n\
        args[3] = milliseconds > 0;\n\
        args[4] = lang;\n\
        return substituteTimeAgo.apply({}, args);\n\
    }\n\
\n\
\n\
    /************************************\n\
        Week of Year\n\
    ************************************/\n\
\n\
\n\
    // firstDayOfWeek       0 = sun, 6 = sat\n\
    //                      the day of the week that starts the week\n\
    //                      (usually sunday or monday)\n\
    // firstDayOfWeekOfYear 0 = sun, 6 = sat\n\
    //                      the first week is the week that contains the first\n\
    //                      of this day of the week\n\
    //                      (eg. ISO weeks use thursday (4))\n\
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {\n\
        var end = firstDayOfWeekOfYear - firstDayOfWeek,\n\
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),\n\
            adjustedMoment;\n\
\n\
\n\
        if (daysToDayOfWeek > end) {\n\
            daysToDayOfWeek -= 7;\n\
        }\n\
\n\
        if (daysToDayOfWeek < end - 7) {\n\
            daysToDayOfWeek += 7;\n\
        }\n\
\n\
        adjustedMoment = moment(mom).add('d', daysToDayOfWeek);\n\
        return {\n\
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),\n\
            year: adjustedMoment.year()\n\
        };\n\
    }\n\
\n\
\n\
    /************************************\n\
        Top Level Functions\n\
    ************************************/\n\
\n\
    function makeMoment(config) {\n\
        var input = config._i,\n\
            format = config._f;\n\
\n\
        if (input === null || input === '') {\n\
            return null;\n\
        }\n\
\n\
        if (typeof input === 'string') {\n\
            config._i = input = getLangDefinition().preparse(input);\n\
        }\n\
\n\
        if (moment.isMoment(input)) {\n\
            config = extend({}, input);\n\
            config._d = new Date(+input._d);\n\
        } else if (format) {\n\
            if (isArray(format)) {\n\
                makeDateFromStringAndArray(config);\n\
            } else {\n\
                makeDateFromStringAndFormat(config);\n\
            }\n\
        } else {\n\
            makeDateFromInput(config);\n\
        }\n\
\n\
        return new Moment(config);\n\
    }\n\
\n\
    moment = function (input, format, lang) {\n\
        return makeMoment({\n\
            _i : input,\n\
            _f : format,\n\
            _l : lang,\n\
            _isUTC : false\n\
        });\n\
    };\n\
\n\
    // creating with utc\n\
    moment.utc = function (input, format, lang) {\n\
        return makeMoment({\n\
            _useUTC : true,\n\
            _isUTC : true,\n\
            _l : lang,\n\
            _i : input,\n\
            _f : format\n\
        }).utc();\n\
    };\n\
\n\
    // creating with unix timestamp (in seconds)\n\
    moment.unix = function (input) {\n\
        return moment(input * 1000);\n\
    };\n\
\n\
    // duration\n\
    moment.duration = function (input, key) {\n\
        var isDuration = moment.isDuration(input),\n\
            isNumber = (typeof input === 'number'),\n\
            duration = (isDuration ? input._input : (isNumber ? {} : input)),\n\
            matched = aspNetTimeSpanJsonRegex.exec(input),\n\
            sign,\n\
            ret;\n\
\n\
        if (isNumber) {\n\
            if (key) {\n\
                duration[key] = input;\n\
            } else {\n\
                duration.milliseconds = input;\n\
            }\n\
        } else if (matched) {\n\
            sign = (matched[1] === \"-\") ? -1 : 1;\n\
            duration = {\n\
                y: 0,\n\
                d: ~~matched[2] * sign,\n\
                h: ~~matched[3] * sign,\n\
                m: ~~matched[4] * sign,\n\
                s: ~~matched[5] * sign,\n\
                ms: ~~matched[6] * sign\n\
            };\n\
        }\n\
\n\
        ret = new Duration(duration);\n\
\n\
        if (isDuration && input.hasOwnProperty('_lang')) {\n\
            ret._lang = input._lang;\n\
        }\n\
\n\
        return ret;\n\
    };\n\
\n\
    // version number\n\
    moment.version = VERSION;\n\
\n\
    // default format\n\
    moment.defaultFormat = isoFormat;\n\
\n\
    // This function will be called whenever a moment is mutated.\n\
    // It is intended to keep the offset in sync with the timezone.\n\
    moment.updateOffset = function () {};\n\
\n\
    // This function will load languages and then set the global language.  If\n\
    // no arguments are passed in, it will simply return the current global\n\
    // language key.\n\
    moment.lang = function (key, values) {\n\
        if (!key) {\n\
            return moment.fn._lang._abbr;\n\
        }\n\
        key = key.toLowerCase();\n\
        key = key.replace('_', '-');\n\
        if (values) {\n\
            loadLang(key, values);\n\
        } else if (values === null) {\n\
            unloadLang(key);\n\
            key = 'en';\n\
        } else if (!languages[key]) {\n\
            getLangDefinition(key);\n\
        }\n\
        moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);\n\
    };\n\
\n\
    // returns language data\n\
    moment.langData = function (key) {\n\
        if (key && key._lang && key._lang._abbr) {\n\
            key = key._lang._abbr;\n\
        }\n\
        return getLangDefinition(key);\n\
    };\n\
\n\
    // compare moment object\n\
    moment.isMoment = function (obj) {\n\
        return obj instanceof Moment;\n\
    };\n\
\n\
    // for typechecking Duration objects\n\
    moment.isDuration = function (obj) {\n\
        return obj instanceof Duration;\n\
    };\n\
\n\
\n\
    /************************************\n\
        Moment Prototype\n\
    ************************************/\n\
\n\
\n\
    extend(moment.fn = Moment.prototype, {\n\
\n\
        clone : function () {\n\
            return moment(this);\n\
        },\n\
\n\
        valueOf : function () {\n\
            return +this._d + ((this._offset || 0) * 60000);\n\
        },\n\
\n\
        unix : function () {\n\
            return Math.floor(+this / 1000);\n\
        },\n\
\n\
        toString : function () {\n\
            return this.format(\"ddd MMM DD YYYY HH:mm:ss [GMT]ZZ\");\n\
        },\n\
\n\
        toDate : function () {\n\
            return this._offset ? new Date(+this) : this._d;\n\
        },\n\
\n\
        toISOString : function () {\n\
            return formatMoment(moment(this).utc(), 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');\n\
        },\n\
\n\
        toArray : function () {\n\
            var m = this;\n\
            return [\n\
                m.year(),\n\
                m.month(),\n\
                m.date(),\n\
                m.hours(),\n\
                m.minutes(),\n\
                m.seconds(),\n\
                m.milliseconds()\n\
            ];\n\
        },\n\
\n\
        isValid : function () {\n\
            if (this._isValid == null) {\n\
                if (this._a) {\n\
                    this._isValid = !compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray());\n\
                } else {\n\
                    this._isValid = !isNaN(this._d.getTime());\n\
                }\n\
            }\n\
            return !!this._isValid;\n\
        },\n\
\n\
        invalidAt: function () {\n\
            var i, arr1 = this._a, arr2 = (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray();\n\
            for (i = 6; i >= 0 && arr1[i] === arr2[i]; --i) {\n\
                // empty loop body\n\
            }\n\
            return i;\n\
        },\n\
\n\
        utc : function () {\n\
            return this.zone(0);\n\
        },\n\
\n\
        local : function () {\n\
            this.zone(0);\n\
            this._isUTC = false;\n\
            return this;\n\
        },\n\
\n\
        format : function (inputString) {\n\
            var output = formatMoment(this, inputString || moment.defaultFormat);\n\
            return this.lang().postformat(output);\n\
        },\n\
\n\
        add : function (input, val) {\n\
            var dur;\n\
            // switch args to support add('s', 1) and add(1, 's')\n\
            if (typeof input === 'string') {\n\
                dur = moment.duration(+val, input);\n\
            } else {\n\
                dur = moment.duration(input, val);\n\
            }\n\
            addOrSubtractDurationFromMoment(this, dur, 1);\n\
            return this;\n\
        },\n\
\n\
        subtract : function (input, val) {\n\
            var dur;\n\
            // switch args to support subtract('s', 1) and subtract(1, 's')\n\
            if (typeof input === 'string') {\n\
                dur = moment.duration(+val, input);\n\
            } else {\n\
                dur = moment.duration(input, val);\n\
            }\n\
            addOrSubtractDurationFromMoment(this, dur, -1);\n\
            return this;\n\
        },\n\
\n\
        diff : function (input, units, asFloat) {\n\
            var that = this._isUTC ? moment(input).zone(this._offset || 0) : moment(input).local(),\n\
                zoneDiff = (this.zone() - that.zone()) * 6e4,\n\
                diff, output;\n\
\n\
            units = normalizeUnits(units);\n\
\n\
            if (units === 'year' || units === 'month') {\n\
                // average number of days in the months in the given dates\n\
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2\n\
                // difference in months\n\
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());\n\
                // adjust by taking difference in days, average number of days\n\
                // and dst in the given months.\n\
                output += ((this - moment(this).startOf('month')) -\n\
                        (that - moment(that).startOf('month'))) / diff;\n\
                // same as above but with zones, to negate all dst\n\
                output -= ((this.zone() - moment(this).startOf('month').zone()) -\n\
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;\n\
                if (units === 'year') {\n\
                    output = output / 12;\n\
                }\n\
            } else {\n\
                diff = (this - that);\n\
                output = units === 'second' ? diff / 1e3 : // 1000\n\
                    units === 'minute' ? diff / 6e4 : // 1000 * 60\n\
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60\n\
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst\n\
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst\n\
                    diff;\n\
            }\n\
            return asFloat ? output : absRound(output);\n\
        },\n\
\n\
        from : function (time, withoutSuffix) {\n\
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);\n\
        },\n\
\n\
        fromNow : function (withoutSuffix) {\n\
            return this.from(moment(), withoutSuffix);\n\
        },\n\
\n\
        calendar : function () {\n\
            var diff = this.diff(moment().zone(this.zone()).startOf('day'), 'days', true),\n\
                format = diff < -6 ? 'sameElse' :\n\
                diff < -1 ? 'lastWeek' :\n\
                diff < 0 ? 'lastDay' :\n\
                diff < 1 ? 'sameDay' :\n\
                diff < 2 ? 'nextDay' :\n\
                diff < 7 ? 'nextWeek' : 'sameElse';\n\
            return this.format(this.lang().calendar(format, this));\n\
        },\n\
\n\
        isLeapYear : function () {\n\
            var year = this.year();\n\
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;\n\
        },\n\
\n\
        isDST : function () {\n\
            return (this.zone() < this.clone().month(0).zone() ||\n\
                this.zone() < this.clone().month(5).zone());\n\
        },\n\
\n\
        day : function (input) {\n\
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();\n\
            if (input != null) {\n\
                if (typeof input === 'string') {\n\
                    input = this.lang().weekdaysParse(input);\n\
                    if (typeof input !== 'number') {\n\
                        return this;\n\
                    }\n\
                }\n\
                return this.add({ d : input - day });\n\
            } else {\n\
                return day;\n\
            }\n\
        },\n\
\n\
        month : function (input) {\n\
            var utc = this._isUTC ? 'UTC' : '',\n\
                dayOfMonth;\n\
\n\
            if (input != null) {\n\
                if (typeof input === 'string') {\n\
                    input = this.lang().monthsParse(input);\n\
                    if (typeof input !== 'number') {\n\
                        return this;\n\
                    }\n\
                }\n\
\n\
                dayOfMonth = this.date();\n\
                this.date(1);\n\
                this._d['set' + utc + 'Month'](input);\n\
                this.date(Math.min(dayOfMonth, this.daysInMonth()));\n\
\n\
                moment.updateOffset(this);\n\
                return this;\n\
            } else {\n\
                return this._d['get' + utc + 'Month']();\n\
            }\n\
        },\n\
\n\
        startOf: function (units) {\n\
            units = normalizeUnits(units);\n\
            // the following switch intentionally omits break keywords\n\
            // to utilize falling through the cases.\n\
            switch (units) {\n\
            case 'year':\n\
                this.month(0);\n\
                /* falls through */\n\
            case 'month':\n\
                this.date(1);\n\
                /* falls through */\n\
            case 'week':\n\
            case 'isoweek':\n\
            case 'day':\n\
                this.hours(0);\n\
                /* falls through */\n\
            case 'hour':\n\
                this.minutes(0);\n\
                /* falls through */\n\
            case 'minute':\n\
                this.seconds(0);\n\
                /* falls through */\n\
            case 'second':\n\
                this.milliseconds(0);\n\
                /* falls through */\n\
            }\n\
\n\
            // weeks are a special case\n\
            if (units === 'week') {\n\
                this.weekday(0);\n\
            } else if (units === 'isoweek') {\n\
                this.isoWeekday(1);\n\
            }\n\
\n\
            return this;\n\
        },\n\
\n\
        endOf: function (units) {\n\
            units = normalizeUnits(units);\n\
            return this.startOf(units).add((units === 'isoweek' ? 'week' : units), 1).subtract('ms', 1);\n\
        },\n\
\n\
        isAfter: function (input, units) {\n\
            units = typeof units !== 'undefined' ? units : 'millisecond';\n\
            return +this.clone().startOf(units) > +moment(input).startOf(units);\n\
        },\n\
\n\
        isBefore: function (input, units) {\n\
            units = typeof units !== 'undefined' ? units : 'millisecond';\n\
            return +this.clone().startOf(units) < +moment(input).startOf(units);\n\
        },\n\
\n\
        isSame: function (input, units) {\n\
            units = typeof units !== 'undefined' ? units : 'millisecond';\n\
            return +this.clone().startOf(units) === +moment(input).startOf(units);\n\
        },\n\
\n\
        min: function (other) {\n\
            other = moment.apply(null, arguments);\n\
            return other < this ? this : other;\n\
        },\n\
\n\
        max: function (other) {\n\
            other = moment.apply(null, arguments);\n\
            return other > this ? this : other;\n\
        },\n\
\n\
        zone : function (input) {\n\
            var offset = this._offset || 0;\n\
            if (input != null) {\n\
                if (typeof input === \"string\") {\n\
                    input = timezoneMinutesFromString(input);\n\
                }\n\
                if (Math.abs(input) < 16) {\n\
                    input = input * 60;\n\
                }\n\
                this._offset = input;\n\
                this._isUTC = true;\n\
                if (offset !== input) {\n\
                    addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);\n\
                }\n\
            } else {\n\
                return this._isUTC ? offset : this._d.getTimezoneOffset();\n\
            }\n\
            return this;\n\
        },\n\
\n\
        zoneAbbr : function () {\n\
            return this._isUTC ? \"UTC\" : \"\";\n\
        },\n\
\n\
        zoneName : function () {\n\
            return this._isUTC ? \"Coordinated Universal Time\" : \"\";\n\
        },\n\
\n\
        hasAlignedHourOffset : function (input) {\n\
            if (!input) {\n\
                input = 0;\n\
            }\n\
            else {\n\
                input = moment(input).zone();\n\
            }\n\
\n\
            return (this.zone() - input) % 60 === 0;\n\
        },\n\
\n\
        daysInMonth : function () {\n\
            return moment.utc([this.year(), this.month() + 1, 0]).date();\n\
        },\n\
\n\
        dayOfYear : function (input) {\n\
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;\n\
            return input == null ? dayOfYear : this.add(\"d\", (input - dayOfYear));\n\
        },\n\
\n\
        weekYear : function (input) {\n\
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;\n\
            return input == null ? year : this.add(\"y\", (input - year));\n\
        },\n\
\n\
        isoWeekYear : function (input) {\n\
            var year = weekOfYear(this, 1, 4).year;\n\
            return input == null ? year : this.add(\"y\", (input - year));\n\
        },\n\
\n\
        week : function (input) {\n\
            var week = this.lang().week(this);\n\
            return input == null ? week : this.add(\"d\", (input - week) * 7);\n\
        },\n\
\n\
        isoWeek : function (input) {\n\
            var week = weekOfYear(this, 1, 4).week;\n\
            return input == null ? week : this.add(\"d\", (input - week) * 7);\n\
        },\n\
\n\
        weekday : function (input) {\n\
            var weekday = (this._d.getDay() + 7 - this.lang()._week.dow) % 7;\n\
            return input == null ? weekday : this.add(\"d\", input - weekday);\n\
        },\n\
\n\
        isoWeekday : function (input) {\n\
            // behaves the same as moment#day except\n\
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)\n\
            // as a setter, sunday should belong to the previous week.\n\
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);\n\
        },\n\
\n\
        get : function (units) {\n\
            units = normalizeUnits(units);\n\
            return this[units.toLowerCase()]();\n\
        },\n\
\n\
        set : function (units, value) {\n\
            units = normalizeUnits(units);\n\
            this[units.toLowerCase()](value);\n\
        },\n\
\n\
        // If passed a language key, it will set the language for this\n\
        // instance.  Otherwise, it will return the language configuration\n\
        // variables for this instance.\n\
        lang : function (key) {\n\
            if (key === undefined) {\n\
                return this._lang;\n\
            } else {\n\
                this._lang = getLangDefinition(key);\n\
                return this;\n\
            }\n\
        }\n\
    });\n\
\n\
    // helper for adding shortcuts\n\
    function makeGetterAndSetter(name, key) {\n\
        moment.fn[name] = moment.fn[name + 's'] = function (input) {\n\
            var utc = this._isUTC ? 'UTC' : '';\n\
            if (input != null) {\n\
                this._d['set' + utc + key](input);\n\
                moment.updateOffset(this);\n\
                return this;\n\
            } else {\n\
                return this._d['get' + utc + key]();\n\
            }\n\
        };\n\
    }\n\
\n\
    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)\n\
    for (i = 0; i < proxyGettersAndSetters.length; i ++) {\n\
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);\n\
    }\n\
\n\
    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')\n\
    makeGetterAndSetter('year', 'FullYear');\n\
\n\
    // add plural methods\n\
    moment.fn.days = moment.fn.day;\n\
    moment.fn.months = moment.fn.month;\n\
    moment.fn.weeks = moment.fn.week;\n\
    moment.fn.isoWeeks = moment.fn.isoWeek;\n\
\n\
    // add aliased format methods\n\
    moment.fn.toJSON = moment.fn.toISOString;\n\
\n\
    /************************************\n\
        Duration Prototype\n\
    ************************************/\n\
\n\
\n\
    extend(moment.duration.fn = Duration.prototype, {\n\
\n\
        _bubble : function () {\n\
            var milliseconds = this._milliseconds,\n\
                days = this._days,\n\
                months = this._months,\n\
                data = this._data,\n\
                seconds, minutes, hours, years;\n\
\n\
            // The following code bubbles up values, see the tests for\n\
            // examples of what that means.\n\
            data.milliseconds = milliseconds % 1000;\n\
\n\
            seconds = absRound(milliseconds / 1000);\n\
            data.seconds = seconds % 60;\n\
\n\
            minutes = absRound(seconds / 60);\n\
            data.minutes = minutes % 60;\n\
\n\
            hours = absRound(minutes / 60);\n\
            data.hours = hours % 24;\n\
\n\
            days += absRound(hours / 24);\n\
            data.days = days % 30;\n\
\n\
            months += absRound(days / 30);\n\
            data.months = months % 12;\n\
\n\
            years = absRound(months / 12);\n\
            data.years = years;\n\
        },\n\
\n\
        weeks : function () {\n\
            return absRound(this.days() / 7);\n\
        },\n\
\n\
        valueOf : function () {\n\
            return this._milliseconds +\n\
              this._days * 864e5 +\n\
              (this._months % 12) * 2592e6 +\n\
              ~~(this._months / 12) * 31536e6;\n\
        },\n\
\n\
        humanize : function (withSuffix) {\n\
            var difference = +this,\n\
                output = relativeTime(difference, !withSuffix, this.lang());\n\
\n\
            if (withSuffix) {\n\
                output = this.lang().pastFuture(difference, output);\n\
            }\n\
\n\
            return this.lang().postformat(output);\n\
        },\n\
\n\
        add : function (input, val) {\n\
            // supports only 2.0-style add(1, 's') or add(moment)\n\
            var dur = moment.duration(input, val);\n\
\n\
            this._milliseconds += dur._milliseconds;\n\
            this._days += dur._days;\n\
            this._months += dur._months;\n\
\n\
            this._bubble();\n\
\n\
            return this;\n\
        },\n\
\n\
        subtract : function (input, val) {\n\
            var dur = moment.duration(input, val);\n\
\n\
            this._milliseconds -= dur._milliseconds;\n\
            this._days -= dur._days;\n\
            this._months -= dur._months;\n\
\n\
            this._bubble();\n\
\n\
            return this;\n\
        },\n\
\n\
        get : function (units) {\n\
            units = normalizeUnits(units);\n\
            return this[units.toLowerCase() + 's']();\n\
        },\n\
\n\
        as : function (units) {\n\
            units = normalizeUnits(units);\n\
            return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();\n\
        },\n\
\n\
        lang : moment.fn.lang\n\
    });\n\
\n\
    function makeDurationGetter(name) {\n\
        moment.duration.fn[name] = function () {\n\
            return this._data[name];\n\
        };\n\
    }\n\
\n\
    function makeDurationAsGetter(name, factor) {\n\
        moment.duration.fn['as' + name] = function () {\n\
            return +this / factor;\n\
        };\n\
    }\n\
\n\
    for (i in unitMillisecondFactors) {\n\
        if (unitMillisecondFactors.hasOwnProperty(i)) {\n\
            makeDurationAsGetter(i, unitMillisecondFactors[i]);\n\
            makeDurationGetter(i.toLowerCase());\n\
        }\n\
    }\n\
\n\
    makeDurationAsGetter('Weeks', 6048e5);\n\
    moment.duration.fn.asMonths = function () {\n\
        return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12;\n\
    };\n\
\n\
\n\
    /************************************\n\
        Default Lang\n\
    ************************************/\n\
\n\
\n\
    // Set default language, other languages will inherit from English.\n\
    moment.lang('en', {\n\
        ordinal : function (number) {\n\
            var b = number % 10,\n\
                output = (~~ (number % 100 / 10) === 1) ? 'th' :\n\
                (b === 1) ? 'st' :\n\
                (b === 2) ? 'nd' :\n\
                (b === 3) ? 'rd' : 'th';\n\
            return number + output;\n\
        }\n\
    });\n\
\n\
    /* EMBED_LANGUAGES */\n\
\n\
    /************************************\n\
        Exposing Moment\n\
    ************************************/\n\
\n\
\n\
    // CommonJS module is defined\n\
    if (hasModule) {\n\
        module.exports = moment;\n\
    }\n\
    /*global ender:false */\n\
    if (typeof ender === 'undefined') {\n\
        // here, `this` means `window` in the browser, or `global` on the server\n\
        // add `moment` as a global object via a string identifier,\n\
        // for Closure Compiler \"advanced\" mode\n\
        this['moment'] = moment;\n\
    }\n\
    /*global define:false */\n\
    if (typeof define === \"function\" && define.amd) {\n\
        define(\"moment\", [], function () {\n\
            return moment;\n\
        });\n\
    }\n\
}).call(this);\n\
//@ sourceURL=moment-moment/moment.js"
));
require.register("component-raf/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `requestAnimationFrame()`.\n\
 */\n\
\n\
exports = module.exports = window.requestAnimationFrame\n\
  || window.webkitRequestAnimationFrame\n\
  || window.mozRequestAnimationFrame\n\
  || window.oRequestAnimationFrame\n\
  || window.msRequestAnimationFrame\n\
  || fallback;\n\
\n\
/**\n\
 * Fallback implementation.\n\
 */\n\
\n\
var prev = new Date().getTime();\n\
function fallback(fn) {\n\
  var curr = new Date().getTime();\n\
  var ms = Math.max(0, 16 - (curr - prev));\n\
  setTimeout(fn, ms);\n\
  prev = curr;\n\
}\n\
\n\
/**\n\
 * Cancel.\n\
 */\n\
\n\
var cancel = window.cancelAnimationFrame\n\
  || window.webkitCancelAnimationFrame\n\
  || window.mozCancelAnimationFrame\n\
  || window.oCancelAnimationFrame\n\
  || window.msCancelAnimationFrame;\n\
\n\
exports.cancel = function(id){\n\
  cancel.call(window, id);\n\
};\n\
//@ sourceURL=component-raf/index.js"
));
require.register("component-ease/index.js", Function("exports, require, module",
"\n\
// easing functions from \"Tween.js\"\n\
\n\
exports.linear = function(n){\n\
  return n;\n\
};\n\
\n\
exports.inQuad = function(n){\n\
  return n * n;\n\
};\n\
\n\
exports.outQuad = function(n){\n\
  return n * (2 - n);\n\
};\n\
\n\
exports.inOutQuad = function(n){\n\
  n *= 2;\n\
  if (n < 1) return 0.5 * n * n;\n\
  return - 0.5 * (--n * (n - 2) - 1);\n\
};\n\
\n\
exports.inCube = function(n){\n\
  return n * n * n;\n\
};\n\
\n\
exports.outCube = function(n){\n\
  return --n * n * n + 1;\n\
};\n\
\n\
exports.inOutCube = function(n){\n\
  n *= 2;\n\
  if (n < 1) return 0.5 * n * n * n;\n\
  return 0.5 * ((n -= 2 ) * n * n + 2);\n\
};\n\
\n\
exports.inQuart = function(n){\n\
  return n * n * n * n;\n\
};\n\
\n\
exports.outQuart = function(n){\n\
  return 1 - (--n * n * n * n);\n\
};\n\
\n\
exports.inOutQuart = function(n){\n\
  n *= 2;\n\
  if (n < 1) return 0.5 * n * n * n * n;\n\
  return -0.5 * ((n -= 2) * n * n * n - 2);\n\
};\n\
\n\
exports.inQuint = function(n){\n\
  return n * n * n * n * n;\n\
}\n\
\n\
exports.outQuint = function(n){\n\
  return --n * n * n * n * n + 1;\n\
}\n\
\n\
exports.inOutQuint = function(n){\n\
  n *= 2;\n\
  if (n < 1) return 0.5 * n * n * n * n * n;\n\
  return 0.5 * ((n -= 2) * n * n * n * n + 2);\n\
};\n\
\n\
exports.inSine = function(n){\n\
  return 1 - Math.cos(n * Math.PI / 2 );\n\
};\n\
\n\
exports.outSine = function(n){\n\
  return Math.sin(n * Math.PI / 2);\n\
};\n\
\n\
exports.inOutSine = function(n){\n\
  return .5 * (1 - Math.cos(Math.PI * n));\n\
};\n\
\n\
exports.inExpo = function(n){\n\
  return 0 == n ? 0 : Math.pow(1024, n - 1);\n\
};\n\
\n\
exports.outExpo = function(n){\n\
  return 1 == n ? n : 1 - Math.pow(2, -10 * n);\n\
};\n\
\n\
exports.inOutExpo = function(n){\n\
  if (0 == n) return 0;\n\
  if (1 == n) return 1;\n\
  if ((n *= 2) < 1) return .5 * Math.pow(1024, n - 1);\n\
  return .5 * (-Math.pow(2, -10 * (n - 1)) + 2);\n\
};\n\
\n\
exports.inCirc = function(n){\n\
  return 1 - Math.sqrt(1 - n * n);\n\
};\n\
\n\
exports.outCirc = function(n){\n\
  return Math.sqrt(1 - (--n * n));\n\
};\n\
\n\
exports.inOutCirc = function(n){\n\
  n *= 2\n\
  if (n < 1) return -0.5 * (Math.sqrt(1 - n * n) - 1);\n\
  return 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1);\n\
};\n\
\n\
exports.inBack = function(n){\n\
  var s = 1.70158;\n\
  return n * n * (( s + 1 ) * n - s);\n\
};\n\
\n\
exports.outBack = function(n){\n\
  var s = 1.70158;\n\
  return --n * n * ((s + 1) * n + s) + 1;\n\
};\n\
\n\
exports.inOutBack = function(n){\n\
  var s = 1.70158 * 1.525;\n\
  if ( ( n *= 2 ) < 1 ) return 0.5 * ( n * n * ( ( s + 1 ) * n - s ) );\n\
  return 0.5 * ( ( n -= 2 ) * n * ( ( s + 1 ) * n + s ) + 2 );\n\
};\n\
\n\
exports.inBounce = function(n){\n\
  return 1 - exports.outBounce(1 - n);\n\
};\n\
\n\
exports.outBounce = function(n){\n\
  if ( n < ( 1 / 2.75 ) ) {\n\
    return 7.5625 * n * n;\n\
  } else if ( n < ( 2 / 2.75 ) ) {\n\
    return 7.5625 * ( n -= ( 1.5 / 2.75 ) ) * n + 0.75;\n\
  } else if ( n < ( 2.5 / 2.75 ) ) {\n\
    return 7.5625 * ( n -= ( 2.25 / 2.75 ) ) * n + 0.9375;\n\
  } else {\n\
    return 7.5625 * ( n -= ( 2.625 / 2.75 ) ) * n + 0.984375;\n\
  }\n\
};\n\
\n\
exports.inOutBounce = function(n){\n\
  if (n < .5) return exports.inBounce(n * 2) * .5;\n\
  return exports.outBounce(n * 2 - 1) * .5 + .5;\n\
};\n\
\n\
exports.inElastic = function(n){\n\
  var s, a = 0.1, p = 0.4;\n\
  if ( n === 0 ) return 0;\n\
  if ( n === 1 ) return 1;\n\
  if ( !a || a < 1 ) { a = 1; s = p / 4; }\n\
  else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );\n\
  return - ( a * Math.pow( 2, 10 * ( n -= 1 ) ) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) );\n\
};\n\
\n\
exports.outElastic = function(n){\n\
  var s, a = 0.1, p = 0.4;\n\
  if ( n === 0 ) return 0;\n\
  if ( n === 1 ) return 1;\n\
  if ( !a || a < 1 ) { a = 1; s = p / 4; }\n\
  else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );\n\
  return ( a * Math.pow( 2, - 10 * n) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) + 1 );\n\
};\n\
\n\
exports.inOutElastic = function(n){\n\
  var s, a = 0.1, p = 0.4;\n\
  if ( n === 0 ) return 0;\n\
  if ( n === 1 ) return 1;\n\
  if ( !a || a < 1 ) { a = 1; s = p / 4; }\n\
  else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );\n\
  if ( ( n *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( n -= 1 ) ) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) );\n\
  return a * Math.pow( 2, -10 * ( n -= 1 ) ) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;\n\
};\n\
\n\
// aliases\n\
\n\
exports['in-quad'] = exports.inQuad;\n\
exports['out-quad'] = exports.outQuad;\n\
exports['in-out-quad'] = exports.inOutQuad;\n\
exports['in-cube'] = exports.inCube;\n\
exports['out-cube'] = exports.outCube;\n\
exports['in-out-cube'] = exports.inOutCube;\n\
exports['in-quart'] = exports.inQuart;\n\
exports['out-quart'] = exports.outQuart;\n\
exports['in-out-quart'] = exports.inOutQuart;\n\
exports['in-quint'] = exports.inQuint;\n\
exports['out-quint'] = exports.outQuint;\n\
exports['in-out-quint'] = exports.inOutQuint;\n\
exports['in-sine'] = exports.inSine;\n\
exports['out-sine'] = exports.outSine;\n\
exports['in-out-sine'] = exports.inOutSine;\n\
exports['in-expo'] = exports.inExpo;\n\
exports['out-expo'] = exports.outExpo;\n\
exports['in-out-expo'] = exports.inOutExpo;\n\
exports['in-circ'] = exports.inCirc;\n\
exports['out-circ'] = exports.outCirc;\n\
exports['in-out-circ'] = exports.inOutCirc;\n\
exports['in-back'] = exports.inBack;\n\
exports['out-back'] = exports.outBack;\n\
exports['in-out-back'] = exports.inOutBack;\n\
exports['in-bounce'] = exports.inBounce;\n\
exports['out-bounce'] = exports.outBounce;\n\
exports['in-out-bounce'] = exports.inOutBounce;\n\
exports['in-elastic'] = exports.inElastic;\n\
exports['out-elastic'] = exports.outElastic;\n\
exports['in-out-elastic'] = exports.inOutElastic;\n\
//@ sourceURL=component-ease/index.js"
));
require.register("olivoil-progress/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Dependencies.\n\
 */\n\
\n\
var P = require('progress')\n\
  , raf = require('raf')\n\
  , ease = require('ease')\n\
  , autoscale = require('autoscale-canvas');\n\
\n\
/**\n\
 * Expose `Progress`.\n\
 */\n\
\n\
module.exports = Progress;\n\
\n\
/**\n\
 * Initialize a new `Progress` indicator.\n\
 */\n\
\n\
function Progress(){\n\
  P.apply(this, arguments);\n\
\n\
  this.size(50);\n\
  this.fontSize(24);\n\
  this.color('rgba(31,190,242,1)');\n\
  this.font('helvetica, arial, sans-serif');\n\
}\n\
\n\
/**\n\
 * Inherit from `P`.\n\
 */\n\
\n\
Progress.prototype.__proto__ = P.prototype;\n\
\n\
/**\n\
 * Animate percentage to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @param {String} animation\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.animate = function(n, animation){\n\
  var self = this;\n\
\n\
  animation || (animation = 'linear');\n\
\n\
  raf.cancel(self.animation);\n\
\n\
  var duration = Math.abs(n - this.percent) * 2000 / 100\n\
    , start = Date.now()\n\
    , end = start + duration\n\
    , startx = this.percent\n\
    , x = startx\n\
    , destx = n;\n\
\n\
  function step(){\n\
    self.animation = raf(function(){\n\
      var now = Date.now();\n\
      if (now - start >= duration) return self.update(n);\n\
      var p = (now - start) / duration;\n\
      var val = ease[animation](p);\n\
      x = startx + (destx - startx) * val;\n\
      self.update(x);\n\
      step();\n\
\n\
      // self.update(n > self.percent ? Math.min(self.percent + 1, n) : Math.max(self.percent - 1, n));\n\
      // if(self.percent !== n) step();\n\
    });\n\
  }\n\
\n\
  step();\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Set outter `color`.\n\
 *\n\
 * @param {String} col\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.color = function(col){\n\
  this._color = col;\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Draw on `ctx`.\n\
 *\n\
 * @param {CanvasRenderingContext2d} ctx\n\
 * @return {Progress}\n\
 * @api private\n\
 */\n\
\n\
Progress.prototype.draw = function(ctx){\n\
  var percent = Math.min(this.percent, 100)\n\
    , ratio = window.devicePixelRatio || 1\n\
    , size = this.el.width / ratio\n\
    , half = size / 2\n\
    , x = half\n\
    , y = half\n\
    , rad = half - 1\n\
    , fontSize = this._fontSize\n\
    , color = this._color\n\
    , lineWidth = rad / 3;\n\
\n\
  var start = 1.5 * Math.PI;\n\
  var angle = start + (Math.PI * 2 * (percent / 100));\n\
\n\
  ctx.clearRect(0, 0, size, size);\n\
\n\
  // inner circle\n\
  ctx.beginPath();\n\
  ctx.arc(x, y, rad, 0, Math.PI * 2, true);\n\
  ctx.closePath();\n\
  ctx.fillStyle = 'rgba(238,238,238,1)';\n\
  ctx.fill();\n\
\n\
  // outer circle\n\
  ctx.strokeStyle = color;\n\
  ctx.lineWidth   = lineWidth * 2;\n\
  ctx.beginPath();\n\
  ctx.arc(x, y, rad - lineWidth, start, angle, false);\n\
  ctx.stroke();\n\
\n\
  // label circle\n\
  ctx.beginPath();\n\
  ctx.arc(x, y, rad - lineWidth, 0, Math.PI * 2, true);\n\
  ctx.closePath();\n\
  ctx.fillStyle = 'rgba(255,255,255,1)';\n\
  ctx.fill();\n\
\n\
\n\
  // percent/label text\n\
  ctx.font = fontSize + 'px ' + this._font;\n\
  var text = this._test || (percent | 0) + '%'\n\
    , w = ctx.measureText(text).width;\n\
\n\
  ctx.fillStyle = color;\n\
  ctx.fillText(\n\
      text\n\
    , x - w / 2 + 1\n\
    , y + fontSize / 2 - 1);\n\
\n\
  return this;\n\
};\n\
//@ sourceURL=olivoil-progress/index.js"
));
require.register("olivoil-pie/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Dependencies.\n\
 */\n\
\n\
var raf = require('raf')\n\
  , ease = require('ease')\n\
  , autoscale = require('autoscale-canvas');\n\
\n\
/**\n\
 * Expose `Pie`.\n\
 */\n\
\n\
module.exports = Pie;\n\
\n\
/**\n\
 * Initialize a new `Pie`.\n\
 */\n\
\n\
function Pie(){\n\
  this.segments = [];\n\
  this.el = document.createElement('canvas');\n\
  this.ctx = this.el.getContext('2d');\n\
  this.easing('outBounce');\n\
  this.rotate(true).scale(false);\n\
  this.size(50);\n\
  this.fontSize(24);\n\
  this.color('rgba(31,190,242,1)');\n\
  this.font('helvetica, arial, sans-serif');\n\
}\n\
\n\
/**\n\
 * Set pie ease function to `easing`.\n\
 *\n\
 * @param {String} easing\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.easing = function(easing){\n\
  this._easing = easing;\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Set font size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.fontSize = function(n){\n\
  this._fontSize = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set text color to `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.color = function(str){\n\
  this._color = str;\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Set font `family`.\n\
 *\n\
 * @param {String} family\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.font = function(family){\n\
  this._font = family;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set text to `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.text = function(str){\n\
  this._text = str;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Animate by rotating pie.\n\
 *\n\
 * @param {Boolean} rotate\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.rotate = function(rotate){\n\
  this._rotate = !!rotate;\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Animate by scaling pie.\n\
 *\n\
 * @param {Boolean} scale\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.scale = function(scale){\n\
  this._scale = !!scale;\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Set pie size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.size = function(n){\n\
  this.el.width = n;\n\
  this.el.height = n;\n\
  autoscale(this.el);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Update segments to `data`.\n\
 *\n\
 * @param {Object[]} segments with `value`, and `color`\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.update = function(segments, scale, rotate){\n\
  this.segments = segments;\n\
  this.draw(this.ctx, scale, rotate);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Animate segments.\n\
 *\n\
 * @param {Object[]} segments with `value`, and `color`\n\
 * @param {String} easing\n\
 * @param {Boolean} rotate\n\
 * @param {Boolean} scale\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.animate = function(segments){\n\
  var self = this;\n\
  if(typeof rotate == 'undefined') rotate = true;\n\
  raf.cancel(this.animation);\n\
\n\
  var duration = 2000\n\
    , start = Date.now()\n\
    , end = start + duration\n\
    , text = this._text;\n\
\n\
  function step(){\n\
    self.animation = raf(function(){\n\
      var now = Date.now();\n\
      var p = (now - start) / duration;\n\
      var val = ease[self._easing](p);\n\
\n\
      if (now - start >= duration) return self.update(segments);\n\
      self.update(segments, self._rotate && val, self._scale && val);\n\
      step();\n\
    });\n\
  }\n\
\n\
  step();\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Draw on `ctx`.\n\
 *\n\
 * @param {CanvasRenderingContext2d} ctx\n\
 * @param {Number} rotate ratio\n\
 * @param {Number} scale ratio\n\
 * @return {Pie}\n\
 * @api private\n\
 */\n\
\n\
Pie.prototype.draw = function(ctx, rotate, scale){\n\
  var self = this\n\
    , ratio = window.devicePixelRatio || 1\n\
    , size = this.el.width / ratio\n\
    , half = size / 2\n\
    , x = half\n\
    , y = half\n\
    , rad = half - 1\n\
    , rotate = rotate || 1\n\
    , scale = scale || 1\n\
    , strokeWidth = 2\n\
    , strokeColor = '#fff';\n\
\n\
  var total = this.segments.reduce(function(stats, segment){\n\
    if(!segment.value) return stats;\n\
    stats.sum += segment.value;\n\
    stats.count++;\n\
    return stats;\n\
  }, {sum: 0, count: 0});\n\
\n\
  var start = 1.5 * Math.PI;\n\
\n\
  ctx.clearRect(0, 0, size, size);\n\
\n\
  this.segments.forEach(function(segment){\n\
    if(!segment.value) return;\n\
\n\
    var angle = rotate * (segment.value/total.sum) * (Math.PI*2);\n\
\n\
    ctx.strokeStyle = total.count > 1 ? strokeColor : segment.color;\n\
    ctx.lineWidth = strokeWidth;\n\
\n\
    ctx.beginPath();\n\
    ctx.arc(x, y, scale * rad, start, start + angle);\n\
    ctx.lineTo(rad,rad);\n\
    ctx.closePath();\n\
    ctx.fillStyle = segment.color;\n\
    ctx.fill();\n\
    ctx.stroke();\n\
\n\
    start += angle;\n\
  });\n\
\n\
  if(!this._text) return this;\n\
\n\
  // it's a donut\n\
  ctx.beginPath();\n\
  ctx.arc(x, y, rad - (rad / 3), 0, Math.PI * 2, true);\n\
  ctx.closePath();\n\
  ctx.fillStyle = 'rgba(255,255,255,1)';\n\
  ctx.fill();\n\
\n\
  ctx.font = this._fontSize + 'px ' + this._font;\n\
  var text = this._text\n\
    , w = ctx.measureText(text).width;\n\
  ctx.fillStyle = this._color;\n\
\n\
  ctx.fillText(\n\
      text\n\
    , x - w / 2 + 1\n\
    , y + this._fontSize / 2 - 1);\n\
\n\
  return this;\n\
};\n\
//@ sourceURL=olivoil-pie/index.js"
));
require.register("reporters/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose the reporters.\n\
 */\n\
\n\
exports.Base = require('./base')\n\
exports.CSV  = require('./csv')\n\
exports.JSON = require('./json')\n\
exports.HTML = require('./html')\n\
//@ sourceURL=reporters/index.js"
));
require.register("reporters/base.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `Base`.\n\
 */\n\
\n\
exports = module.exports = Base;\n\
\n\
/**\n\
 * Make a new `Base`.\n\
 *\n\
 * @param {Runner} runner\n\
 */\n\
\n\
function Base(runner){\n\
}\n\
//@ sourceURL=reporters/base.js"
));
require.register("reporters/html.js", Function("exports, require, module",
"\n\
/**\n\
 * Dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , pb = require('pb')\n\
  , classes = require('classes')\n\
  , Progress = require('progress')\n\
  , Pie = require('pie')\n\
  , CSV = require('./csv')\n\
  , debug = require('debug')('pbci:reporters:html');\n\
\n\
/**\n\
 * Expose `HTMLReporter`.\n\
 */\n\
\n\
exports = module.exports = HTMLReporter;\n\
\n\
/**\n\
 * Make a new `HTMLReporter`.\n\
 *\n\
 * @param {Runner} runner\n\
 */\n\
\n\
function HTMLReporter(runner){\n\
  var root = document.getElementById('minitest');\n\
\n\
  var suites = document.createElement('div');\n\
  suites.className = 'suites';\n\
\n\
  var details = document.createElement('div');\n\
  details.className = 'details';\n\
\n\
  root.appendChild(suites);\n\
  root.appendChild(details);\n\
\n\
  runner.on('suite start', function(suite){\n\
    var csv = new CSV(suite);\n\
\n\
    var container = document.createElement('div');\n\
    container.className = 'suite';\n\
    suites.appendChild(container);\n\
\n\
    var title = document.createElement('h2')\n\
      , progress = new Progress\n\
      , percent = 0\n\
      , pass = 0\n\
      , fail = 0;\n\
\n\
    text(title, suite.fullTitle());\n\
    on(title, 'click', function(){ csv.download() });\n\
    progress.size(60).fontSize(12).update(percent);\n\
\n\
    title.appendChild(progress.el);\n\
    container.appendChild(title);\n\
\n\
    var box = document.createElement('div');\n\
    box.className = 'boxes';\n\
    container.appendChild(box);\n\
\n\
    var els = boxes(suite.length());\n\
    els.forEach(function(el){ box.appendChild(el) });\n\
\n\
    var errors = document.createElement('ul');\n\
    errors.className = 'errors';\n\
    errors.appendChild(title.cloneNode());\n\
    details.appendChild(errors);\n\
    show(errors, 'errors');\n\
    var n = 0;\n\
\n\
    var i = 0;\n\
    suite.on('pass', function(test){\n\
      pass++;\n\
      var el = els[i++];\n\
      el.href = pb.oneClickUrl(test.get('asset').get('url'));\n\
      el.title = test.fullTitle();\n\
      el.target = '_blank';\n\
      show(el, 'test pass');\n\
\n\
      percent += (1 / suite.tests.length) * 100;\n\
      debug('update progress', percent);\n\
      progress.animate(percent);\n\
    });\n\
\n\
    suite.on('fail', function(test){\n\
      fail++;\n\
      var id = 'error-' + ++n;\n\
      var el = els[i++];\n\
      el.href = pb.oneClickUrl(test.get('asset').get('url'));\n\
      el.title = test.fullTitle();\n\
      el.target = '_blank';\n\
      show(el, 'test fail');\n\
\n\
      percent += (1 / suite.tests.length) * 100;\n\
      debug('update progress', percent);\n\
      progress.animate(percent);\n\
\n\
      var events = test.get('events') || [{name: 'no events', data: {}}];\n\
      var msg = events.reduce(function(stack, evt, j){\n\
        stack += '\\n\
';\n\
        stack += '#' + j + ' ' + evt.name;\n\
        for (var key in evt.data){\n\
          stack += '\\n\
\\t' + key + ' => ' + JSON.stringify(evt.data[key]);\n\
        }\n\
        return stack + '\\n\
';\n\
      }, '');\n\
\n\
      var pre = document.createElement('pre');\n\
      pre.className = 'events';\n\
      on(pre, 'click', function(){\n\
        classes(pre).toggle('show');\n\
      });\n\
      text(pre, msg);\n\
\n\
      var title = document.createElement('h3');\n\
      title.setAttribute('id', id);\n\
      text(title, test.fullTitle() + ' (' + test.get('runs') + ' runs)');\n\
 \n\
      var li = document.createElement('li');\n\
      li.appendChild(title);\n\
      li.appendChild(pre);\n\
      errors.appendChild(li);\n\
      show(li, 'error');\n\
    });\n\
\n\
    suite.on('end', function(){\n\
      var pie = new Pie\n\
        , data = [{value: pass, color: 'rgba(25,151,63,1)'}, {value: fail, color: 'rgba(204,0,0,1)'}]\n\
        , percent = Math.min(Math.ceil((pass / (pass + fail)) * 100), 100)\n\
        , label = percent + '%'\n\
        , color = 'rgba(25,151,63,1)' // green\n\
\n\
      if(percent < 98) color = 'rgba(223,111,0,1)'; // orange\n\
      if(percent < 75) color = 'rgba(204,0,0,1)';  // red\n\
\n\
      pie.size(60).fontSize(12).color(color);\n\
      title.replaceChild(pie.el, progress.el);\n\
      pie.text(label).animate(data);\n\
    });\n\
\n\
    function show(el, classname){\n\
      el.className = classname;\n\
      setTimeout(function(){\n\
        el.className = classname + ' show';\n\
      }, 0);\n\
    }\n\
\n\
  });\n\
\n\
}\n\
\n\
/**\n\
 * Create `n` boxes.\n\
 */\n\
\n\
function boxes(n) {\n\
  var els = [];\n\
\n\
  for (var i = 0; i < n; i++) {\n\
    var el = document.createElement('a');\n\
    el.className = 'test';\n\
    els.push(el);\n\
  }\n\
\n\
  return els;\n\
}\n\
\n\
/**\n\
 * Set `el` text to `str`.\n\
 */\n\
\n\
function text(el, str) {\n\
  if (el.textContent) {\n\
    el.textContent = str;\n\
  } else {\n\
    el.innerText = str;\n\
  }\n\
}\n\
\n\
/**\n\
 * Listen on `event` with callback `fn`.\n\
 */\n\
\n\
function on(el, event, fn) {\n\
  if (el.addEventListener) {\n\
    el.addEventListener(event, fn, false);\n\
  } else {\n\
    el.attachEvent('on' + event, fn);\n\
  }\n\
}\n\
//@ sourceURL=reporters/html.js"
));
require.register("reporters/csv.js", Function("exports, require, module",
"\n\
/**\n\
 * Dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , moment = require('moment')\n\
\n\
/**\n\
 * Expose `CSVReporter`.\n\
 */\n\
\n\
exports = module.exports = CSVReporter;\n\
\n\
/**\n\
 * Make a new `CSVReporter`.\n\
 *\n\
 * @param {Runner} runner\n\
 */\n\
\n\
function CSVReporter(runner){\n\
  var self  = this;\n\
\tthis.rows = [];\n\
\tthis.title = runner.fullTitle ? runner.fullTitle() : (runner.title || 'tests');\n\
\n\
  runner.on('test end', function(test){\n\
\t\tself.rows.push(clean(test));\n\
\t});\n\
\n\
}\n\
\n\
CSVReporter.prototype.download = function(){\n\
\t// csv data\n\
\tvar csvEncoded = this.rows.reduce(function(csv, row){\n\
\t\treturn csv + (row || []).join(',') + '\\n\
';\n\
\t}, 'data:text/csv;charset=utf-8,');\n\
\n\
\t// download\n\
\tvar encodedUri = encodeURI(csvEncoded);\n\
\tvar link = document.createElement(\"a\");\n\
\tlink.setAttribute(\"href\", encodedUri);\n\
\tvar filename = moment().format('YYYYMMDD') + '_' + this.title.split(' ').join('_');\n\
\tlink.setAttribute(\"download\", filename + '.csv');\n\
\tlink.click();\n\
}\n\
\n\
function clean(test){\n\
\treturn [\n\
\t\t  test.fullTitle()\n\
\t\t, test.state\n\
\t\t, test.get('runs')\n\
\t\t, coerce(test.err)\n\
\t];\n\
}\n\
\n\
function coerce(err){\n\
\tif(!err) return '';\n\
\treturn test.err.stack || test.err.toString();\n\
}\n\
//@ sourceURL=reporters/csv.js"
));
require.register("reporters/json.js", Function("exports, require, module",
"/**\n\
 * Dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , debug = require('debug')('pbci:reporters:json');\n\
\n\
/**\n\
 * Expose `Reporter`.\n\
 */\n\
\n\
exports = module.exports = JSONReporter;\n\
\n\
/**\n\
 * Make a new `Reporter`.\n\
 *\n\
 * @param {Runner} runner\n\
 */\n\
\n\
function JSONReporter(runner){\n\
\tvar self = this;\n\
\tBase.apply(this, arguments);\n\
\n\
\tvar tests = []\n\
\t  , failures = []\n\
\t  , passes = [];\n\
\n\
\trunner.on('test end', function(test){\n\
\t\tdebug(JSON.stringify(clean(test)));\n\
\t\ttests.push(test);\n\
\t});\n\
\n\
\trunner.on('pass', function(test){\n\
\t\tpasses.push(test);\n\
\t});\n\
\n\
\trunner.on('fail', function(test){\n\
\t\tfailures.push(test);\n\
\t});\n\
\n\
\trunner.on('end', function(){\n\
\t\tvar obj = {\n\
\t\t\t  tests: tests.map(clean)\n\
\t\t\t, failures: failures.map(clean)\n\
\t\t\t, passes: passes.map(clean)\n\
\t\t};\n\
\n\
\t\tdebug(JSON.stringify(obj, null, 2));\n\
\t});\n\
}\n\
\n\
/**\n\
 * Inherit from `Base`.\n\
 */\n\
\n\
JSONReporter.prototype.__proto__ = Base.prototype;\n\
\n\
/**\n\
 * Return a plain-object representation of `test`\n\
 * free of cyclic properties etc.\n\
 *\n\
 * @param {Object} test\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function clean(test) {\n\
  var json =  {\n\
      title: test.title\n\
\t\t, fullTitle: test.fullTitle()\n\
\t  , state: test.state\n\
\t\t, runs: test.get('runs')\n\
  }\n\
\n\
\tif(test.err) json.err = test.err.stack || test.err.toString()\n\
\treturn json;\n\
}\n\
//@ sourceURL=reporters/json.js"
));
require.register("minitest/index.js", Function("exports, require, module",
"/**\n\
 * Dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
\n\
/**\n\
 * Expose `Minitest`.\n\
 */\n\
\n\
exports = module.exports = Minitest;\n\
\n\
/**\n\
 * Expose internals.\n\
 */\n\
\n\
exports.Suite = require('./suite');\n\
exports.Runner = require('./runner');\n\
exports.reporters = require('reporters');\n\
exports.Test = require('./test');\n\
\n\
/**\n\
 * Setup minitest.\n\
 */\n\
\n\
function Minitest(){\n\
\tthis.suites = [];\n\
}\n\
\n\
Emitter(Minitest.prototype);\n\
\n\
/**\n\
 * Register a new `suite`\n\
 *\n\
 * @param {String} title\n\
 * @param {Array} tests\n\
 * @return {Suite}\n\
 * @api public\n\
 */\n\
\n\
Minitest.prototype.describe = function(title, tests){\n\
\tvar suite = new exports.Suite(title, tests);\n\
\tthis.suites.push(suite);\n\
\treturn suite;\n\
}\n\
\n\
/**\n\
 * Run tests.\n\
 *\n\
 * @return {Runner}\n\
 * @api public\n\
 */\n\
\n\
Minitest.prototype.run = function(){\n\
\tvar suites = this.suites.slice();\n\
\tvar runner = new exports.Runner(suites);\n\
\tnew exports.reporters.HTML(runner);\n\
\treturn runner.run();\n\
}\n\
\n\
Minitest.prototype.use = function(fn){\n\
  fn(this);\n\
}\n\
//@ sourceURL=minitest/index.js"
));
require.register("minitest/runner.js", Function("exports, require, module",
"\n\
/**\n\
 * Dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter')\n\
\n\
/**\n\
 * Expose `Runner`.\n\
 */\n\
\n\
module.exports = Runner;\n\
\n\
/**\n\
 * Create a new `Runner`.\n\
 */\n\
\n\
function Runner(suites){\n\
  this.suites = suites;\n\
}\n\
\n\
/**\n\
 * Mixin `Emitter`.\n\
 */\n\
\n\
Emitter(Runner.prototype);\n\
\n\
/**\n\
 * Run tests.\n\
 *\n\
 * @return {Runner} for chaining\n\
 * @api public\n\
 */\n\
\n\
Runner.prototype.run = function(){\n\
  var self = this\n\
    , suites = this.suites.slice()\n\
    , suite;\n\
\n\
  function next(){\n\
\n\
    // next suite\n\
    suite = suites.shift();\n\
\n\
    // all done\n\
    if (!suite) {\n\
      self.emit('end');\n\
      return self;\n\
    }\n\
\n\
    self.emit('suite start', suite);\n\
    suite.start();\n\
\n\
    suite.on('test end', function(test){\n\
      self.emit('test end', test);\n\
    });\n\
\n\
    suite.on('pass', function(test){\n\
      self.emit('pass', test);\n\
    });\n\
\n\
    suite.on('fail', function(test){\n\
      self.emit('fail', test);\n\
    });\n\
\n\
    suite.on('end', function(err){\n\
      self.emit('suite end', suite);\n\
      next();\n\
    });\n\
\n\
  }\n\
\n\
  self.emit('start');\n\
  next();\n\
  return this;\n\
}\n\
//@ sourceURL=minitest/runner.js"
));
require.register("minitest/suite.js", Function("exports, require, module",
"/**\n\
 * Dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter')\n\
  , Test = require('./test')\n\
\n\
/**\n\
 * Expose `Suite`.\n\
 */\n\
\n\
module.exports = Suite;\n\
\n\
/**\n\
 * Make a new `Suite`.\n\
 *\n\
 * @param {String} title\n\
 * @param {String[]|Test[]} tests\n\
 */\n\
\n\
function Suite(title, tests){\n\
\tvar self = this;\n\
\tthis.state = 'pending';\n\
\tthis.title = title;\n\
\tthis.addTests(tests);\n\
\n\
\tthis.on('test end', function(){\n\
\t\tvar allDone = self.tests.every(function(test){ return test.state !== 'pending' });\n\
\t\tif(!allDone) return;\n\
\n\
\t\tself.state = 'complete';\n\
\t\tself.emit('end');\n\
\t});\n\
}\n\
\n\
/**\n\
 * Mixin `Emitter`.\n\
 */\n\
\n\
Emitter(Suite.prototype);\n\
\n\
/**\n\
 * Add tests.\n\
 *\n\
 * @param {Tests[]} tests\n\
 * @return {Suite} for chaining\n\
 */\n\
\n\
Suite.prototype.addTests = function(tests){\n\
\tvar self = this;\n\
\n\
\tthis.tests || (this.tests = []);\n\
\n\
\ttests.forEach(function(test){\n\
\t\tif(!(test instanceof Test)) test = new Test(test);\n\
\t\ttest.parent = self;\n\
\t\tself.tests.push(test);\n\
\t});\n\
\n\
\treturn this;\n\
}\n\
\n\
Suite.prototype.length = function(){\n\
\treturn this.tests.length;\n\
}\n\
\n\
Suite.prototype.start = function(){\n\
\tthis.state = 'started';\n\
\tthis.emit('start');\n\
}\n\
\n\
/**\n\
 * Return the full title generated by recursively\n\
 * concatenating the parent's full title.\n\
 *\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Suite.prototype.fullTitle = function(){\n\
  if (this.parent) {\n\
    var full = this.parent.fullTitle();\n\
    if (full) return full + ' ' + this.title;\n\
  }\n\
  return this.title;\n\
};\n\
\n\
/**\n\
 * Pass a test.\n\
 *\n\
 * @param {Test} test\n\
 * @return {Suite} for chaining\n\
 * @api public\n\
 */\n\
\n\
Suite.prototype.pass = function(test){\n\
\tif(!test) return this;\n\
\n\
\tif(!this.tests.indexOf(test) === -1) {\n\
\t\tconsole.error('test not in suite');\n\
\t\treturn this;\n\
\t}\n\
\n\
\ttest.pass();\n\
\tthis.emit('pass', test);\n\
\tthis.emit('test end', test);\n\
\treturn this;\n\
}\n\
\n\
/**\n\
 * Fail a test.\n\
 *\n\
 * @param {Test} test\n\
 * @return {Suite} for chaining\n\
 * @api public\n\
 */\n\
\n\
Suite.prototype.fail = function(test, err){\n\
\tif(!test) return this;\n\
\n\
\tif(!this.tests.indexOf(test) === -1) {\n\
\t\tconsole.error('test not in suite');\n\
\t\treturn this;\n\
\t}\n\
\n\
\ttest.fail(err);\n\
\tthis.emit('fail', test);\n\
\tthis.emit('test end', test);\n\
\treturn this;\n\
}\n\
//@ sourceURL=minitest/suite.js"
));
require.register("minitest/test.js", Function("exports, require, module",
"\n\
/**\n\
 * Dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
\n\
/**\n\
 * Expose `Test`.\n\
 */\n\
\n\
module.exports = Test;\n\
\n\
/**\n\
 * Make a new `Test`.\n\
 *\n\
 * @param {String} title\n\
 */\n\
\n\
function Test(title){\n\
\tthis.attrs = [];\n\
\tthis.title = title;\n\
\tthis.state = 'pending';\n\
}\n\
\n\
/**\n\
 * Return the full title generated by recursively\n\
 * concatenating the parent's full title.\n\
 *\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Test.prototype.fullTitle = function(){\n\
  return this.parent.fullTitle() + ' ' + this.title;\n\
};\n\
\n\
/**\n\
 * Set an attribute.\n\
 *\n\
 * @param {String} key\n\
 * @param {Object} val\n\
 * @return {Test} for chaining\n\
 * @api public\n\
 */\n\
\n\
Test.prototype.set = function(key, val){\n\
\tthis.attrs[key] = val;\n\
\treturn this;\n\
}\n\
\n\
Test.prototype.done = function(fn){\n\
\tthis._done = fn;\n\
\treturn this;\n\
}\n\
\n\
/**\n\
 * Mark test as failed.\n\
 *\n\
 * @param {Error|String} err\n\
 * @return {Test} for chaining\n\
 */\n\
\n\
Test.prototype.fail = function(err){\n\
\tthis.err = err;\n\
\tthis.end('failed');\n\
\treturn this;\n\
}\n\
\n\
/**\n\
 * Mark test as passed.\n\
 *\n\
 * @return {Test} for chaining\n\
 */\n\
\n\
Test.prototype.pass = function(){\n\
\tthis.end('passed');\n\
\treturn this;\n\
}\n\
\n\
/**\n\
 * End test.\n\
 *\n\
 * @param {String} state\n\
 */\n\
\n\
Test.prototype.end = function(state){\n\
\tthis.state = state || 'complete';\n\
\tif(this._done) this._done();\n\
\tthis.emit('end');\n\
}\n\
\n\
\n\
/**\n\
 * Unset an attribute.\n\
 *\n\
 * @param {String} key\n\
 * @return {Test} for chaining\n\
 * @api public\n\
 */\n\
\n\
Test.prototype.unset = function(key){\n\
\tdelete this.attrs[key];\n\
\treturn this;\n\
}\n\
\n\
/**\n\
 * Increment an attribute.\n\
 *\n\
 * @param {String} key\n\
 * @return {Test} for chaining\n\
 * @api public\n\
 */\n\
\n\
Test.prototype.inc = function(key, n){\n\
\tthis.attrs[key] || (this.attrs[key] = 0);\n\
\tthis.attrs[key] += (typeof n == 'number' ? n : 1);\n\
\treturn this;\n\
}\n\
\n\
/**\n\
 * Get an attribute.\n\
 *\n\
 * @param {String} key\n\
 * @return {Object} val\n\
 * @api public\n\
 */\n\
\n\
Test.prototype.get = function(key){\n\
\treturn this.attrs[key];\n\
}\n\
\n\
/**\n\
 * Mixin `Emitter`\n\
 */\n\
\n\
Emitter(Test.prototype);\n\
//@ sourceURL=minitest/test.js"
));
require.register("caolan-async/lib/async.js", Function("exports, require, module",
"/*global setImmediate: false, setTimeout: false, console: false */\n\
(function () {\n\
\n\
    var async = {};\n\
\n\
    // global on the server, window in the browser\n\
    var root, previous_async;\n\
\n\
    root = this;\n\
    if (root != null) {\n\
      previous_async = root.async;\n\
    }\n\
\n\
    async.noConflict = function () {\n\
        root.async = previous_async;\n\
        return async;\n\
    };\n\
\n\
    function only_once(fn) {\n\
        var called = false;\n\
        return function() {\n\
            if (called) throw new Error(\"Callback was already called.\");\n\
            called = true;\n\
            fn.apply(root, arguments);\n\
        }\n\
    }\n\
\n\
    //// cross-browser compatiblity functions ////\n\
\n\
    var _each = function (arr, iterator) {\n\
        if (arr.forEach) {\n\
            return arr.forEach(iterator);\n\
        }\n\
        for (var i = 0; i < arr.length; i += 1) {\n\
            iterator(arr[i], i, arr);\n\
        }\n\
    };\n\
\n\
    var _map = function (arr, iterator) {\n\
        if (arr.map) {\n\
            return arr.map(iterator);\n\
        }\n\
        var results = [];\n\
        _each(arr, function (x, i, a) {\n\
            results.push(iterator(x, i, a));\n\
        });\n\
        return results;\n\
    };\n\
\n\
    var _reduce = function (arr, iterator, memo) {\n\
        if (arr.reduce) {\n\
            return arr.reduce(iterator, memo);\n\
        }\n\
        _each(arr, function (x, i, a) {\n\
            memo = iterator(memo, x, i, a);\n\
        });\n\
        return memo;\n\
    };\n\
\n\
    var _keys = function (obj) {\n\
        if (Object.keys) {\n\
            return Object.keys(obj);\n\
        }\n\
        var keys = [];\n\
        for (var k in obj) {\n\
            if (obj.hasOwnProperty(k)) {\n\
                keys.push(k);\n\
            }\n\
        }\n\
        return keys;\n\
    };\n\
\n\
    //// exported async module functions ////\n\
\n\
    //// nextTick implementation with browser-compatible fallback ////\n\
    if (typeof process === 'undefined' || !(process.nextTick)) {\n\
        if (typeof setImmediate === 'function') {\n\
            async.nextTick = function (fn) {\n\
                // not a direct alias for IE10 compatibility\n\
                setImmediate(fn);\n\
            };\n\
            async.setImmediate = async.nextTick;\n\
        }\n\
        else {\n\
            async.nextTick = function (fn) {\n\
                setTimeout(fn, 0);\n\
            };\n\
            async.setImmediate = async.nextTick;\n\
        }\n\
    }\n\
    else {\n\
        async.nextTick = process.nextTick;\n\
        if (typeof setImmediate !== 'undefined') {\n\
            async.setImmediate = setImmediate;\n\
        }\n\
        else {\n\
            async.setImmediate = async.nextTick;\n\
        }\n\
    }\n\
\n\
    async.each = function (arr, iterator, callback) {\n\
        callback = callback || function () {};\n\
        if (!arr.length) {\n\
            return callback();\n\
        }\n\
        var completed = 0;\n\
        _each(arr, function (x) {\n\
            iterator(x, only_once(function (err) {\n\
                if (err) {\n\
                    callback(err);\n\
                    callback = function () {};\n\
                }\n\
                else {\n\
                    completed += 1;\n\
                    if (completed >= arr.length) {\n\
                        callback(null);\n\
                    }\n\
                }\n\
            }));\n\
        });\n\
    };\n\
    async.forEach = async.each;\n\
\n\
    async.eachSeries = function (arr, iterator, callback) {\n\
        callback = callback || function () {};\n\
        if (!arr.length) {\n\
            return callback();\n\
        }\n\
        var completed = 0;\n\
        var iterate = function () {\n\
            iterator(arr[completed], function (err) {\n\
                if (err) {\n\
                    callback(err);\n\
                    callback = function () {};\n\
                }\n\
                else {\n\
                    completed += 1;\n\
                    if (completed >= arr.length) {\n\
                        callback(null);\n\
                    }\n\
                    else {\n\
                        iterate();\n\
                    }\n\
                }\n\
            });\n\
        };\n\
        iterate();\n\
    };\n\
    async.forEachSeries = async.eachSeries;\n\
\n\
    async.eachLimit = function (arr, limit, iterator, callback) {\n\
        var fn = _eachLimit(limit);\n\
        fn.apply(null, [arr, iterator, callback]);\n\
    };\n\
    async.forEachLimit = async.eachLimit;\n\
\n\
    var _eachLimit = function (limit) {\n\
\n\
        return function (arr, iterator, callback) {\n\
            callback = callback || function () {};\n\
            if (!arr.length || limit <= 0) {\n\
                return callback();\n\
            }\n\
            var completed = 0;\n\
            var started = 0;\n\
            var running = 0;\n\
\n\
            (function replenish () {\n\
                if (completed >= arr.length) {\n\
                    return callback();\n\
                }\n\
\n\
                while (running < limit && started < arr.length) {\n\
                    started += 1;\n\
                    running += 1;\n\
                    iterator(arr[started - 1], function (err) {\n\
                        if (err) {\n\
                            callback(err);\n\
                            callback = function () {};\n\
                        }\n\
                        else {\n\
                            completed += 1;\n\
                            running -= 1;\n\
                            if (completed >= arr.length) {\n\
                                callback();\n\
                            }\n\
                            else {\n\
                                replenish();\n\
                            }\n\
                        }\n\
                    });\n\
                }\n\
            })();\n\
        };\n\
    };\n\
\n\
\n\
    var doParallel = function (fn) {\n\
        return function () {\n\
            var args = Array.prototype.slice.call(arguments);\n\
            return fn.apply(null, [async.each].concat(args));\n\
        };\n\
    };\n\
    var doParallelLimit = function(limit, fn) {\n\
        return function () {\n\
            var args = Array.prototype.slice.call(arguments);\n\
            return fn.apply(null, [_eachLimit(limit)].concat(args));\n\
        };\n\
    };\n\
    var doSeries = function (fn) {\n\
        return function () {\n\
            var args = Array.prototype.slice.call(arguments);\n\
            return fn.apply(null, [async.eachSeries].concat(args));\n\
        };\n\
    };\n\
\n\
\n\
    var _asyncMap = function (eachfn, arr, iterator, callback) {\n\
        var results = [];\n\
        arr = _map(arr, function (x, i) {\n\
            return {index: i, value: x};\n\
        });\n\
        eachfn(arr, function (x, callback) {\n\
            iterator(x.value, function (err, v) {\n\
                results[x.index] = v;\n\
                callback(err);\n\
            });\n\
        }, function (err) {\n\
            callback(err, results);\n\
        });\n\
    };\n\
    async.map = doParallel(_asyncMap);\n\
    async.mapSeries = doSeries(_asyncMap);\n\
    async.mapLimit = function (arr, limit, iterator, callback) {\n\
        return _mapLimit(limit)(arr, iterator, callback);\n\
    };\n\
\n\
    var _mapLimit = function(limit) {\n\
        return doParallelLimit(limit, _asyncMap);\n\
    };\n\
\n\
    // reduce only has a series version, as doing reduce in parallel won't\n\
    // work in many situations.\n\
    async.reduce = function (arr, memo, iterator, callback) {\n\
        async.eachSeries(arr, function (x, callback) {\n\
            iterator(memo, x, function (err, v) {\n\
                memo = v;\n\
                callback(err);\n\
            });\n\
        }, function (err) {\n\
            callback(err, memo);\n\
        });\n\
    };\n\
    // inject alias\n\
    async.inject = async.reduce;\n\
    // foldl alias\n\
    async.foldl = async.reduce;\n\
\n\
    async.reduceRight = function (arr, memo, iterator, callback) {\n\
        var reversed = _map(arr, function (x) {\n\
            return x;\n\
        }).reverse();\n\
        async.reduce(reversed, memo, iterator, callback);\n\
    };\n\
    // foldr alias\n\
    async.foldr = async.reduceRight;\n\
\n\
    var _filter = function (eachfn, arr, iterator, callback) {\n\
        var results = [];\n\
        arr = _map(arr, function (x, i) {\n\
            return {index: i, value: x};\n\
        });\n\
        eachfn(arr, function (x, callback) {\n\
            iterator(x.value, function (v) {\n\
                if (v) {\n\
                    results.push(x);\n\
                }\n\
                callback();\n\
            });\n\
        }, function (err) {\n\
            callback(_map(results.sort(function (a, b) {\n\
                return a.index - b.index;\n\
            }), function (x) {\n\
                return x.value;\n\
            }));\n\
        });\n\
    };\n\
    async.filter = doParallel(_filter);\n\
    async.filterSeries = doSeries(_filter);\n\
    // select alias\n\
    async.select = async.filter;\n\
    async.selectSeries = async.filterSeries;\n\
\n\
    var _reject = function (eachfn, arr, iterator, callback) {\n\
        var results = [];\n\
        arr = _map(arr, function (x, i) {\n\
            return {index: i, value: x};\n\
        });\n\
        eachfn(arr, function (x, callback) {\n\
            iterator(x.value, function (v) {\n\
                if (!v) {\n\
                    results.push(x);\n\
                }\n\
                callback();\n\
            });\n\
        }, function (err) {\n\
            callback(_map(results.sort(function (a, b) {\n\
                return a.index - b.index;\n\
            }), function (x) {\n\
                return x.value;\n\
            }));\n\
        });\n\
    };\n\
    async.reject = doParallel(_reject);\n\
    async.rejectSeries = doSeries(_reject);\n\
\n\
    var _detect = function (eachfn, arr, iterator, main_callback) {\n\
        eachfn(arr, function (x, callback) {\n\
            iterator(x, function (result) {\n\
                if (result) {\n\
                    main_callback(x);\n\
                    main_callback = function () {};\n\
                }\n\
                else {\n\
                    callback();\n\
                }\n\
            });\n\
        }, function (err) {\n\
            main_callback();\n\
        });\n\
    };\n\
    async.detect = doParallel(_detect);\n\
    async.detectSeries = doSeries(_detect);\n\
\n\
    async.some = function (arr, iterator, main_callback) {\n\
        async.each(arr, function (x, callback) {\n\
            iterator(x, function (v) {\n\
                if (v) {\n\
                    main_callback(true);\n\
                    main_callback = function () {};\n\
                }\n\
                callback();\n\
            });\n\
        }, function (err) {\n\
            main_callback(false);\n\
        });\n\
    };\n\
    // any alias\n\
    async.any = async.some;\n\
\n\
    async.every = function (arr, iterator, main_callback) {\n\
        async.each(arr, function (x, callback) {\n\
            iterator(x, function (v) {\n\
                if (!v) {\n\
                    main_callback(false);\n\
                    main_callback = function () {};\n\
                }\n\
                callback();\n\
            });\n\
        }, function (err) {\n\
            main_callback(true);\n\
        });\n\
    };\n\
    // all alias\n\
    async.all = async.every;\n\
\n\
    async.sortBy = function (arr, iterator, callback) {\n\
        async.map(arr, function (x, callback) {\n\
            iterator(x, function (err, criteria) {\n\
                if (err) {\n\
                    callback(err);\n\
                }\n\
                else {\n\
                    callback(null, {value: x, criteria: criteria});\n\
                }\n\
            });\n\
        }, function (err, results) {\n\
            if (err) {\n\
                return callback(err);\n\
            }\n\
            else {\n\
                var fn = function (left, right) {\n\
                    var a = left.criteria, b = right.criteria;\n\
                    return a < b ? -1 : a > b ? 1 : 0;\n\
                };\n\
                callback(null, _map(results.sort(fn), function (x) {\n\
                    return x.value;\n\
                }));\n\
            }\n\
        });\n\
    };\n\
\n\
    async.auto = function (tasks, callback) {\n\
        callback = callback || function () {};\n\
        var keys = _keys(tasks);\n\
        if (!keys.length) {\n\
            return callback(null);\n\
        }\n\
\n\
        var results = {};\n\
\n\
        var listeners = [];\n\
        var addListener = function (fn) {\n\
            listeners.unshift(fn);\n\
        };\n\
        var removeListener = function (fn) {\n\
            for (var i = 0; i < listeners.length; i += 1) {\n\
                if (listeners[i] === fn) {\n\
                    listeners.splice(i, 1);\n\
                    return;\n\
                }\n\
            }\n\
        };\n\
        var taskComplete = function () {\n\
            _each(listeners.slice(0), function (fn) {\n\
                fn();\n\
            });\n\
        };\n\
\n\
        addListener(function () {\n\
            if (_keys(results).length === keys.length) {\n\
                callback(null, results);\n\
                callback = function () {};\n\
            }\n\
        });\n\
\n\
        _each(keys, function (k) {\n\
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];\n\
            var taskCallback = function (err) {\n\
                var args = Array.prototype.slice.call(arguments, 1);\n\
                if (args.length <= 1) {\n\
                    args = args[0];\n\
                }\n\
                if (err) {\n\
                    var safeResults = {};\n\
                    _each(_keys(results), function(rkey) {\n\
                        safeResults[rkey] = results[rkey];\n\
                    });\n\
                    safeResults[k] = args;\n\
                    callback(err, safeResults);\n\
                    // stop subsequent errors hitting callback multiple times\n\
                    callback = function () {};\n\
                }\n\
                else {\n\
                    results[k] = args;\n\
                    async.setImmediate(taskComplete);\n\
                }\n\
            };\n\
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];\n\
            var ready = function () {\n\
                return _reduce(requires, function (a, x) {\n\
                    return (a && results.hasOwnProperty(x));\n\
                }, true) && !results.hasOwnProperty(k);\n\
            };\n\
            if (ready()) {\n\
                task[task.length - 1](taskCallback, results);\n\
            }\n\
            else {\n\
                var listener = function () {\n\
                    if (ready()) {\n\
                        removeListener(listener);\n\
                        task[task.length - 1](taskCallback, results);\n\
                    }\n\
                };\n\
                addListener(listener);\n\
            }\n\
        });\n\
    };\n\
\n\
    async.waterfall = function (tasks, callback) {\n\
        callback = callback || function () {};\n\
        if (tasks.constructor !== Array) {\n\
          var err = new Error('First argument to waterfall must be an array of functions');\n\
          return callback(err);\n\
        }\n\
        if (!tasks.length) {\n\
            return callback();\n\
        }\n\
        var wrapIterator = function (iterator) {\n\
            return function (err) {\n\
                if (err) {\n\
                    callback.apply(null, arguments);\n\
                    callback = function () {};\n\
                }\n\
                else {\n\
                    var args = Array.prototype.slice.call(arguments, 1);\n\
                    var next = iterator.next();\n\
                    if (next) {\n\
                        args.push(wrapIterator(next));\n\
                    }\n\
                    else {\n\
                        args.push(callback);\n\
                    }\n\
                    async.setImmediate(function () {\n\
                        iterator.apply(null, args);\n\
                    });\n\
                }\n\
            };\n\
        };\n\
        wrapIterator(async.iterator(tasks))();\n\
    };\n\
\n\
    var _parallel = function(eachfn, tasks, callback) {\n\
        callback = callback || function () {};\n\
        if (tasks.constructor === Array) {\n\
            eachfn.map(tasks, function (fn, callback) {\n\
                if (fn) {\n\
                    fn(function (err) {\n\
                        var args = Array.prototype.slice.call(arguments, 1);\n\
                        if (args.length <= 1) {\n\
                            args = args[0];\n\
                        }\n\
                        callback.call(null, err, args);\n\
                    });\n\
                }\n\
            }, callback);\n\
        }\n\
        else {\n\
            var results = {};\n\
            eachfn.each(_keys(tasks), function (k, callback) {\n\
                tasks[k](function (err) {\n\
                    var args = Array.prototype.slice.call(arguments, 1);\n\
                    if (args.length <= 1) {\n\
                        args = args[0];\n\
                    }\n\
                    results[k] = args;\n\
                    callback(err);\n\
                });\n\
            }, function (err) {\n\
                callback(err, results);\n\
            });\n\
        }\n\
    };\n\
\n\
    async.parallel = function (tasks, callback) {\n\
        _parallel({ map: async.map, each: async.each }, tasks, callback);\n\
    };\n\
\n\
    async.parallelLimit = function(tasks, limit, callback) {\n\
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);\n\
    };\n\
\n\
    async.series = function (tasks, callback) {\n\
        callback = callback || function () {};\n\
        if (tasks.constructor === Array) {\n\
            async.mapSeries(tasks, function (fn, callback) {\n\
                if (fn) {\n\
                    fn(function (err) {\n\
                        var args = Array.prototype.slice.call(arguments, 1);\n\
                        if (args.length <= 1) {\n\
                            args = args[0];\n\
                        }\n\
                        callback.call(null, err, args);\n\
                    });\n\
                }\n\
            }, callback);\n\
        }\n\
        else {\n\
            var results = {};\n\
            async.eachSeries(_keys(tasks), function (k, callback) {\n\
                tasks[k](function (err) {\n\
                    var args = Array.prototype.slice.call(arguments, 1);\n\
                    if (args.length <= 1) {\n\
                        args = args[0];\n\
                    }\n\
                    results[k] = args;\n\
                    callback(err);\n\
                });\n\
            }, function (err) {\n\
                callback(err, results);\n\
            });\n\
        }\n\
    };\n\
\n\
    async.iterator = function (tasks) {\n\
        var makeCallback = function (index) {\n\
            var fn = function () {\n\
                if (tasks.length) {\n\
                    tasks[index].apply(null, arguments);\n\
                }\n\
                return fn.next();\n\
            };\n\
            fn.next = function () {\n\
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;\n\
            };\n\
            return fn;\n\
        };\n\
        return makeCallback(0);\n\
    };\n\
\n\
    async.apply = function (fn) {\n\
        var args = Array.prototype.slice.call(arguments, 1);\n\
        return function () {\n\
            return fn.apply(\n\
                null, args.concat(Array.prototype.slice.call(arguments))\n\
            );\n\
        };\n\
    };\n\
\n\
    var _concat = function (eachfn, arr, fn, callback) {\n\
        var r = [];\n\
        eachfn(arr, function (x, cb) {\n\
            fn(x, function (err, y) {\n\
                r = r.concat(y || []);\n\
                cb(err);\n\
            });\n\
        }, function (err) {\n\
            callback(err, r);\n\
        });\n\
    };\n\
    async.concat = doParallel(_concat);\n\
    async.concatSeries = doSeries(_concat);\n\
\n\
    async.whilst = function (test, iterator, callback) {\n\
        if (test()) {\n\
            iterator(function (err) {\n\
                if (err) {\n\
                    return callback(err);\n\
                }\n\
                async.whilst(test, iterator, callback);\n\
            });\n\
        }\n\
        else {\n\
            callback();\n\
        }\n\
    };\n\
\n\
    async.doWhilst = function (iterator, test, callback) {\n\
        iterator(function (err) {\n\
            if (err) {\n\
                return callback(err);\n\
            }\n\
            if (test()) {\n\
                async.doWhilst(iterator, test, callback);\n\
            }\n\
            else {\n\
                callback();\n\
            }\n\
        });\n\
    };\n\
\n\
    async.until = function (test, iterator, callback) {\n\
        if (!test()) {\n\
            iterator(function (err) {\n\
                if (err) {\n\
                    return callback(err);\n\
                }\n\
                async.until(test, iterator, callback);\n\
            });\n\
        }\n\
        else {\n\
            callback();\n\
        }\n\
    };\n\
\n\
    async.doUntil = function (iterator, test, callback) {\n\
        iterator(function (err) {\n\
            if (err) {\n\
                return callback(err);\n\
            }\n\
            if (!test()) {\n\
                async.doUntil(iterator, test, callback);\n\
            }\n\
            else {\n\
                callback();\n\
            }\n\
        });\n\
    };\n\
\n\
    async.queue = function (worker, concurrency) {\n\
        if (concurrency === undefined) {\n\
            concurrency = 1;\n\
        }\n\
        function _insert(q, data, pos, callback) {\n\
          if(data.constructor !== Array) {\n\
              data = [data];\n\
          }\n\
          _each(data, function(task) {\n\
              var item = {\n\
                  data: task,\n\
                  callback: typeof callback === 'function' ? callback : null\n\
              };\n\
\n\
              if (pos) {\n\
                q.tasks.unshift(item);\n\
              } else {\n\
                q.tasks.push(item);\n\
              }\n\
\n\
              if (q.saturated && q.tasks.length === concurrency) {\n\
                  q.saturated();\n\
              }\n\
              async.setImmediate(q.process);\n\
          });\n\
        }\n\
\n\
        var workers = 0;\n\
        var q = {\n\
            tasks: [],\n\
            concurrency: concurrency,\n\
            saturated: null,\n\
            empty: null,\n\
            drain: null,\n\
            push: function (data, callback) {\n\
              _insert(q, data, false, callback);\n\
            },\n\
            unshift: function (data, callback) {\n\
              _insert(q, data, true, callback);\n\
            },\n\
            process: function () {\n\
                if (workers < q.concurrency && q.tasks.length) {\n\
                    var task = q.tasks.shift();\n\
                    if (q.empty && q.tasks.length === 0) {\n\
                        q.empty();\n\
                    }\n\
                    workers += 1;\n\
                    var next = function () {\n\
                        workers -= 1;\n\
                        if (task.callback) {\n\
                            task.callback.apply(task, arguments);\n\
                        }\n\
                        if (q.drain && q.tasks.length + workers === 0) {\n\
                            q.drain();\n\
                        }\n\
                        q.process();\n\
                    };\n\
                    var cb = only_once(next);\n\
                    worker(task.data, cb);\n\
                }\n\
            },\n\
            length: function () {\n\
                return q.tasks.length;\n\
            },\n\
            running: function () {\n\
                return workers;\n\
            }\n\
        };\n\
        return q;\n\
    };\n\
\n\
    async.cargo = function (worker, payload) {\n\
        var working     = false,\n\
            tasks       = [];\n\
\n\
        var cargo = {\n\
            tasks: tasks,\n\
            payload: payload,\n\
            saturated: null,\n\
            empty: null,\n\
            drain: null,\n\
            push: function (data, callback) {\n\
                if(data.constructor !== Array) {\n\
                    data = [data];\n\
                }\n\
                _each(data, function(task) {\n\
                    tasks.push({\n\
                        data: task,\n\
                        callback: typeof callback === 'function' ? callback : null\n\
                    });\n\
                    if (cargo.saturated && tasks.length === payload) {\n\
                        cargo.saturated();\n\
                    }\n\
                });\n\
                async.setImmediate(cargo.process);\n\
            },\n\
            process: function process() {\n\
                if (working) return;\n\
                if (tasks.length === 0) {\n\
                    if(cargo.drain) cargo.drain();\n\
                    return;\n\
                }\n\
\n\
                var ts = typeof payload === 'number'\n\
                            ? tasks.splice(0, payload)\n\
                            : tasks.splice(0);\n\
\n\
                var ds = _map(ts, function (task) {\n\
                    return task.data;\n\
                });\n\
\n\
                if(cargo.empty) cargo.empty();\n\
                working = true;\n\
                worker(ds, function () {\n\
                    working = false;\n\
\n\
                    var args = arguments;\n\
                    _each(ts, function (data) {\n\
                        if (data.callback) {\n\
                            data.callback.apply(null, args);\n\
                        }\n\
                    });\n\
\n\
                    process();\n\
                });\n\
            },\n\
            length: function () {\n\
                return tasks.length;\n\
            },\n\
            running: function () {\n\
                return working;\n\
            }\n\
        };\n\
        return cargo;\n\
    };\n\
\n\
    var _console_fn = function (name) {\n\
        return function (fn) {\n\
            var args = Array.prototype.slice.call(arguments, 1);\n\
            fn.apply(null, args.concat([function (err) {\n\
                var args = Array.prototype.slice.call(arguments, 1);\n\
                if (typeof console !== 'undefined') {\n\
                    if (err) {\n\
                        if (console.error) {\n\
                            console.error(err);\n\
                        }\n\
                    }\n\
                    else if (console[name]) {\n\
                        _each(args, function (x) {\n\
                            console[name](x);\n\
                        });\n\
                    }\n\
                }\n\
            }]));\n\
        };\n\
    };\n\
    async.log = _console_fn('log');\n\
    async.dir = _console_fn('dir');\n\
    /*async.info = _console_fn('info');\n\
    async.warn = _console_fn('warn');\n\
    async.error = _console_fn('error');*/\n\
\n\
    async.memoize = function (fn, hasher) {\n\
        var memo = {};\n\
        var queues = {};\n\
        hasher = hasher || function (x) {\n\
            return x;\n\
        };\n\
        var memoized = function () {\n\
            var args = Array.prototype.slice.call(arguments);\n\
            var callback = args.pop();\n\
            var key = hasher.apply(null, args);\n\
            if (key in memo) {\n\
                callback.apply(null, memo[key]);\n\
            }\n\
            else if (key in queues) {\n\
                queues[key].push(callback);\n\
            }\n\
            else {\n\
                queues[key] = [callback];\n\
                fn.apply(null, args.concat([function () {\n\
                    memo[key] = arguments;\n\
                    var q = queues[key];\n\
                    delete queues[key];\n\
                    for (var i = 0, l = q.length; i < l; i++) {\n\
                      q[i].apply(null, arguments);\n\
                    }\n\
                }]));\n\
            }\n\
        };\n\
        memoized.memo = memo;\n\
        memoized.unmemoized = fn;\n\
        return memoized;\n\
    };\n\
\n\
    async.unmemoize = function (fn) {\n\
      return function () {\n\
        return (fn.unmemoized || fn).apply(null, arguments);\n\
      };\n\
    };\n\
\n\
    async.times = function (count, iterator, callback) {\n\
        var counter = [];\n\
        for (var i = 0; i < count; i++) {\n\
            counter.push(i);\n\
        }\n\
        return async.map(counter, iterator, callback);\n\
    };\n\
\n\
    async.timesSeries = function (count, iterator, callback) {\n\
        var counter = [];\n\
        for (var i = 0; i < count; i++) {\n\
            counter.push(i);\n\
        }\n\
        return async.mapSeries(counter, iterator, callback);\n\
    };\n\
\n\
    async.compose = function (/* functions... */) {\n\
        var fns = Array.prototype.reverse.call(arguments);\n\
        return function () {\n\
            var that = this;\n\
            var args = Array.prototype.slice.call(arguments);\n\
            var callback = args.pop();\n\
            async.reduce(fns, args, function (newargs, fn, cb) {\n\
                fn.apply(that, newargs.concat([function () {\n\
                    var err = arguments[0];\n\
                    var nextargs = Array.prototype.slice.call(arguments, 1);\n\
                    cb(err, nextargs);\n\
                }]))\n\
            },\n\
            function (err, results) {\n\
                callback.apply(that, [err].concat(results));\n\
            });\n\
        };\n\
    };\n\
\n\
    var _applyEach = function (eachfn, fns /*args...*/) {\n\
        var go = function () {\n\
            var that = this;\n\
            var args = Array.prototype.slice.call(arguments);\n\
            var callback = args.pop();\n\
            return eachfn(fns, function (fn, cb) {\n\
                fn.apply(that, args.concat([cb]));\n\
            },\n\
            callback);\n\
        };\n\
        if (arguments.length > 2) {\n\
            var args = Array.prototype.slice.call(arguments, 2);\n\
            return go.apply(this, args);\n\
        }\n\
        else {\n\
            return go;\n\
        }\n\
    };\n\
    async.applyEach = doParallel(_applyEach);\n\
    async.applyEachSeries = doSeries(_applyEach);\n\
\n\
    async.forever = function (fn, callback) {\n\
        function next(err) {\n\
            if (err) {\n\
                if (callback) {\n\
                    return callback(err);\n\
                }\n\
                throw err;\n\
            }\n\
            fn(next);\n\
        }\n\
        next();\n\
    };\n\
\n\
    // AMD / RequireJS\n\
    if (typeof define !== 'undefined' && define.amd) {\n\
        define([], function () {\n\
            return async;\n\
        });\n\
    }\n\
    // Node.js\n\
    else if (typeof module !== 'undefined' && module.exports) {\n\
        module.exports = async;\n\
    }\n\
    // included directly via <script> tag\n\
    else {\n\
        root.async = async;\n\
    }\n\
\n\
}());\n\
//@ sourceURL=caolan-async/lib/async.js"
));
require.register("component-trim/index.js", Function("exports, require, module",
"\n\
exports = module.exports = trim;\n\
\n\
function trim(str){\n\
  return str.replace(/^\\s*|\\s*$/g, '');\n\
}\n\
\n\
exports.left = function(str){\n\
  return str.replace(/^\\s*/, '');\n\
};\n\
\n\
exports.right = function(str){\n\
  return str.replace(/\\s*$/, '');\n\
};\n\
//@ sourceURL=component-trim/index.js"
));
require.register("component-querystring/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var trim = require('trim');\n\
\n\
/**\n\
 * Parse the given query `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
exports.parse = function(str){\n\
  if ('string' != typeof str) return {};\n\
\n\
  str = trim(str);\n\
  if ('' == str) return {};\n\
\n\
  var obj = {};\n\
  var pairs = str.split('&');\n\
  for (var i = 0; i < pairs.length; i++) {\n\
    var parts = pairs[i].split('=');\n\
    obj[parts[0]] = null == parts[1]\n\
      ? ''\n\
      : decodeURIComponent(parts[1]);\n\
  }\n\
\n\
  return obj;\n\
};\n\
\n\
/**\n\
 * Stringify the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
exports.stringify = function(obj){\n\
  if (!obj) return '';\n\
  var pairs = [];\n\
  for (var key in obj) {\n\
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));\n\
  }\n\
  return pairs.join('&');\n\
};\n\
//@ sourceURL=component-querystring/index.js"
));
require.register("ForbesLindesay-seed-random/index.js", Function("exports, require, module",
"var width = 256;// each RC4 output is 0 <= x < 256\n\
var chunks = 6;// at least six RC4 outputs for each double\n\
var significance = 52;// there are 52 significant digits in a double\n\
\n\
var overflow, startdenom; //numbers\n\
\n\
\n\
var oldRandom = Math.random;\n\
//\n\
// seedrandom()\n\
// This is the seedrandom function described above.\n\
//\n\
module.exports = function seedrandom(seed, overRideGlobal) {\n\
  if (!seed) {\n\
    if (overRideGlobal) {\n\
      Math.random = oldRandom;\n\
    }\n\
    return oldRandom;\n\
  }\n\
  var key = [];\n\
  var arc4;\n\
\n\
  // Flatten the seed string or build one from local entropy if needed.\n\
  seed = mixkey(flatten(seed, 3), key);\n\
\n\
  // Use the seed to initialize an ARC4 generator.\n\
  arc4 = new ARC4(key);\n\
\n\
  // Override Math.random\n\
\n\
  // This function returns a random double in [0, 1) that contains\n\
  // randomness in every bit of the mantissa of the IEEE 754 value.\n\
\n\
  function random() {  // Closure to return a random double:\n\
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48\n\
    var d = startdenom;                 //   and denominator d = 2 ^ 48.\n\
    var x = 0;                          //   and no 'extra last byte'.\n\
    while (n < significance) {          // Fill up all significant digits by\n\
      n = (n + x) * width;              //   shifting numerator and\n\
      d *= width;                       //   denominator and generating a\n\
      x = arc4.g(1);                    //   new least-significant-byte.\n\
    }\n\
    while (n >= overflow) {             // To avoid rounding up, before adding\n\
      n /= 2;                           //   last byte, shift everything\n\
      d /= 2;                           //   right using integer Math until\n\
      x >>>= 1;                         //   we have exactly the desired bits.\n\
    }\n\
    return (n + x) / d;                 // Form the number within [0, 1).\n\
  }\n\
  random.seed = seed;\n\
  if (overRideGlobal) {\n\
    Math['random'] = random;\n\
  }\n\
\n\
  // Return the seed that was used\n\
  return random;\n\
};\n\
\n\
//\n\
// ARC4\n\
//\n\
// An ARC4 implementation.  The constructor takes a key in the form of\n\
// an array of at most (width) integers that should be 0 <= x < (width).\n\
//\n\
// The g(count) method returns a pseudorandom integer that concatenates\n\
// the next (count) outputs from ARC4.  Its return value is a number x\n\
// that is in the range 0 <= x < (width ^ count).\n\
//\n\
/** @constructor */\n\
function ARC4(key) {\n\
  var t, u, me = this, keylen = key.length;\n\
  var i = 0, j = me.i = me.j = me.m = 0;\n\
  me.S = [];\n\
  me.c = [];\n\
\n\
  // The empty key [] is treated as [0].\n\
  if (!keylen) { key = [keylen++]; }\n\
\n\
  // Set up S using the standard key scheduling algorithm.\n\
  while (i < width) { me.S[i] = i++; }\n\
  for (i = 0; i < width; i++) {\n\
    t = me.S[i];\n\
    j = lowbits(j + t + key[i % keylen]);\n\
    u = me.S[j];\n\
    me.S[i] = u;\n\
    me.S[j] = t;\n\
  }\n\
\n\
  // The \"g\" method returns the next (count) outputs as one number.\n\
  me.g = function getnext(count) {\n\
    var s = me.S;\n\
    var i = lowbits(me.i + 1); var t = s[i];\n\
    var j = lowbits(me.j + t); var u = s[j];\n\
    s[i] = u;\n\
    s[j] = t;\n\
    var r = s[lowbits(t + u)];\n\
    while (--count) {\n\
      i = lowbits(i + 1); t = s[i];\n\
      j = lowbits(j + t); u = s[j];\n\
      s[i] = u;\n\
      s[j] = t;\n\
      r = r * width + s[lowbits(t + u)];\n\
    }\n\
    me.i = i;\n\
    me.j = j;\n\
    return r;\n\
  };\n\
  // For robust unpredictability discard an initial batch of values.\n\
  // See http://www.rsa.com/rsalabs/node.asp?id=2009\n\
  me.g(width);\n\
}\n\
\n\
//\n\
// flatten()\n\
// Converts an object tree to nested arrays of strings.\n\
//\n\
/** @param {Object=} result \n\
  * @param {string=} prop\n\
  * @param {string=} typ */\n\
function flatten(obj, depth, result, prop, typ) {\n\
  result = [];\n\
  typ = typeof(obj);\n\
  if (depth && typ == 'object') {\n\
    for (prop in obj) {\n\
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)\n\
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}\n\
      }\n\
    }\n\
  }\n\
  return (result.length ? result : obj + (typ != 'string' ? '\\0' : ''));\n\
}\n\
\n\
//\n\
// mixkey()\n\
// Mixes a string seed into a key that is an array of integers, and\n\
// returns a shortened string seed that is equivalent to the result key.\n\
//\n\
/** @param {number=} smear \n\
  * @param {number=} j */\n\
function mixkey(seed, key, smear, j) {\n\
  seed += '';                         // Ensure the seed is a string\n\
  smear = 0;\n\
  for (j = 0; j < seed.length; j++) {\n\
    key[lowbits(j)] =\n\
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));\n\
  }\n\
  seed = '';\n\
  for (j in key) { seed += String.fromCharCode(key[j]); }\n\
  return seed;\n\
}\n\
\n\
//\n\
// lowbits()\n\
// A quick \"n mod width\" for width a power of 2.\n\
//\n\
function lowbits(n) { return n & (width - 1); }\n\
\n\
//\n\
// The following constants are related to IEEE 754 limits.\n\
//\n\
startdenom = Math.pow(width, chunks);\n\
significance = Math.pow(2, significance);\n\
overflow = significance * 2;\n\
//@ sourceURL=ForbesLindesay-seed-random/index.js"
));
require.register("tests/index.js", Function("exports, require, module",
"var formDetection = require('./form-detection')\n\
  , oneClick = require('./one-click')\n\
  , seed = require('seed-random')\n\
  , qs = require('querystring');\n\
\n\
/**\n\
 * Expose tests.\n\
 */\n\
\n\
exports = module.exports = function(minitest){\n\
  var query = parseQuery()\n\
    , assets = getAssets(query);\n\
\n\
  query.tests.forEach(function(name){\n\
    if(/click/.test(name)){\n\
      oneClick(minitest, assets, query);\n\
    }\n\
    if(/form/.test(name)){\n\
      formDetection(minitest, assets, query);\n\
    }\n\
  });\n\
};\n\
\n\
exports.formDetection = formDetection;\n\
exports.oneClick = oneClick;\n\
\n\
/**\n\
 * Parse query string.\n\
 */\n\
\n\
function parseQuery(){\n\
  var search = location.search.slice(1)\n\
    , q = qs.parse(search);\n\
\n\
  q.skip = parseInt(q.skip || 0, 10);\n\
  q.limit = parseInt(q.limit || 0, 10);\n\
  q.tests = q.tests || 'click,form';\n\
  q.tests = q.tests.split(',');\n\
  return q;\n\
}\n\
\n\
/**\n\
 * Get assets based on querystring.\n\
 *\n\
 * @param {Object} query\n\
 * @return {Assets[]}\n\
 */\n\
\n\
function getAssets(query){\n\
  var assets = chrome.extension.getBackgroundPage().FA.Background.assets.models\n\
    , skip = query.skip || 0\n\
    , limit = query.limit || (assets.length - skip)\n\
    , grep = query.grep\n\
    , order = query.order\n\
    , random = seed(order);\n\
\n\
  return assets\n\
  .filter(function(asset){\n\
    if(!grep) return true;\n\
    var match = asset.get('name').indexOf(grep) !== -1;\n\
    return match;\n\
  })\n\
  .sort(function(asset) {\n\
    return order ? (0.5 - random()) : asset.get('name')\n\
  })\n\
  .slice(skip, skip + limit)\n\
}\n\
//@ sourceURL=tests/index.js"
));
require.register("tests/autosave.js", Function("exports, require, module",
"//@ sourceURL=tests/autosave.js"
));
require.register("tests/form-detection.js", Function("exports, require, module",
"var async = require('async')\n\
\t, pb = require('pb')\n\
\t, debug = require('debug')('pbci:tests:formDetection')\n\
\n\
module.exports = function(minitest, assets, options){\n\
\toptions || (options = {});\n\
\n\
  var suite  = minitest.describe('form detection', assets.map(function(asset){ return asset.get('name') }))\n\
\t\t, testDuration = 10000 * (options.timeout || 1);\n\
\n\
\tfunction getTest(key, val){\n\
\t\tvar test;\n\
\n\
\t\tsuite.tests.some(function(t){\n\
\t\t\tif ((t[key] || t.get(key)) === val){\n\
\t\t\t\ttest = t;\n\
\t\t\t\treturn true;\n\
\t\t\t}\n\
\t\t});\n\
\n\
\t\treturn test;\n\
\t}\n\
\n\
\tfunction listener(message, sender){\n\
\t\tif (message.type !== 'test') return;\n\
\n\
\t\tvar test = getTest('tabId', sender.tab.id);\n\
\t\tif (!test) return;\n\
\t\tif (test.state !== 'pending') return;\n\
\n\
\t\t// eventListener?\n\
\t\tif (message.name === 'background data received'){\n\
\t\t\tvar events = message.data && message.data.events && message.data.events.slice();\n\
\t\t\ttest.set('events', events);\n\
\t\t}\n\
\n\
\t\tif (message.name === 'contentscript injected'){\n\
\t\t\ttest.dom || (test.dom = {});\n\
\t\t\ttest.dom[message.data.uuid] || (test.dom[message.data.uuid] = {});\n\
\t\t\ttest.dom[message.data.uuid].iFrame = message.data.iFrame;\n\
\t\t\ttest.dom[message.data.uuid].uuid = message.data.uuid;\n\
\t\t\ttest.dom[message.data.uuid].loaded = false;\n\
\t\t\tif(message.data.iFrame === false) test.set('toploaded', false);\n\
\t\t}\n\
\n\
\t\tif (message.name === 'domready'){\n\
\t\t\ttest.dom || (test.dom = {});\n\
\t\t\ttest.dom[message.data.uuid] || (test.dom[message.data.uuid] = {});\n\
\t\t\ttest.dom[message.data.uuid].loaded = true;\n\
\n\
\t\t\tif(message.data.iFrame === false) test.set('toploaded', true);\n\
\n\
\t\t\tvar domLoading = Object.keys(test.dom).some(function(id){ return test.dom[id].loaded = false })\n\
\t\t\ttest.set('domloaded', !domLoading);\n\
\t\t}\n\
\n\
\t\tif (message.name !== 'form detection') return;\n\
\t\tif (!(message.data && message.data.type === 'login')) return;\n\
\n\
\t\tclearTimeout(test.get('timeout'));\n\
\t\tsuite.pass(test);\n\
\t\tchrome.tabs.remove(sender.tab.id);\n\
\t}\n\
\n\
\tfunction testAsset(asset, done){\n\
\t\tvar title = asset.get('name')\n\
\t\t\t, url  = pb.oneClickUrl(asset.get('url'))\n\
\t\t\t, test = getTest('title', title)\n\
\n\
\t\tclearTimeout(test.get('timeout'));\n\
\t\ttest.inc('runs');\n\
\t\tvar duration = Math.min(testDuration * test.get('runs'), 30000);\n\
\n\
\t\tdebug('start', title, test.state, test.get('runs'), duration);\n\
\n\
\t\ttest.set('domloaded', false);\n\
\n\
\t\tchrome.tabs.create({url: url, active: false}, function(tab){\n\
\t\t\ttest\n\
\t\t\t.set('asset', asset)\n\
\t\t\t.set('tabId', tab.id)\n\
\t\t\t.done(done)\n\
\t\t\t.set('timeout', setTimeout(function(){\n\
\n\
\t\t\t\tchrome.tabs.remove(tab.id);\n\
\n\
\t\t\t\tvar domloaded  = test.get('domloaded');\n\
\t\t\t\tvar toploaded  = test.get('toploaded');\n\
\t\t\t\tvar runs\t\t\t = test.get('runs');\n\
\t\t\t\tvar events\t\t = test.get('events');\n\
\t\t\t\tvar maxRuns\t\t = 2;\n\
\n\
\t\t\t\tvar bgReceived = events && events.some(function(e){ return e.name === 'background data received' && e.data.iFrame === false });\n\
\n\
\t\t\t\tif(!events || !toploaded || !bgReceived){\n\
\n\
\t\t\t\t\tif (runs < maxRuns){ // give it a chance.\n\
\t\t\t\t\t\t\tdebug(test.title, 'runs < maxRuns');\n\
\t\t\t\t\t\t\tdebug(test.title, tab.id, 'run again', {runs: runs, toploaded: toploaded, domloaded: domloaded, bgReceived: bgReceived, duration: duration});\n\
\t\t\t\t\t\t\ttestAsset(asset, done);\n\
\n\
\t\t\t\t\t} else if (runs === maxRuns) { // run one last time individually.\n\
\t\t\t\t\t\t\tdebug(test.title, 'runs === maxRuns');\n\
\t\t\t\t\t\t\tdebug(test.title, tab.id, 'keep till the end', {runs: runs, toploaded: toploaded, domloaded: domloaded, bgReceived: bgReceived, duration: duration});\n\
\t\t\t\t\t\t\tdone();\n\
\n\
\t\t\t\t\t} else if (runs > maxRuns) { // we tried everything.\n\
\t\t\t\t\t\t\tdebug(test.title, 'runs > maxRuns');\n\
\t\t\t\t\t\t\tdebug(test.title, tab.id, 'fail', {runs: runs, toploaded: toploaded, domloaded: domloaded, bgReceived: bgReceived, duration: duration}, test.get('events'));\n\
\t\t\t\t\t\t\tsuite.fail(test);\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t} else { // looks like a legit fail.\n\
\n\
\t\t\t\t\tdebug(test.title, tab.id, 'fail', {runs: runs, toploaded: toploaded, domloaded: domloaded, bgReceived: bgReceived, duration: duration}, test.get('events'));\n\
\t\t\t\t\tsuite.fail(test);\n\
\n\
\t\t\t\t}\n\
\n\
\t\t\t}, duration));\n\
\n\
\t\t});\n\
\t}\n\
\n\
\tsuite.on('start', function(){\n\
\t\tpb.cookies.clear(function(){\n\
\t\t\tpb.setEnv();\n\
\t\t\tchrome.runtime.onMessage.addListener(listener);\n\
\t\t\tvar allDone = false;\n\
\n\
\t\t\tasync.forEachLimit(assets, 3, function(asset, done){\n\
\t\t\t\ttestAsset(asset, function(){\n\
\t\t\t\t\tif(!allDone) done();\n\
\t\t\t\t});\n\
\t\t\t}, function(){\n\
\t\t\t\tallDone = true;\n\
\n\
\t\t\t\tvar tests = suite.tests.filter(function(t){ return t.state === 'pending' });\n\
\t\t\t\tvar assets = tests.map(function(t){ return t.get('asset') });\n\
\n\
\t\t\t\tdebug(JSON.stringify(tests.map(function(t){ return {title: t.title, runs: t && t.get('runs')} })));\n\
\t\t\t\tdebug(JSON.stringify(assets.map(function(t){ return t && t.get('name')})));\n\
\n\
\t\t\t\tasync.forEachSeries(assets, function(asset, next){\n\
\t\t\t\t\tpb.cookies.clear(function(){\n\
\t\t\t\t\t\ttestAsset(asset, next);\n\
\t\t\t\t\t});\n\
\t\t\t\t}, function(){\n\
\t\t\t\t\tdebug('done with individual tests');\n\
\t\t\t\t});\n\
\t\t\t});\n\
\t\t});\n\
\t});\n\
\n\
\tsuite.on('end', function(){\n\
\t\tpb.cookies.clear(function(){\n\
\t\t\tchrome.runtime.onMessage.removeListener(listener);\n\
\t\t});\n\
\t});\n\
}\n\
//@ sourceURL=tests/form-detection.js"
));
require.register("tests/one-click.js", Function("exports, require, module",
"var async = require('async')\n\
\t, pb = require('pb')\n\
\t, debug = require('debug')('pbci:tests:1click')\n\
\n\
module.exports = function(minitest, assets, options){\n\
\toptions || (options = {});\n\
\n\
  var testDuration = 25000 * (options.timeout || 1)\n\
    , suite  = minitest.describe('1click login', assets.map(function(asset){ return asset.get('name') }))\n\
\n\
\tfunction getTest(key, val){\n\
\t\tvar test;\n\
\n\
\t\tsuite.tests.some(function(t){\n\
\t\t\tif ((t[key] || t.get(key)) === val){\n\
\t\t\t\ttest = t;\n\
\t\t\t\treturn true;\n\
\t\t\t}\n\
\t\t});\n\
\n\
\t\treturn test;\n\
\t}\n\
\n\
\tfunction listener(message, sender){\n\
\t\tif (message.type !== 'test') return;\n\
\n\
\t\tvar test = getTest('tabId', sender.tab.id);\n\
\t\tif (!test) return;\n\
\t\tif (test.state !== 'pending') return; // already done\n\
\n\
\t\tif (message.name === 'background data received'){\n\
\t\t\tvar events = message.data && message.data.events && message.data.events.slice();\n\
\t\t\ttest.set('events', events);\n\
\n\
\t\t\ttest.dom || (test.dom = {});\n\
\t\t\ttest.dom[message.data.uuid] || (test.dom[message.data.uuid] = {});\n\
\t\t\ttest.dom[message.data.uuid].loaded = true;\n\
\t\t\tif(message.data.iFrame === false) test.set('toploaded', true);\n\
\t\t\tvar domLoading = Object.keys(test.dom).some(function(id){ return test.dom[id].loaded = false })\n\
\t\t\ttest.set('domloaded', !domLoading);\n\
\t\t}\n\
\n\
\t\tif (message.name === 'contentscript injected'){\n\
\t\t\ttest.dom || (test.dom = {});\n\
\t\t\ttest.dom[message.data.uuid] || (test.dom[message.data.uuid] = {});\n\
\t\t\ttest.dom[message.data.uuid].iFrame = message.data.iFrame;\n\
\t\t\ttest.dom[message.data.uuid].uuid = message.data.uuid;\n\
\t\t\ttest.dom[message.data.uuid].loaded = false;\n\
\t\t\tif(message.data.iFrame === false) test.set('toploaded', false);\n\
\t\t}\n\
\n\
\t\tif (message.name === 'domready'){\n\
\t\t}\n\
\n\
\t\tif (message.name !== 'logged in') return;\n\
\t\tif (!message.status) return; // not the result we're expecting\n\
\n\
\t\tclearTimeout(test.get('timeout'));\n\
\t\tsuite.pass(test);\n\
\t\tchrome.tabs.remove(sender.tab.id);\n\
\t}\n\
\n\
\tfunction testAsset(asset, done){\n\
\t\tvar title = asset.get('name')\n\
\t\t\t, url = pb.oneClickUrl(asset.get('url'), asset.id)\n\
\t\t\t, test = getTest('title', title)\n\
\n\
\t\tclearTimeout(test.get('timeout'));\n\
\n\
\t\ttest.inc('runs');\n\
\t\ttest.emit('run');\n\
\n\
\t\tvar duration = Math.min(testDuration * test.get('runs'), 45000);\n\
\n\
\t\tdebug('start', title, test.state, test.get('runs'), duration);\n\
\n\
\t\ttest.set('domloaded', false);\n\
\n\
\t\tchrome.tabs.create({url: url, active: false}, function(tab){\n\
\t\t\ttest\n\
\t\t\t.set('asset', asset)\n\
\t\t\t.set('tabId', tab.id)\n\
\t\t\t.done(done)\n\
\t\t\t.set('timeout', setTimeout(function(){\n\
\n\
\t\t\t\tchrome.tabs.remove(tab.id);\n\
\n\
\t\t\t\t// determine if test failed legitimally.\n\
\n\
\t\t\t\tvar domloaded  = test.get('domloaded');\n\
\t\t\t\tvar toploaded  = test.get('toploaded');\n\
\t\t\t\tvar runs       = test.get('runs');\n\
\t\t\t\tvar events     = test.get('events');\n\
\t\t\t\tvar maxRuns    = 2;\n\
\n\
\t\t\t\tvar bgReceived = events && events.some(function(e){ return e.name === 'background data received' && e.data.iFrame === false });\n\
\t\t\t\tvar nothingAfterSubmit = events && events.length && events[events.length - 1].name === 'submit form';\n\
\n\
\t\t\t\tif(!events || !toploaded || !bgReceived || nothingAfterSubmit){\n\
\n\
\t\t\t\t\tif (runs < maxRuns){ // give it a chance.\n\
\t\t\t\t\t\t  debug(test.title, 'runs < maxRuns');\n\
\t\t\t\t\t\t\tdebug(test.title, tab.id, 'run again', {runs: runs, toploaded: toploaded, domloaded: domloaded, bgReceived: bgReceived, nothingAfterSubmit: nothingAfterSubmit, duration: duration});\n\
\t\t\t\t\t\t\ttestAsset(asset, done);\n\
\n\
\t\t\t\t\t} else if (runs === maxRuns) { // run one last time individually.\n\
\t\t\t\t\t\t  debug(test.title, 'runs === maxRuns');\n\
\t\t\t\t\t\t  debug(test.title, tab.id, 'keep till the end', {runs: runs, toploaded: toploaded, domloaded: domloaded, bgReceived: bgReceived, nothingAfterSubmit: nothingAfterSubmit, duration: duration});\n\
\t\t\t\t\t\t\tdone();\n\
\n\
\t\t\t\t\t} else if (runs > maxRuns) { // we tried everything.\n\
\t\t\t\t\t\t  debug(test.title, 'runs > maxRuns');\n\
\t\t\t\t\t\t\tdebug(test.title, tab.id, 'fail', {runs: runs, toploaded: toploaded, domloaded: domloaded, bgReceived: bgReceived, nothingAfterSubmit: nothingAfterSubmit, duration: duration}, test.get('events'));\n\
\t\t\t\t\t\t\tsuite.fail(test);\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t} else { // looks like a legit fail.\n\
\n\
\t\t\t\t\tdebug(test.title, tab.id, 'fail', {runs: runs, toploaded: toploaded, domloaded: domloaded, bgReceived: bgReceived, nothingAfterSubmit: nothingAfterSubmit, duration: duration}, test.get('events'));\n\
\t\t\t\t\tsuite.fail(test);\n\
\n\
\t\t\t\t}\n\
\n\
\t\t\t}, duration));\n\
\t\t});\n\
\t}\n\
\n\
\tsuite.on('start', function(){\n\
\t\tpb.cookies.clear(function(){\n\
\t\t\tpb.setEnv();\n\
\t\t\tpb.isTabIgnored.stub();\n\
\t\t\tchrome.runtime.onMessage.addListener(listener);\n\
\t\t\tvar allDone = false;\n\
\n\
\t\t\tasync.forEachLimit(assets, 3, function(asset, done){\n\
\t\t\t\ttestAsset(asset, function(){\n\
\t\t\t\t\tif(!allDone) done();\n\
\t\t\t\t});\n\
\t\t\t}, function(){\n\
\n\
\t\t\t\tallDone = true;\n\
\n\
\t\t\t\t// check for tests still remaining.\n\
\n\
\t\t\t\tvar tests = suite.tests.filter(function(t){ return t.state === 'pending' });\n\
\t\t\t\tvar assets = tests.map(function(t){ return t.get('asset') });\n\
\n\
\t\t\t\tdebug(JSON.stringify(tests.map(function(t){ return {title: t.title, runs: t && t.get('runs')} })));\n\
\t\t\t\tdebug(JSON.stringify(assets.map(function(t){ return t && t.get('name')})));\n\
\n\
\t\t\t\tasync.forEachSeries(assets, function(asset, next){\n\
\t\t\t\t\tpb.cookies.clear(function(){\n\
\t\t\t\t\t\ttestAsset(asset, next);\n\
\t\t\t\t\t});\n\
\t\t\t\t}, function(){\n\
\t\t\t\t\tdebug('done with individual tests');\n\
\t\t\t\t});\n\
\n\
\t\t\t});\n\
\t\t});\n\
\t});\n\
\n\
\tsuite.on('end', function(){\n\
\t\tpb.cookies.clear(function(){\n\
\t\t\tpb.isTabIgnored.restore();\n\
\t\t\tchrome.runtime.onMessage.removeListener(listener);\n\
\t\t});\n\
\t});\n\
}\n\
//@ sourceURL=tests/one-click.js"
));
require.register("yields-isArray/index.js", Function("exports, require, module",
"\n\
/**\n\
 * isArray\n\
 */\n\
\n\
var isArray = Array.isArray;\n\
\n\
/**\n\
 * toString\n\
 */\n\
\n\
var str = Object.prototype.toString;\n\
\n\
/**\n\
 * Whether or not the given `val`\n\
 * is an array.\n\
 *\n\
 * example:\n\
 *\n\
 *        isArray([]);\n\
 *        // > true\n\
 *        isArray(arguments);\n\
 *        // > false\n\
 *        isArray('');\n\
 *        // > false\n\
 *\n\
 * @param {mixed} val\n\
 * @return {bool}\n\
 */\n\
\n\
module.exports = isArray || function (val) {\n\
  return !! val && '[object Array]' == str.call(val);\n\
};\n\
//@ sourceURL=yields-isArray/index.js"
));
require.register("pb/index.js", Function("exports, require, module",
"/**\n\
 * Expose utility functions.\n\
 */\n\
\n\
module.exports = {\n\
  oneClickUrl: oneClickUrl,\n\
  setEnv: setEnv,\n\
  cookies: require('./cookies'),\n\
\tisTabIgnored: require('./isTabIgnored')\n\
}\n\
\n\
/**\n\
 * Make a given `url` look like a one-click url, as used in pb's extension\n\
 *\n\
 * @param {String} url\n\
 * @param {String} loginId optional\n\
 * @api public\n\
 */\n\
\n\
function oneClickUrl(url, loginId){\n\
  if (url.indexOf('http') !== 0)\n\
    url = 'http://' + url;\n\
\n\
  loginId || (loginId = Math.random().toString(36).substring(2, 15));\n\
  url += ((url.split(\"?\").length > 1) ? \"&pb_login=\" : \"?pb_login=\") + loginId + \"&pb_source=testRunner\";\n\
  return url;\n\
}\n\
\n\
/**\n\
 * Set the extension's `env` variable to 'test'.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function setEnv(){\n\
  chrome.extension.getBackgroundPage().PB.Config.env = 'test';\n\
}\n\
//@ sourceURL=pb/index.js"
));
require.register("pb/cookies.js", Function("exports, require, module",
"\n\
/**\n\
 * Dependencies.\n\
 */\n\
\n\
var async = require('async')\n\
  , isArray = require('isArray')\n\
  , debug = require('debug')('pbci:pb:cookies');\n\
\n\
\n\
/**\n\
 * Clear cookies in browser, optionally only on one or several urls.\n\
 *\n\
 * @param {Array|String} urls\n\
 * @param {Function} done\n\
 * @api public\n\
 */\n\
\n\
exports.clear = function clearCookies(urls, done){\n\
  if(arguments.length < 2){ done = urls; urls = undefined; }\n\
\n\
  if(!urls) {\n\
\t\tclearAllCookies(done);\n\
\t\treturn;\n\
\t}\n\
\n\
  if(!isArray(urls)){ urls = [urls] }\n\
\n\
  var domains = urls.map(function(url){ return chrome.extension.getBackgroundPage().FA.getDomainFromUrl(url); })\n\
  domains = domains.concat(domains.map(function(d){ return '.' + d; }));\n\
\n\
  async.forEach(domains, function(domain, done){\n\
    chrome.cookies.getAll({domain: domain}, function(cookies) {\n\
      debug('#clearCookies', cookies.length);\n\
      async.forEach(cookies, clearCookie, done);\n\
    });\n\
  }, done);\n\
}\n\
\n\
/**\n\
 * Clear all cookies in browser.\n\
 *\n\
 * @param {Function} done\n\
 * @api private\n\
 */\n\
function clearAllCookies(done){\n\
  chrome.cookies.getAll({}, function(cookies){\n\
    debug('#clearAllCookies', cookies.length);\n\
    async.forEach(cookies, clearCookie, done);\n\
  });\n\
}\n\
\n\
/**\n\
 * Clear one cookie from browser.\n\
 *\n\
 * @param {Cookie} cookie\n\
 * @param {Function} done\n\
 * @api private\n\
 */\n\
\n\
function clearCookie(cookie, done){\n\
\tif(isPasswordBoxCookie(cookie)) return done();\n\
\n\
  var query = {\n\
    url: \"http\"+(cookie.secure ? \"s\" : \"\")+\"://\" + cookie.domain + cookie.path,\n\
    name: cookie.name\n\
  }\n\
\n\
  chrome.cookies.remove(query, function(details){\n\
    if (details == null) return done(chrome.runtime.lastError);\n\
    done(undefined, details);\n\
  });\n\
}\n\
\n\
function isPasswordBoxCookie(cookie){\n\
\treturn cookie.domain && /passwordbox|psswrdbx/i.test(cookie.domain)\n\
}\n\
//@ sourceURL=pb/cookies.js"
));
require.register("pb/isTabIgnored.js", Function("exports, require, module",
"var original = chrome.extension.getBackgroundPage().FA.Background.isTabIgnored;\n\
\n\
module.exports = {\n\
\tstub: stub,\n\
\trestore: restore\n\
}\n\
\n\
function stub(val){\n\
\tif(typeof val === 'undefined') val = false;\n\
\tchrome.extension.getBackgroundPage().FA.Background.isTabIgnored = function(){ return val }\n\
}\n\
\n\
function restore(){\n\
\tchrome.extension.getBackgroundPage().FA.Background.isTabIgnored = original\n\
}\n\
//@ sourceURL=pb/isTabIgnored.js"
));
require.register("PBCI/index.js", Function("exports, require, module",
"var Minitest = require('minitest')\n\
  , tests = require('tests');\n\
\n\
var minitest = window.minitest = new Minitest();\n\
minitest.use(tests);\n\
minitest.run();\n\
//@ sourceURL=PBCI/index.js"
));












require.alias("minitest/index.js", "PBCI/deps/minitest/index.js");
require.alias("minitest/runner.js", "PBCI/deps/minitest/runner.js");
require.alias("minitest/suite.js", "PBCI/deps/minitest/suite.js");
require.alias("minitest/test.js", "PBCI/deps/minitest/test.js");
require.alias("minitest/index.js", "minitest/index.js");
require.alias("component-emitter/index.js", "minitest/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("reporters/index.js", "minitest/deps/reporters/index.js");
require.alias("reporters/base.js", "minitest/deps/reporters/base.js");
require.alias("reporters/html.js", "minitest/deps/reporters/html.js");
require.alias("reporters/csv.js", "minitest/deps/reporters/csv.js");
require.alias("reporters/json.js", "minitest/deps/reporters/json.js");
require.alias("component-progress/index.js", "reporters/deps/progress/index.js");
require.alias("component-autoscale-canvas/index.js", "component-progress/deps/autoscale-canvas/index.js");

require.alias("visionmedia-debug/index.js", "reporters/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "reporters/deps/debug/debug.js");

require.alias("component-classes/index.js", "reporters/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("moment-moment/moment.js", "reporters/deps/moment/moment.js");
require.alias("moment-moment/moment.js", "reporters/deps/moment/index.js");
require.alias("moment-moment/moment.js", "moment-moment/index.js");
require.alias("olivoil-progress/index.js", "reporters/deps/progress/index.js");
require.alias("component-progress/index.js", "olivoil-progress/deps/progress/index.js");
require.alias("component-autoscale-canvas/index.js", "component-progress/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "olivoil-progress/deps/raf/index.js");

require.alias("component-ease/index.js", "olivoil-progress/deps/ease/index.js");

require.alias("component-autoscale-canvas/index.js", "olivoil-progress/deps/autoscale-canvas/index.js");

require.alias("olivoil-pie/index.js", "reporters/deps/pie/index.js");
require.alias("component-raf/index.js", "olivoil-pie/deps/raf/index.js");

require.alias("component-ease/index.js", "olivoil-pie/deps/ease/index.js");

require.alias("component-autoscale-canvas/index.js", "olivoil-pie/deps/autoscale-canvas/index.js");

require.alias("pb/index.js", "reporters/deps/pb/index.js");
require.alias("pb/cookies.js", "reporters/deps/pb/cookies.js");
require.alias("pb/isTabIgnored.js", "reporters/deps/pb/isTabIgnored.js");
require.alias("caolan-async/lib/async.js", "pb/deps/async/lib/async.js");
require.alias("caolan-async/lib/async.js", "pb/deps/async/index.js");
require.alias("caolan-async/lib/async.js", "caolan-async/index.js");
require.alias("yields-isArray/index.js", "pb/deps/isArray/index.js");

require.alias("visionmedia-debug/index.js", "pb/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "pb/deps/debug/debug.js");

require.alias("tests/index.js", "PBCI/deps/tests/index.js");
require.alias("tests/autosave.js", "PBCI/deps/tests/autosave.js");
require.alias("tests/form-detection.js", "PBCI/deps/tests/form-detection.js");
require.alias("tests/one-click.js", "PBCI/deps/tests/one-click.js");
require.alias("tests/index.js", "tests/index.js");
require.alias("caolan-async/lib/async.js", "tests/deps/async/lib/async.js");
require.alias("caolan-async/lib/async.js", "tests/deps/async/index.js");
require.alias("caolan-async/lib/async.js", "caolan-async/index.js");
require.alias("visionmedia-debug/index.js", "tests/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "tests/deps/debug/debug.js");

require.alias("component-querystring/index.js", "tests/deps/querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("ForbesLindesay-seed-random/index.js", "tests/deps/seed-random/index.js");

require.alias("pb/index.js", "tests/deps/pb/index.js");
require.alias("pb/cookies.js", "tests/deps/pb/cookies.js");
require.alias("pb/isTabIgnored.js", "tests/deps/pb/isTabIgnored.js");
require.alias("caolan-async/lib/async.js", "pb/deps/async/lib/async.js");
require.alias("caolan-async/lib/async.js", "pb/deps/async/index.js");
require.alias("caolan-async/lib/async.js", "caolan-async/index.js");
require.alias("yields-isArray/index.js", "pb/deps/isArray/index.js");

require.alias("visionmedia-debug/index.js", "pb/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "pb/deps/debug/debug.js");

require.alias("pb/index.js", "PBCI/deps/pb/index.js");
require.alias("pb/cookies.js", "PBCI/deps/pb/cookies.js");
require.alias("pb/isTabIgnored.js", "PBCI/deps/pb/isTabIgnored.js");
require.alias("pb/index.js", "pb/index.js");
require.alias("caolan-async/lib/async.js", "pb/deps/async/lib/async.js");
require.alias("caolan-async/lib/async.js", "pb/deps/async/index.js");
require.alias("caolan-async/lib/async.js", "caolan-async/index.js");
require.alias("yields-isArray/index.js", "pb/deps/isArray/index.js");

require.alias("visionmedia-debug/index.js", "pb/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "pb/deps/debug/debug.js");
