"use strict";

var _ = require("lodash");
var crypto = require("crypto");
var csvParse = require("babyparse");
var requestPromise = require("request-promise");


var KiteConnect = function(api_key, options) {
	var self = this,
		defaults = {
			"api_key": api_key,
			"root": "https://api.kite.trade",
			"login": "https://kite.trade/connect/login",
			"debug": false,
			"timeout": 7,
			"access_token": null
		};

	self.options = _.extend(defaults, options);

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
	self.setAccessToken = function(access_token) {
		self.options.access_token = access_token;
	};

	self.setSessionHook = function(callback) {
		self.sessionHook = callback;
	};

	self.loginUrl = function() {
		// Return kiteconnect login url
		return self.options.login + "?api_key=" + self.options.api_key;
	};

	self.requestAccessToken = function(request_token, secret) {
		var checksum = crypto.createHash("sha256")
						.update(self.options.api_key + request_token + secret)
						.digest("hex");

		var p = _post("api.validate", {
			"request_token": request_token,
			"checksum": checksum
		});

		p.then(function(response) {
			self.setAccessToken(response.data.access_token);
		}).catch(function(err) {})

		return p;
	};

	self.invalidateToken = function(access_token) {
		var params = {};
		if(access_token) {
			params.access_token = access_token;
		}

		return _delete("api.invalidate", params);
	};

	self.margins = function(segment) {
		return _get("user.margins", {"segment": segment});
	};

	self.orderPlace = function(params, variety) {
		if(!params) {
			params = {};
		}
		params.variety = variety === undefined ? "regular" : variety;

		return _post("orders.place", params);
	};

	self.orderModify = function(order_id, params, variety, parent_order_id) {
		if(!params) {
			params = {};
		}

		params.order_id = order_id === undefined ? null : order_id;
		params.parent_order_id = parent_order_id;
		params.variety = variety === undefined ? "regular" : variety;

		return _put("orders.modify", params);
	};

	self.orderCancel = function(order_id, variety, parent_order_id) {
		return _delete("orders.cancel", {
			"order_id": order_id === undefined ? null : order_id,
			"variety": variety === "regular" ? null : variety,
			"parent_order_id": parent_order_id === undefined ? null : parent_order_id
		});
	};

	self.orders = function(order_id) {
		if(order_id) {
			return  _get("orders.info", {"order_id": order_id});
		} else {
			return _get("orders");
		}
	};

	self.trades = function(order_id) {
		if(order_id) {
			return  _get("orders.trades", {"order_id": order_id});
		} else {
			return _get("trades");
		}
	};

	self.holdings = function() {
		return _get("portfolio.holdings");
	};

	self.positions = function() {
		return _get("portfolio.positions");
	};

	self.productModify = function(params) {
		if(!params) {
			params = {};
		}

		var defaults = {
			"exchange": null,
			"tradingsymbol": null,
			"transaction_type": null,
			"position_type": null,
			"quantity": null,
			"old_product": null,
			"new_product": null
		};

		params = _.extend(defaults, params);
		return _put("portfolio.positions.modify", params);
	};

	self.instruments = function(exchange) {
		if(exchange) {
			return _get("market.instruments", {
				"exchange": exchange
			});
		} else {
			return _get("market.instruments.all", {});
		}
	};

	self.quote = function(exchange, tradingsymbol) {
		return _get("market.quote", {"exchange": exchange, "tradingsymbol": tradingsymbol});
	};

	self.historical = function(instrument_token, from_date, to_date, interval) {
		return _get("market.historical",
			{
				"instrument_token": instrument_token,
				"from": from_date,
				"to": to_date,
				"interval": interval
			},
			parseHistorical
		);
	};

	self.triggerRange = function(exchange, tradingsymbol, transaction_type) {
		return _get("market.trigger_range",
			{
				"exchange": exchange,
				"tradingsymbol": tradingsymbol,
				"transaction_type": transaction_type
			}
		);
	};

	function parseHistorical(jsonData) {
		var results = [];
		for(var i=0; i<jsonData.data.candles.length - 1; i++) {
			var d = jsonData.data.candles[i];
			results.push({
				"date": d[0],
				"open": d[1],
				"high": d[2],
				"low": d[3],
				"close": d[4],
				"volume": d[5]
			});
		}

		return results;
	}

	function parseCsv(csvString) {
		return csvParse.parse(csvString, {"header": true}).data;
	}

	function _get(route, params, responseTransform) {
		if(params === undefined) {
			params = {};
		}

		return request(route, "GET", params, responseTransform);
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

	function responseParse(body, response, resolveWithFullResponse, responseTransform) {
		if(response.statusCode === 403 && self.sessionHook) {
			// Call session hook if registered
			self.sessionHook();
		}

		if(response.headers["content-type"] === "application/json") {
			var jsonResp;
			try {
				jsonResp = JSON.parse(body);
			}
			catch(err) {
				throw "Couldn't parse the JSON response.";
			}

			if(responseTransform) {
				return responseTransform(jsonResp);
			} else {
				return jsonResp;
			}
		} else if(response.headers["content-type"] === "text/csv") {
			return parseCsv(body);
		} else {
			throw "Unknown Content-Type " + response.headers["content-type"] + " in response: " + body;
		}
	}

	function request(route, method, params, responseTransform) {
		if(params === undefined) {
			params = {};
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
			var k;
			for(k in params) {
				if(params.hasOwnProperty(k)) {
					uri = uri.replace("{" + k + "}", params[k]);
				}
			}
		}

		var url = self.options.root + uri;

		var requestOptions = {
			method: method,
			uri: url,
			timeout: self.options.timeout * 1000,
			transform: function(body, response, resolveWithFullResponse){
				return responseParse(body, response, resolveWithFullResponse, responseTransform);
			}
		};

		if(method === "GET" || method === "DELETE") {
			requestOptions.qs = params;
		} else if(method === "POST" || method === "PUT") {
			requestOptions.form = params;
		}

		return requestPromise(requestOptions);
	}
}

module.exports = KiteConnect;
