if (!window.Mindspark_) {
	window.Mindspark_ = {};
}

if (!Mindspark_.shared) {
	Mindspark_.shared = {};
}

Mindspark_.shared.utils = (function(_) {


	return {
		isNullOrUndefined: function(object) {
			return _.isNull(object) || _.isUndefined(object);
		},

		// Same as "v ? v : defaultValue" or "v || defaultValue", but doesn't evaluate
		// v twice, and doesn't use defaultValue for 0 or false.
		defaultVal: function (v, defaultValue) {
			if (typeof(v) === 'undefined' || v === null || v === '') {
				if (typeof(defaultValue) === 'undefined')
					return null;
				return defaultValue;
			}
			return v;
		},

		getBoolean: function(value, defaultValue) {
			if (_.isNull(value)) {
				return defaultValue;
			} else {
				return value === "false" ? false : !!value;
			}
		},

		makeQueryString: function (params) {
			if (this.isNullOrUndefined(params))
				return '';

			var q = '';
			for (var p in params) {
				if (params.hasOwnProperty(p)) {
					var v = params[p];
					if (!this.isNullOrUndefined(v)) {
						// Values can be Objects that specify an "encodedValue"
						// property to avoid re-encoding values
						if (!_.isObject(v)) {
							v = encodeURIComponent(v);
						} else {
							v = v.encodedValue;
						}

						q += '&' + p + '=' + v;
					}
				}
			}
			return q.substring(1);
		},

		// TODO: Introduce a private method that abstracts the XMLHttpRequest
		getExternalData: function(url, callback) {
			var externalRequest = new XMLHttpRequest();
			externalRequest.open("get", url, true);
			externalRequest.onreadystatechange = function() {
				if (externalRequest.readyState == 4) {
					if (externalRequest.status == 200) {
						if (callback) {
							callback(externalRequest.responseText);
						}
					}
				}
			};
			externalRequest.send();
		},

		// TODO: Introduce a private method that abstracts the XMLHttpRequest
		postExternalData: function(url, body, callback) {
			var externalRequest = new XMLHttpRequest();
			externalRequest.open("post", url, true);
			externalRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			externalRequest.onreadystatechange = function() {
				if (externalRequest.readyState == 4) {
					if (externalRequest.status == 200) {
						if (callback) {
							callback(externalRequest.responseText);
						}
					}
				}
			};
			externalRequest.send(body);
		},

		// Returns a random integer between 0 and max, inclusive (from developer.mozilla.org)
		// If max is omitted, uses 2^31 - 1 (Java Integer.MAX_VALUE)
		// Using Math.round() will give you a non-uniform distribution!
		randomInt: function (max) {
			return Math.floor(Math.random() * (this.defaultVal(max, 2147483646) + 1));
		}
	};
}(Mindspark_.underscore));