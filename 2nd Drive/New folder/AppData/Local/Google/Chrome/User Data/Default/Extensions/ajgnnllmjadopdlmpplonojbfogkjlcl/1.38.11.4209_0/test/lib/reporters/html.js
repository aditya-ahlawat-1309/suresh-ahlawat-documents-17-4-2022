
/**
 * Dependencies.
 */

var Base = require('./base')
  , pb = require('pb')
  , classes = require('classes')
  , Progress = require('progress')
  , Pie = require('pie')
  , CSV = require('./csv')
  , debug = require('debug')('pbci:reporters:html');

/**
 * Expose `HTMLReporter`.
 */

exports = module.exports = HTMLReporter;

/**
 * Make a new `HTMLReporter`.
 *
 * @param {Runner} runner
 */

function HTMLReporter(runner){
  var root = document.getElementById('minitest');

  var suites = document.createElement('div');
  suites.className = 'suites';

  var details = document.createElement('div');
  details.className = 'details';

  root.appendChild(suites);
  root.appendChild(details);

  runner.on('suite start', function(suite){
    var csv = new CSV(suite);

    var container = document.createElement('div');
    container.className = 'suite';
    suites.appendChild(container);

    var title = document.createElement('h2')
      , progress = new Progress
      , percent = 0
      , pass = 0
      , fail = 0;

    text(title, suite.fullTitle());
    on(title, 'click', function(){ csv.download() });
    progress.size(60).fontSize(12).update(percent);

    title.appendChild(progress.el);
    container.appendChild(title);

    var box = document.createElement('div');
    box.className = 'boxes';
    container.appendChild(box);

    var els = boxes(suite.length());
    els.forEach(function(el){ box.appendChild(el) });

    var errors = document.createElement('ul');
    errors.className = 'errors';
    errors.appendChild(title.cloneNode());
    details.appendChild(errors);
    show(errors, 'errors');
    var n = 0;

    var i = 0;
    suite.on('pass', function(test){
      pass++;
      var el = els[i++];
      el.href = pb.oneClickUrl(test.get('asset').get('url'));
      el.title = test.fullTitle();
      el.target = '_blank';
      show(el, 'test pass');

      percent += (1 / suite.tests.length) * 100;
      debug('update progress', percent);
      progress.animate(percent);
    });

    suite.on('fail', function(test){
      fail++;
      var id = 'error-' + ++n;
      var el = els[i++];
      el.href = pb.oneClickUrl(test.get('asset').get('url'));
      el.title = test.fullTitle();
      el.target = '_blank';
      show(el, 'test fail');

      percent += (1 / suite.tests.length) * 100;
      debug('update progress', percent);
      progress.animate(percent);

      var events = test.get('events') || [{name: 'no events', data: {}}];
      var msg = events.reduce(function(stack, evt, j){
        stack += '\n';
        stack += '#' + j + ' ' + evt.name;
        for (var key in evt.data){
          stack += '\n\t' + key + ' => ' + JSON.stringify(evt.data[key]);
        }
        return stack + '\n';
      }, '');

      var pre = document.createElement('pre');
      pre.className = 'events';
      on(pre, 'click', function(){
        classes(pre).toggle('show');
      });
      text(pre, msg);

      var title = document.createElement('h3');
      title.setAttribute('id', id);
      text(title, test.fullTitle() + ' (' + test.get('runs') + ' runs)');
 
      var li = document.createElement('li');
      li.appendChild(title);
      li.appendChild(pre);
      errors.appendChild(li);
      show(li, 'error');
    });

    suite.on('end', function(){
      var pie = new Pie
        , data = [{value: pass, color: 'rgba(25,151,63,1)'}, {value: fail, color: 'rgba(204,0,0,1)'}]
        , percent = Math.min(Math.ceil((pass / (pass + fail)) * 100), 100)
        , label = percent + '%'
        , color = 'rgba(25,151,63,1)' // green

      if(percent < 98) color = 'rgba(223,111,0,1)'; // orange
      if(percent < 75) color = 'rgba(204,0,0,1)';  // red

      pie.size(60).fontSize(12).color(color);
      title.replaceChild(pie.el, progress.el);
      pie.text(label).animate(data);
    });

    function show(el, classname){
      el.className = classname;
      setTimeout(function(){
        el.className = classname + ' show';
      }, 0);
    }

  });

}

/**
 * Create `n` boxes.
 */

function boxes(n) {
  var els = [];

  for (var i = 0; i < n; i++) {
    var el = document.createElement('a');
    el.className = 'test';
    els.push(el);
  }

  return els;
}

/**
 * Set `el` text to `str`.
 */

function text(el, str) {
  if (el.textContent) {
    el.textContent = str;
  } else {
    el.innerText = str;
  }
}

/**
 * Listen on `event` with callback `fn`.
 */

function on(el, event, fn) {
  if (el.addEventListener) {
    el.addEventListener(event, fn, false);
  } else {
    el.attachEvent('on' + event, fn);
  }
}
