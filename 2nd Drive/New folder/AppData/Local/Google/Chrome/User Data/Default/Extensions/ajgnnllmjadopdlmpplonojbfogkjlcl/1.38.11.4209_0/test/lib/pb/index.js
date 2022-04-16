/**
 * Expose utility functions.
 */

module.exports = {
  oneClickUrl: oneClickUrl,
  setEnv: setEnv,
  cookies: require('./cookies'),
	isTabIgnored: require('./isTabIgnored')
}

/**
 * Make a given `url` look like a one-click url, as used in pb's extension
 *
 * @param {String} url
 * @param {String} loginId optional
 * @api public
 */

function oneClickUrl(url, loginId){
  if (url.indexOf('http') !== 0)
    url = 'http://' + url;

  loginId || (loginId = Math.random().toString(36).substring(2, 15));
  url += ((url.split("?").length > 1) ? "&pb_source=testRunner" : "?pb_source=testRunner");
  return url;
}

/**
 * Set the extension's `env` variable to 'test'.
 *
 * @api public
 */

function setEnv(){
  chrome.extension.getBackgroundPage().PB.Config.env = 'test';
}
