"use strict";

var _ = require("lodash");
var requestPromise = require("request-promise");
var crypto = require("crypto");

var KiteConnect = function(api_key, options) {
	var self = this,
		defaults = {
			"api_key": api_key,
			"root": "https://api.kite.trade",
			"login": "https://kite.trade/connect/login",
			"debug": false,
			"timeout": 7,
			"micro_cache": true,
			"access_token": null
		};

	this.options = _.extend(defaults, options);

	var routes = {
		"parameters": "/parameters",
		"api.validate": "/session/token",
		"api.invalidate": "/session/token",
		"user.margins": "/user/margins/{segment}",

		"orders": "/orders",
		"trades": "/trades",
		"orders.info": "/orders/{order_id}",

		"orders.place": "/orders/{variety}",
		"orders.modify": "/orders/{variety}/{order_id}",
		"orders.cancel": "/orders/{variety}/{order_id}",
		"orders.trades": "/orders/{order_id}/trades",

		"portfolio.positions": "/portfolio/positions",
		"portfolio.holdings": "/portfolio/holdings",
		"portfolio.positions.modify": "/portfolio/positions",

		"market.instruments.all": "/instruments",
		"market.instruments": "/instruments/{exchange}",
		"market.quote": "/instruments/{exchange}/{tradingsymbol}",
		"market.historical": "/instruments/historical/{instrument_token}/{interval}",
		"market.trigger_range": "/instruments/{exchange}/{tradingsymbol}/trigger_range"
	}

	// Exposed methods
	this.setAccessToken = function(access_token) {
		this.options.access_token = access_token;
	};

	this.setSessionHook = function(callback) {
		// TO IMPLEMENT
	};

	this.loginUrl = function() {
		// Return kiteconnect login url
		return this.options.login + "?api_key=" + this.options.api_key;
	};

	this.requestAccessToken = function(request_token, secret) {
		var checksum = crypto.createHash("sha256")
						.update(this.options.api_key + this.options.request_token + this.options.secret)
						.digest("hex");

		return _post("api.validate", {
			"request_token": request_token,
			"checksum": checksum
		})
	};

	this.invalidateToken = function(access_token) {
		var params = {};
		if(access_token) {
			params.access_token = access_token;
		}

		return _delete("api.invalidate", params);
	};

	this.margins = function(segment) {
		return _get("user.margins", {"segment": segment})
	};

	this.orderPlace = function(options) {
		// TO IMPLEMENT
	};

	this.orderModify = function(options) {
		// TO IMPLEMENT
	};

	this.orderCancel = function(options) {
		// TO IMPLEMENT
	};

	this.orders = function(order_id) {
		if(order_id) {
			return  _get("orders.info", {"order_id": order_id});
		} else {
			return _get("orders");
		}
	};

	this.trades = function(order_id) {
		if(order_id) {
			return  _get("orders.trades", {"order_id": order_id});
		} else {
			return _get("trades");
		}
	};

	this.holdings = function() {
		return _get("portfolio.holdings");
	};

	this.positions = function() {
		return _get("portfolio.positions");
	};

	this.productModify = function(options) {
		// TO IMPLEMENT
	};

	this.instruments = function(exchange) {
		// TO IMPLEMENT
	};

	this.quote = function(exchange, tradingsymbol) {
		return _get("market.quote", {"exchange": exchange, "tradingsymbol": tradingsymbol});
	};

	this.historical = function(self, instrument_token, from_date, to_date, interval) {
		// TO IMPLEMENT
	};

	this.trigger_range = function(exchange, tradingsymbol, transaction_type) {
		return _get("market.trigger_range",
			{
				"exchange": exchange,
				"tradingsymbol": tradingsymbol,
				"transaction_type": transaction_type
			})
	};

	function parseCsv() {
		// TO IMPLEMENT
	}

	function _get(route, params) {
		if(params === undefined) {
			params = {};
		}

		return request(route, "GET", params);
	}

	function _post(route, params) {
		if(params === undefined) {
			params = {};
		}

		return request(route, "POST", params);
	}

	function _put(route, params) {
		if(params === undefined) {
			params = {};
		}

		return request(route, "PUT", params);
	}

	function _delete(route, params) {
		if(params === undefined) {
			params = {};
		}

		return request(route, "DELETE", params);
	}

	function jsonResponseParse(body, response, resolveWithFullResponse) {
		if (response.headers["content-type"] === "application/json") {
			try {
				return JSON.parse(body);
			}
			catch(err) {
				throw "Couldn't parse the JSON response.";
			}
		} else {
			throw "Unknown Content-Type " + response.headers["content-type"] + " in response: " + body;
		}

		// TODO: Instruments CSV response
	}

	function request(route, method, params) {
		if(params === undefined) {
			params = {};
		}

		// Check microcache
		if(!self.options.micro_cache) {
			params.no_micro_cache = 1;
		}

		// Check access token
		if(self.options.access_token) {
			params.access_token = self.options.access_token;
		}

		// Check for api_key
		if(!params.api_key) {
			params.api_key = self.options.api_key;
		}

		var uri = routes[route];

		// Replace variables in "RESTful" URLs with corresponding params
		if(uri.indexOf("{") !== -1) {
			for(k in params) {
				if(params.hasOwnProperty(k)) {
					uri = uri.replace("{" + k + "}", params[k])
				}
			}
		}

		var url = self.options.root + uri;

		var requestOptions = {
			method: method,
			uri: url,
			timeout: self.options.timeout * 1000,
			transform: jsonResponseParse
		};

		if(method === "GET") {
			requestOptions.qs = params;
		} else if(method === "POST") {
			requestOptions.form = params;
		}

		return requestPromise(requestOptions);
	}
}

module.exports = KiteConnect;
