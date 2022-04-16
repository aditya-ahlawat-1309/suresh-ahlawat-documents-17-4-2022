var formDetection = require('./form-detection')
  , oneClick = require('./one-click')
  , seed = require('seed-random')
  , qs = require('querystring');

/**
 * Expose tests.
 */

exports = module.exports = function(minitest){
  var query = parseQuery()
    , assets = getAssets(query);

  query.tests.forEach(function(name){
    if(/click/.test(name)){
      oneClick(minitest, assets, query);
    }
    if(/form/.test(name)){
      formDetection(minitest, assets, query);
    }
  });
};

exports.formDetection = formDetection;
exports.oneClick = oneClick;

/**
 * Parse query string.
 */

function parseQuery(){
  var search = location.search.slice(1)
    , q = qs.parse(search);

  q.skip = parseInt(q.skip || 0, 10);
  q.limit = parseInt(q.limit || 0, 10);
  q.tests = q.tests || 'click,form';
  q.tests = q.tests.split(',');
  return q;
}

/**
 * Get assets based on querystring.
 *
 * @param {Object} query
 * @return {Assets[]}
 */

function getAssets(query){
  var assets = chrome.extension.getBackgroundPage().FA.Background.assets.models
    , skip = query.skip || 0
    , limit = query.limit || (assets.length - skip)
    , grep = query.grep
    , order = query.order
    , random = seed(order);

  return assets
  .filter(function(asset){
    if(!grep) return true;
    var match = asset.get('name').indexOf(grep) !== -1;
    return match;
  })
  .sort(function(asset) {
    return order ? (0.5 - random()) : asset.get('name')
  })
  .slice(skip, skip + limit)
}
