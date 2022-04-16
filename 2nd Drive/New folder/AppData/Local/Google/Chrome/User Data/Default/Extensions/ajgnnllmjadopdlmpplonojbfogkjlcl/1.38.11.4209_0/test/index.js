var Minitest = require('minitest')
  , tests = require('tests');

var minitest = window.minitest = new Minitest();
minitest.use(tests);
minitest.run();
