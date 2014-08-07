var http = require('http');
var Q = require('q');
var _url = require('url');

/**
 * Simplifies http requests and wraps them in a promise.
 * @param url
 * @param method
 * @param data JSON object
 * @returns {promise|Q.promise}
 */
function makeRequest(url, method, data) {
	var deferred = Q.defer();

	var headers;
	if (data) {
		headers = {
			'Content-Type': 'application/json'
		};
	}

	var parsed = _url.parse(url);
	var request = http.request({
		host: parsed.hostname,
		port: parsed.port,
		path: parsed.pathname,
		method: method,
		headers: headers
	}, function (response) {
		var body = '';
		response.on('data', function (chunk) {
			body += chunk;
		});
		response.on('end', function () {
			var data = body;
			try {
				data = JSON.parse(data);
			} catch (e) {
				// Do nothing. Falling back to string data
			}
			deferred.resolve(data);
		});
	});
	request.on('error', function (e) {
		deferred.reject(e);
	});
	if (data) {
		request.write(JSON.stringify(data));
	}
	request.end();
	return deferred.promise;
}

module.exports = {
	get: function (url) {
		return makeRequest(url, 'get');
	},
	put: function (url, data) {
		return makeRequest(url, 'put', data);
	},
	post: function (url, data) {
		return makeRequest(url, 'post', data);
	}
};