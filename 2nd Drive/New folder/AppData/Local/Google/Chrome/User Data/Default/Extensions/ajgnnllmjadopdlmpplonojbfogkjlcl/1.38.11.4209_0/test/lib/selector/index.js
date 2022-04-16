
var Emitter = require('emitter')
  , domify = require('domify')
  , model = require('model')
  , reactive = require('reactive')

module.exports = Selector;

var Config = model('Config')
  .attr('grep', {type: 'string'})
  .attr('timeout', {type: 'number'})
  .attr('focus', {type: 'boolean'})
  .attr('fromAsset', {type: 'number'})
  .attr('toAsset', {type: 'number'})

function getAssets(){
  return chrome.extension.getBackgroundPage().FA.Background.assets.models;
}

function Selector(el){
  this.el = el;

  this.assets = getAssets();

  this.config = new Config({
    grep: '',
    timeout: 10*1000,
    focus: false,
    fromAsset: 0,
    toAsset: this.assets.length - 1
  })

  window.selector = this;

  this.render();
}

Emitter(Selector.prototype);

Selector.prototype.render = function(){
  reactive(document.querySelector('#setup #config'), this.config, this);
  return this;
}

Selector.prototype.run = function(){
  var assets = this.assets.slice(this.config.fromAsset(), this.config.toAsset() + 1)
  this.emit('run', this.assets.slice(this.config.fromAsset(), this.config.toAsset() + 1), this.config.toJSON());
}

Selector.prototype.download = function(){
  console.log('download');
  this.emit('download');
}

Selector.prototype.changeGrep = function(e){
  var grep = e.target.value;
  this.config.grep(grep);
}

Selector.prototype.changeTimeout = function(e){
  var timeout = parseInt(e.target.value, 10);
  this.config.timeout(timeout);
}

Selector.prototype.changeFocus = function(e){
  var focus = e.target.checked;
  this.config.focus(focus);
}

Selector.prototype.changeFrom = function(e){
  var from = parseInt(e.target.value, 10);
  this.config.fromAsset(from);
}

Selector.prototype.changeTo = function(e){
  var to = parseInt(e.target.value, 10);
  this.config.toAsset(to);
}
