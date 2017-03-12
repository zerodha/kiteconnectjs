"use strict";

var _ = require("lodash");
var crypto = require("crypto");
var csvParse = require("babyparse");
var requestPromise = require("request-promise");

/**
 * @classdesc API client class. In production, you may initialise a single instance of this class per `api_key`.
 * This module provides an easy to use abstraction over the HTTP APIs.
 * The HTTP calls have been converted to methods and their JSON responses.
 * See the **[Kite Connect API documentation](https://kite.trade/docs/connect/v1/)**
 * for the complete list of APIs, supported parameters and values, and response formats.
 *
 * Getting started with API
 * ------------------------
 * ~~~~
 * var KiteConnect = require("kiteconnect").KiteConnect;
 *
 * var kc = new KiteConnect("your_api_key");
 *
 * kc.requestAccessToken("request_token", "api_secret")
 * 	.then(function(response) {
 * 		init();
 * 	})
 * 	.catch(function(err) {
 * 		console.log(err.response);
 * 	})
 *
 * function init() {
 * 	// Fetch equity margins.
 * 	// You can have other api calls here.
 *
 * 	kc.margins("equity")
 * 		.then(function(response) {
 * 			// You got user's margin details.
 * 		}).catch(function(err) {
 * 			// Something went wrong.
 * 		});
 *  }
 * ~~~~
 *
 * API promises
 * -------------
 * All API calls returns a promise which you can use to call methods like `.then(...)`, `.catch(...)`, and `.finally(...)`.
 *
 * ~~~~
 * kiteConnectApiCall
 * 	.then(function(v) {
 * 	    // On success
 * 	})
 * 	.catch(function(e) {
 * 		// On rejected
 * 	})
 * 	.finally(function(e) {
 * 		// On finish
 * 	});
 * ~~~~
 * You can access the full list of [Bluebird Promises API](https://github.com/petkaantonov/bluebird/blob/master/API.md) here.
 * @constructor
 * @name KiteConnect
 *
 * @param {string} api_key API key issued you.
 * @param {object} [options] parameters to override.
 * @param {string} options.access_token=null Token obtained after the login flow in
 *	exchange for the `request_token`. Pre-login, this will default to null,
 *	but once you have obtained it, you should persist it in a database or session to pass
 *	to the Kite Connect class initialisation for subsequent requests.
 * @param {string} options.root="https://api.kite.trade" API end point root. Unless you explicitly
 *	want to send API requests to a non-default endpoint, this can be ignored.
 * @param {string} options.login="https://kite.trade/connect/login" Kite connect login url
 * @param {bool} options.debug=false If set to true, will console log requests and responses.
 * @param {number} options.timeout=7 Time (seconds) for which the API client will wait
 *	for a request to complete before it fails.
 *
 * @example <caption>Initialize KiteConnect object</caption>
 * var kc = KiteConnect("my_api_key", {timeout: 10, debug: false})
 */
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

	/**
	* Set the `access_token` received after a successful authentication.
	* @method setAccessToken
	* @memberOf KiteConnect
	* @instance
	* @param {string} access_token Token obtained after the login flow in
	*	exchange for the `request_token`. Pre-login, this will default to null,
	*	but once you have obtained it, you should persist it in a database or session to pass
	*	to the Kite Connect class initialisation for subsequent requests.
	*/
	self.setAccessToken = function(access_token) {
		self.options.access_token = access_token;
	};

	/**
	 * Set a callback hook for session (`TokenError` -- timeout, expiry etc.) errors.
	 * An `access_token` (login session) can become invalid for a number of
	 * reasons, but it doesn't make sense for the client to
	 * try and catch it during every API call.
	 *
	 * A callback method that handles session errors
	 * can be set here and when the client encounters
	 * a token error at any point, it'll be called.
	 *
	 * This callback, for instance, can log the user out of the UI,
	 * clear session cookies, or initiate a fresh login.
	 * @method setSessionHook
	 * @memberOf KiteConnect
	 * @instance
	 * @param {function} cb Callback
	 */
	self.setSessionHook = function(cb) {
		self.sessionHook = cb;
	};

	/**
	 * Get the remote login url to which a user should be redirected to initiate the login flow.
	 * @method loginUrl
	 * @memberOf KiteConnect
	 * @instance
	 */
	self.loginUrl = function() {
		return self.options.login + "?api_key=" + self.options.api_key;
	};

	/**
	 * Do the token exchange with the `request_token` obtained after the login flow,
	 * and retrieve the `access_token` required for all subsequent requests. The
	 * response contains not just the `access_token`, but metadata for
	 * the user who has authenticated.
	 * @method requestAccessToken
	 * @memberOf KiteConnect
	 * @instance
	 *
	 * @param {string} request_token Token obtained from the GET paramers after a successful login redirect.
	 * @param {string} secret API secret issued with the API key.
	 */
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

	/**
	 * Kill the session by invalidating the access token.
	 * @method invalidateToken
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} [access_token] Token to invalidate. Default is the active `access_token`.
	 */
	self.invalidateToken = function(access_token) {
		var params = {};
		if(access_token) {
			params.access_token = access_token;
		}

		return _delete("api.invalidate", params);
	};

	/**
	 * Get account balance and cash margin details for a particular segment.
	 * @method margins
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} segment trading segment (eg: equity or commodity).
	 */
	self.margins = function(segment) {
		return _get("user.margins", {"segment": segment});
	};

	/**
	 * Place an order.
	 * @method orderPlace
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} params Order params.
	 * @param {string} params.exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
	 * @param {string} params.tradingsymbol Tradingsymbol of the instrument  (ex. RELIANCE, INFY).
	 * @param {string} params.transaction_type Transaction type (BUY or SELL).
	 * @param {string} params.quantity Order quantity
	 * @param {string} [params.price] Order Price
	 * @param {string} [params.product]	Product code (NRML, MIS, CNC).
	 * @param {string} [params.order_type] Order type (NRML, SL, SL-M, MARKET).
	 * @param {string} [params.validity] Order validity (DAY, IOC).
	 * @param {string} [params.disclosed_quantity] Disclosed quantity
	 * @param {string} [params.trigger_price] Trigger price
	 * @param {string} [params.squareoff_value] Square off value (only for bracket orders)
	 * @param {string} [params.stoploss_value] Stoploss value (only for bracket orders)
	 * @param {string} [params.trailing_stoploss] Trailing stoploss value (only for bracket orders)
	 * @param {string} [variety="regular"] Order variety (ex. bo, co, amo, regular).
	 */
	self.orderPlace = function(params, variety) {
		if(!params) {
			params = {};
		}
		params.variety = variety === undefined ? "regular" : variety;

		return _post("orders.place", params);
	};

	/**
	 * Modify an order
	 * @method orderModify
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} order_id ID of the order.
	 * @param {string} params Order params.
	 * @param {string} params.exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
	 * @param {string} params.tradingsymbol Tradingsymbol of the instrument  (ex. RELIANCE, INFY).
	 * @param {string} params.transaction_type Transaction type (BUY or SELL).
	 * @param {string} params.quantity Order quantity
	 * @param {string} [params.price] Order Price
	 * @param {string} [params.order_type] Order type (NRML, SL, SL-M, MARKET).
	 * @param {string} [params.validity] Order validity (DAY, IOC).
	 * @param {string} [params.disclosed_quantity] Disclosed quantity
	 * @param {string} [params.trigger_price] Trigger price
	 * @param {string} [variety="regular"] Order variety (ex. bo, co, amo, regular).
	 * @param {string} [parent_order_id] Parent order id incase of multilegged orders.
	 */
	self.orderModify = function(order_id, params, variety, parent_order_id) {
		if(!params) {
			params = {};
		}

		params.order_id = order_id === undefined ? null : order_id;
		params.parent_order_id = parent_order_id;
		params.variety = variety === undefined ? "regular" : variety;

		return _put("orders.modify", params);
	};

	/**
	 * Cancel/Exit an order
	 * @method orderCancel
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} order_id ID of the order.
	 * @param {string} [variety="regular"] Order variety (ex. bo, co, amo, regular).
	 * @param {string} [parent_order_id] Parent order id incase of multilegged orders.
	 */
	self.orderCancel = function(order_id, variety, parent_order_id) {
		return _delete("orders.cancel", {
			"order_id": order_id === undefined ? null : order_id,
			"variety": variety === undefined ? "regular" : variety,
			"parent_order_id": parent_order_id === undefined ? null : parent_order_id
		});
	};

	/**
	 * Get the collection of orders from the orderbook.
	 * @method orders
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} [order_id] ID of the order (optional) whose order details are to be retrieved.
	 * If no `order_id` is specified, all orders for the day are returned.
	 */
	self.orders = function(order_id) {
		if(order_id) {
			return  _get("orders.info", {"order_id": order_id});
		} else {
			return _get("orders");
		}
	};

	/**
	 * Retreive the list of trades executed (all or ones under a particular order).
	 * An order can be executed in tranches based on market conditions.
	 * These trades are individually recorded under an order.
	 * @method trades
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} [order_id] ID of the order (optional) whose trades are to be retrieved.
	 * If no `order_id` is specified, all trades for the day are returned.
	 */
	self.trades = function(order_id) {
		if(order_id) {
			return  _get("orders.trades", {"order_id": order_id});
		} else {
			return _get("trades");
		}
	};

	/**
	 * Retrieve the list of equity holdings.
	 * @method holdings
	 * @memberOf KiteConnect
	 * @instance
	 */
	self.holdings = function() {
		return _get("portfolio.holdings");
	};

	/**
	 * Retrieve the list of positions.
	 * @method positions
	 * @memberOf KiteConnect
	 * @instance
	 */
	self.positions = function() {
		return _get("portfolio.positions");
	};

	/**
	 * Modify an open position's product type.
	 * @method productModify
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} params params.
	 * @param {string} params.exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
	 * @param {string} params.tradingsymbol Tradingsymbol of the instrument  (ex. RELIANCE, INFY).
	 * @param {string} params.transaction_type Transaction type (BUY or SELL).
	 * @param {string} params.position_type Position type (overnight, day).
	 * @param {string} params.quantity Position quantity
	 * @param {string} params.old_product Current product code (NRML, MIS, CNC).
	 * @param {string} params.new_product New Product code (NRML, MIS, CNC).
	 */
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

	/**
	 * Retrieve the list of market instruments available to trade.
	 * Note that the results could be large, several hundred KBs in size,
	 * with tens of thousands of entries in the list.
	 * Response is array for objects. For example
	 * ~~~~
	 * 	{
	 * 		instrument_token: '131098372',
	 *		exchange_token: '512103',
	 *		tradingsymbol: 'NIDHGRN',
	 *		name: 'NIDHI GRANITES',
	 *		last_price: '0.0',
	 *		expiry: '',
	 *		strike: '0.0',
	 *		tick_size: '0.05',
	 *		lot_size: '1',
	 *		instrument_type: 'EQ',
	 *		segment: 'BSE',
	 *		exchange: 'BSE' }, ...]
	 * ~~~~
	 *
	 * @method instruments
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} [segment] Filter instruments based on exchange (NSE, BSE, NFO, BFO, CDS, MCX).
	 * If no `segment` is specified, all instruemnts are returned.
	 */
	self.instruments = function(exchange) {
		if(exchange) {
			return _get("market.instruments", {
				"exchange": exchange
			});
		} else {
			return _get("market.instruments.all", {});
		}
	};

	/**
	 * Retrieve quote and market depth for an instrument.
	 * @method quote
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
	 * @param {string} tradingsymbol Tradingsymbol of the instrument  (ex. RELIANCE, INFY).
	 */
	self.quote = function(exchange, tradingsymbol) {
		return _get("market.quote", {"exchange": exchange, "tradingsymbol": tradingsymbol});
	};

	/**
	 * Retrieve historical data (candles) for an instrument.
	 * Although the actual response JSON from the API does not have field
	 * names such has 'open', 'high' etc., this functin call structures
	 * the data into an array of objects with field names. For example:
	 *
	 * ~~~~
	 * [{
	 * 	date: '2015-02-10T00:00:00+0530',
	 * 	open: 277.5,
	 * 	high: 290.8,
	 * 	low: 275.7,
	 * 	close: 287.3,
	 * 	volume: 22589681
	 * }, ....]
	 * ~~~~
	 *
	 * @method historical
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} instrument_token Instrument identifier (retrieved from the instruments()) call.
	 * @param {string} from_date From date (yyyy-mm-dd).
	 * @param {string} to_date To date (yyyy-mm-dd).
	 * @param {string} interval candle interval (minute, day, 5 minute etc.)
	 */
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

	/**
	 * Retrieve the buy/sell trigger range for Cover Orders.
	 * @method triggerRange
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
	 * @param {string} tradingsymbol Tranding symbol of the instrument (ex. RELIANCE, INFY).
	 * @param {string} transaction_type Transaction type (BUY or SELL).
	 */
	self.triggerRange = function(exchange, tradingsymbol, transaction_type) {
		return _get("market.trigger_range",
			{
				"exchange": exchange,
				"tradingsymbol": tradingsymbol,
				"transaction_type": transaction_type
			}
		);
	};

	/**
	 * Validate postback data checksum
	 * @method validatePostback
	 * @memberOf KiteConnect
	 * @instance
	 * @param {object} postback_data Postback data received. Must be an json object with required keys order_id, checksum and order_timestamp
	 * @param {string} api_secret Api secret of the app
	 * @returns {bool} Return true if checksum matches else false
	 * @throws Throws an error if the @postback_data or @api_secret is invalid
	 */
	self.validatePostback = function(postback_data, api_secret) {
		if (!postback_data || !postback_data.checksum || !postback_data.order_id ||
			!postback_data.order_timestamp || !api_secret) {
			throw new Error("Invalid postback data or api_secret");
		}

		var inputString = postback_data.order_id + postback_data.order_timestamp + api_secret;
		var checksum;
		try {
			checksum = crypto.createHash("sha256").update(inputString).digest("hex");
		} catch (e) {
			throw(e)
		}

		if (postback_data.checksum === checksum) {
			return true;
		} else {
			return false;
		}
	}

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

			// parse successful response and return error
			if(responseTransform && responseTransform.statusCode === 200) {
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

var KiteTicker = require("./ticker")
module.exports.KiteConnect = KiteConnect;
module.exports.KiteTicker = KiteTicker;
