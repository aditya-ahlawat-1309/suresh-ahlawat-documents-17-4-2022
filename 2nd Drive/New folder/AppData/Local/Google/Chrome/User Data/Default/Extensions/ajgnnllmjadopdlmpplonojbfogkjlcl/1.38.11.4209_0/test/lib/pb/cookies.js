
/**
 * Dependencies.
 */

var async = require('async')
  , isArray = require('isArray')
  , debug = require('debug')('pbci:pb:cookies');


/**
 * Clear cookies in browser, optionally only on one or several urls.
 *
 * @param {Array|String} urls
 * @param {Function} done
 * @api public
 */

exports.clear = function clearCookies(urls, done){
  if(arguments.length < 2){ done = urls; urls = undefined; }

  if(!urls) {
		clearAllCookies(done);
		return;
	}

  if(!isArray(urls)){ urls = [urls] }

  var domains = urls.map(function(url){ return chrome.extension.getBackgroundPage().FA.getDomainFromUrl(url); })
  domains = domains.concat(domains.map(function(d){ return '.' + d; }));

  async.forEach(domains, function(domain, done){
    chrome.cookies.getAll({domain: domain}, function(cookies) {
      debug('#clearCookies', cookies.length);
      async.forEach(cookies, clearCookie, done);
    });
  }, done);
}

/**
 * Clear all cookies in browser.
 *
 * @param {Function} done
 * @api private
 */
function clearAllCookies(done){
  chrome.cookies.getAll({}, function(cookies){
    debug('#clearAllCookies', cookies.length);
    async.forEach(cookies, clearCookie, done);
  });
}

/**
 * Clear one cookie from browser.
 *
 * @param {Cookie} cookie
 * @param {Function} done
 * @api private
 */

function clearCookie(cookie, done){
	if(isPasswordBoxCookie(cookie)) return done();

  var query = {
    url: "http"+(cookie.secure ? "s" : "")+"://" + cookie.domain + cookie.path,
    name: cookie.name
  }

  chrome.cookies.remove(query, function(details){
    if (details == null) return done(chrome.runtime.lastError);
    done(undefined, details);
  });
}

function isPasswordBoxCookie(cookie){
	return cookie.domain && /passwordbox|psswrdbx/i.test(cookie.domain)
}
