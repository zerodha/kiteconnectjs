"use strict";

var axios = require("axios");
var csvParse = require("papaparse");
var sha256 = require("crypto-js/sha256");
var querystring = require("querystring");
var utils = require("./utils");

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
 *
 * var KiteConnect = require("kiteconnect").KiteConnect;
 *
 * var kc = new KiteConnect({api_key: "your_api_key"});
 *
 * kc.requestAccessToken("request_token", "api_secret")
 * 	.then(function(response) {
 * 		init();
 * 	})
 * 	.catch(function(err) {
 * 		console.log(err);
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
 * All API calls returns a promise which you can use to call methods like `.then(...)` and `.catch(...)`.
 *
 * ~~~~
 * kiteConnectApiCall
 * 	.then(function(v) {
 * 	    // On success
 * 	})
 * 	.catch(function(e) {
 * 		// On rejected
 * 	});
 * ~~~~
 *
 * @constructor
 * @name KiteConnect
 *
 * @param {Object} params Init params.
 * @param {string} params.api_key API key issued to you.
 * @param {string} [params.access_token=null] Token obtained after the login flow in
 *	exchange for the `request_token`. Pre-login, this will default to null,
 *	but once you have obtained it, you should persist it in a database or session to pass
 *	to the Kite Connect class initialisation for subsequent requests.
 * @param {string} [params.root="https://api.kite.trade"] API end point root. Unless you explicitly
 *	want to send API requests to a non-default endpoint, this can be ignored.
 * @param {string} [params.login_uri="https://kite.trade/connect/login"] Kite connect login url
 * @param {bool}   [params.debug=false] If set to true, will console log requests and responses.
 * @param {number} [params.timeout=7000] Time (milliseconds) for which the API client will wait
 *	for a request to complete before it fails.
 *
 * @example <caption>Initialize KiteConnect object</caption>
 * var kc = KiteConnect("my_api_key", {timeout: 10, debug: false})
 */
var KiteConnect = function(params) {
	var self = this
	var defaults = {
		"root": "https://api.kite.trade",
		"login": "https://kite.trade/connect/login",
		"debug": false,
		"timeout": 7000
	};

	self.api_key = params.api_key;
	self.root = params.root || defaults.root;
	self.timeout = params.timeout || defaults.timeout;
	self.debug = params.debug || defaults.debug;
	self.access_token = params.access_token || null;
	self.default_login_uri = defaults.default_login_uri;
	self.sessionExpiryHook = null;

  	var kiteVersion = 3; // Kite version to send in header
  	var userAgent = utils.getUserAgent();  // User agent to be sent with every request

	var routes = {
        "parameters": "/parameters",
        "api.validate": "/session/token",
        "api.invalidate": "/session/token",
        "user.margins": "/user/margins",
        "user.margins.segment": "/user/margins/{segment}",

        "orders": "/orders",
        "trades": "/trades",
        "order.info": "/orders/{order_id}",
        "order.place": "/orders/{variety}",
        "order.modify": "/orders/{variety}/{order_id}",
        "order.cancel": "/orders/{variety}/{order_id}",
        "order.trades": "/orders/{order_id}/trades",

        "portfolio.positions": "/portfolio/positions",
        "portfolio.holdings": "/portfolio/holdings",
        "portfolio.positions.convert": "/portfolio/positions",

        "mf.orders": "/mf/orders",
        "mf.order.info": "/mf/orders/{order_id}",
        "mf.order.place": "/mf/orders",
        "mf.order.cancel": "/mf/orders/{order_id}",

        "mf.sips": "/mf/sips",
        "mf.sip.info": "/mf/sips/{sip_id}",
        "mf.sip.place": "/mf/sips",
        "mf.sip.modify": "/mf/sips/{sip_id}",
        "mf.sip.cancel": "/mf/sips/{sip_id}",

        "mf.holdings": "/mf/holdings",
        "mf.instruments": "/mf/instruments",

        "market.instruments.all": "/instruments",
        "market.instruments": "/instruments/{exchange}",
        "market.margins": "/margins/{segment}",
        "market.historical": "/instruments/historical/{instrument_token}/{interval}",
        "market.trigger_range": "/instruments/{exchange}/{tradingsymbol}/trigger_range",

        "market.quote": "/instruments/{exchange}/{tradingsymbol}",
        "market.quote.ohlc": "/quote/ohlc",
        "market.quote.ltp": "/quote/ltp"
    };

	var requestInstance = axios.create({
		baseURL: self.root,
		timeout: self.timeout,
		headers: {
			"X-Kite-Version": kiteVersion,
			"User-Agent": userAgent
		},

	});

	// Set content type as form encoded for PUT and POST
	requestInstance.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	requestInstance.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded";

	// Add a response interceptor
	requestInstance.interceptors.response.use(function (response) {
		var contentType = response.headers["content-type"];
		if (contentType === "application/json" && typeof response.data === "object") {
			// Throw incase of error
			if (response.data.error_type) throw response.data;

			// Return success data
			return response.data.data;
		} else if (contentType === "text/csv") {
			// Return the response directly
			return response.data
		} else {
			return {
				"error_type": "DataException",
				"message": "Unknown content type (" +  contentType + ") with response: (" + response.data + ")"
			};
		}
	}, function (error) {
		let resp = {
			"message": "Unknown error",
			"error_type": "GeneralException",
			"data": null
		};

		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			if (error.response.data && error.response.data.error_type) {
				if (error.response.data.error_type === "TokenException" && self.sessionExpiryHook) {
					self.sessionExpiryHook()
				}

				resp = error.response.data;
			} else {
				resp.error_type = "NetworkException";
				resp.message = error.response.statusText;
			}
		} else if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			resp.error_type = "NetworkException";
			resp.message = "No response from server with error code: " + error.code;
		} else if (error.message) {
			// Errors raised inside success block in request
			resp.message = error.message;
		} else {
			// Something happened in setting up the request that triggered an Error
			resp.error_type = "NetworkException";
			resp.message = "Error while setting up the request";
		}

		return Promise.reject(resp);
	});

	/**
	* Set `access_token` received after a successful authentication.
	* @method setAccessToken
	* @memberOf KiteConnect
	* @instance
	* @param {string} access_token Token obtained in exchange for `request_token`.
	*	Once you have obtained `access_token`, you should persist it in a database or session to pass
	*	to the Kite Connect class initialisation for subsequent requests.
	*/
	self.setAccessToken = function(access_token) {
		self.access_token = access_token;
	};

	/**
	 * Set a callback hook for session (`TokenException` -- timeout, expiry etc.) errors.
	 * `access_token` (login session) can become invalid for a number of
	 * reasons, but it doesn't make sense for the client to try and catch it during every API call.
	 *
	 * A callback method that handles session errors can be set here and when the client encounters
	 * a token error at any point, it'll be called.
	 *
	 * This callback, for instance, can log the user out of the UI,
	 * clear session cookies, or initiate a fresh login.
	 * @method setSessionExpiryHook
	 * @memberOf KiteConnect
	 * @instance
	 * @param {function} cb Callback
	 */
	self.setSessionExpiryHook = function(cb) {
		self.sessionExpiryHook = cb;
	};

	/**
	 * Get the remote login url to which a user should be redirected to initiate the login flow.
	 * @method getLoginURL
	 * @memberOf KiteConnect
	 * @instance
	 */
	self.getLoginURL = function() {
		return self.default_login_uri + "?api_key=" + self.api_key;
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
	 * @param {string} api_secret API secret issued with the API key.
	 */
	self.requestAccessToken = function(request_token, api_secret) {
		var checksum = sha256(self.api_key + request_token + api_secret).toString();

		var p = _post("api.validate", {
			"request_token": request_token,
			"checksum": checksum
		});

		p.then(function(response) {
			self.setAccessToken(response.access_token);
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
	 * @method getMargins
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} [segment] trading segment (eg: equity or commodity).
	 */
	self.getMargins = function(segment) {
		if (segment) {
			return _get("user.margins.segment", {"segment": segment});
		} else {
			return _get("user.margins");
		}
	};

	/**
	 * Place an order.
	 * @method placeOrder
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} params Order params.
	 * @param {string} params.exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
	 * @param {string} params.tradingsymbol Tradingsymbol of the instrument (ex. RELIANCE, INFY).
	 * @param {string} params.transaction_type Transaction type (BUY or SELL).
	 * @param {number} params.quantity Order quantity
	 * @param {string} params.variety Order variety (ex. bo, co, amo, regular).
	 * @param {string} [params.product]	Product code (NRML, MIS, CNC).
	 * @param {string} [params.order_type] Order type (NRML, SL, SL-M, MARKET).
	 * @param {string} [params.validity] Order validity (DAY, IOC).
	 * @param {number} [params.price] Order Price
	 * @param {number} [params.disclosed_quantity] Disclosed quantity
	 * @param {number} [params.trigger_price] Trigger price
	 * @param {number} [params.squareoff] Square off value (only for bracket orders)
	 * @param {number} [params.stoploss] Stoploss value (only for bracket orders)
	 * @param {number} [params.trailing_stoploss] Trailing stoploss value (only for bracket orders)
	 */
	self.placeOrder = function(params) {
		return _post("orders.place", params);
	};

	/**
	 * Modify an order
	 * @method modifyOrder
	 * @memberOf KiteConnect
	 * @instance
	 * @param {Object} params Order modify params.
	 * @param {string} params.order_id ID of the order.
	 * @param {string} params.variety Order variety (ex. bo, co, amo, regular).
	 * @param {number} [params.quantity] Order quantity
	 * @param {number} [params.price] Order Price
	 * @param {string} [params.order_type] Order type (NRML, SL, SL-M, MARKET).
	 * @param {string} [params.validity] Order validity (DAY, IOC).
	 * @param {number} [params.disclosed_quantity] Disclosed quantity
	 * @param {number} [params.trigger_price] Trigger price
	 * @param {string} [params.parent_order_id] Parent order id incase of multilegged orders.
	 */
	self.modifyOrder = function(params) {
		return _put("orders.modify", params);
	};

	/**
	 * Cancel an order
	 * @method cancelOrder
	 * @memberOf KiteConnect
	 * @instance
	 * @param {Object} params Order params.
	 * @param {string} params.order_id ID of the order.
	 * @param {string} params.variety Order variety (ex. bo, co, amo, regular).
	 * @param {string} [params.parent_order_id] Parent order id incase of multilegged orders.
	 */
	self.cancelOrder = function(params) {
		return _delete("orders.cancel", params);
	};

	/**
	 * Exit an order
	 * @method exitOrder
	 * @memberOf KiteConnect
	 * @instance
	 * @param {Object} params Order params.
	 * @param {string} params.order_id ID of the order.
	 * @param {string} params.variety Order variety (ex. bo, co, amo, regular).
	 * @param {string} [params.parent_order_id] Parent order id incase of multilegged orders.
	 */
	self.exitOrder = function (params) {
		self.cancelOrder(params)
	};

	/**
	 * Get list of orders.
	 * @method getOrders
	 * @memberOf KiteConnect
	 * @instance
	 */
	self.getOrders = function(order_id) {
		return _get("orders");
	};

	/**
	 * Get list of order history.
	 * @method getOrderHistory
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} order_id ID of the order whose order details to be retrieved.
	 */
	self.getOrderHistory = function(order_id) {
			return  _get("orders.info", {"order_id": order_id});
	};

	/**
	 * Retrieve the list of trades executed.
	 * @method getTrades
	 * @memberOf KiteConnect
	 * @instance
	 */
	self.getTrades = function(order_id) {
		return _get("trades");
	};

	/**
	 * Retrieve the list of trades a particular order).
	 * An order can be executed in tranches based on market conditions.
	 * These trades are individually recorded under an order.
	 * @method getOrderTrades
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} order_id ID of the order whose trades are to be retrieved.
	 */
	self.getOrderTrades = function(order_id) {
			return  _get("orders.trades", {"order_id": order_id});
	};

	/**
	 * Retrieve the list of equity holdings.
	 * @method holdings
	 * @memberOf KiteConnect
	 * @instance
	 */
	self.getHoldings = function() {
		return _get("portfolio.holdings");
	};

	/**
	 * Retrieve positions.
	 * @method positions
	 * @memberOf KiteConnect
	 * @instance
	 */
	self.getPositions = function() {
		return _get("portfolio.positions");
	};

	/**
	 * Modify an open position's product type.
	 * @method convertPosition
	 * @memberOf KiteConnect
	 * @instance
	 * @param {Object} params params.
	 * @param {string} params.exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
	 * @param {string} params.tradingsymbol Tradingsymbol of the instrument  (ex. RELIANCE, INFY).
	 * @param {string} params.transaction_type Transaction type (BUY or SELL).
	 * @param {string} params.position_type Position type (overnight, day).
	 * @param {string} params.quantity Position quantity
	 * @param {string} params.old_product Current product code (NRML, MIS, CNC).
	 * @param {string} params.new_product New Product code (NRML, MIS, CNC).
	 */
	self.convertPosition = function(params) {
		return _put("portfolio.positions.convert", params);
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
	self.getInstruments = function(exchange) {
		if(exchange) {
			return _get("market.instruments", {
				"exchange": exchange
			}, null, transformInstrumentsResponse);
		} else {
			return _get("market.instruments.all", null, null, transformInstrumentsResponse);
		}
	};

	/**
	 * Retrieve quote and market depth for list of instruments.
	 * @method getQuote
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} instruments is a list of instruments, Instrument are in the format of `tradingsymbol:exchange`.
	 * 	For example NSE:INFY
	 */
	self.getQuote = function(instruments) {
		return _get("market.quote", {"i": instruments});
	};

	/**
	 * Retrieve OHLC for list of instruments.
	 * @method getOHLC
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} instruments is a list of instruments, Instrument are in the format of `tradingsymbol:exchange`.
	 * 	For example NSE:INFY
	 */
	self.getOHLC = function(instruments) {
		return _get("market.quote.ohlc", {"i": instruments});
	};

	/**
	 * Retrieve LTP for list of instruments.
	 * @method getLTP
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} instruments is a list of instruments, Instrument are in the format of `tradingsymbol:exchange`.
	 * 	For example NSE:INFY
	 */
	self.getLTP = function(instruments) {
		return _get("market.quote.ltp", {"i": instruments});
	};

	/**
	 * Retrive margins provided for individual segments.
	 * @method getInstrumentsMargins
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} segment is segment name to retrieve. For example equity, commodity
	 */
	self.getInstrumentsMargins = function(segment) {
        return self._get("market.margins", {"segment": segment});
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
	 * @param {Object} params Params
	 * @param {string} params.instrument_token Instrument identifier (retrieved from the instruments()) call.
	 * @param {string} params.from From date (yyyy-mm-dd HH:MM:SS).
	 * @param {string} params.to To date (yyyy-mm-dd HH:MM:SS).
	 * @param {string} params.interval candle interval (minute, day, 5 minute etc.)
	 */
	self.historical = function(params) {
		return _get("market.historical", params, null, parseHistorical);
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
	 * Get list of mutual fund orders.
	 * @method getMFOrders
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} [order_id] ID of the order (optional) whose order details are to be retrieved.
	 * If no `order_id` is specified, all orders for the day are returned.
	 */
	self.getMFOrders = function (order_id) {
		if (order_id) {
			return _get("mf.order.info", { "order_id": order_id });
		} else {
			return _get("mf.orders");
		}
	};


	/**
	 * Place a mutual fund order.
	 * @method placeMFOrder
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} params Order params.
	 * @param {string} params.tradingsymbol Tradingsymbol (ISIN) of the fund.
	 * @param {string} params.transaction_type Transaction type (BUY or SELL).
	 * @param {string} [params.quantity] Quantity to SELL. Not applicable on BUYs.
	 * @param {string} [params.amount] Amount worth of units to purchase. Not applicable on SELLs
	 * @param {string} [params.tag] An optional tag to apply to an order to identify it (alphanumeric, max 8 chars)
	 */
	self.placeMFOrder = function (params) {
		return _post("mf.order.place", params);
	}

	/**
	 * Cancel a mutual fund order.
	 * @method cancelMFOrder
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} order_id ID of the order.
	 */
	self.cancelMFOrder = function (order_id) {
		return _delete("mf.order.cancel", params)
	}

	/**
	 * Get list of mutual fund SIPS.
	 * @method getMFSIPS
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} sip_id ID of the SIP.
	 */
	self.getMFSIPS = function (sip_id) {
		if (sip_id) {
			return _get("mf.sip.info", {"sip_id": sip_id});
		} else {
			return _get("mf.sips");
		}
	}

	/**
	 * Place a mutual fund SIP.
	 * @method placeMFSIP
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} params Order params.
	 * @param {string} params.tradingsymbol Tradingsymbol (ISIN) of the fund.
	 * @param {string} params.amount Amount worth of units to purchase.
	 * @param {string} params.instalments Number of instalments to trigger. If set to -1, instalments are triggered at fixed intervals until the SIP is cancelled
	 * @param {string} params.frequency Order frequency. weekly, monthly, or quarterly.
	 * @param {string} [params.initial_amount] Amount worth of units to purchase before the SIP starts.
	 * @param {string} [params.instalment_day] If frequency is monthly, the day of the month (1, 5, 10, 15, 20, 25) to trigger the order on.
	 * @param {string} [params.tag] An optional tag to apply to an order to identify it (alphanumeric, max 8 chars).
	 */
	self.placeMFSIP = function (params) {
		return _post("mf.sip.place", params);
	}

	/**
	 * Modify a mutual fund SIP.
	 * @method modifyMFSIP
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} params Order params.
	 * @param {string} params.sip_id ID of the SIP.
	 * @param {string} [params.instalments] Number of instalments to trigger. If set to -1, instalments are triggered at fixed intervals until the SIP is cancelled
	 * @param {string} [params.frequency] Order frequency. weekly, monthly, or quarterly.
	 * @param {string} [params.instalment_day] If frequency is monthly, the day of the month (1, 5, 10, 15, 20, 25) to trigger the order on.
	 * @param {string} [params.status] Pause or unpause an SIP (active or paused).
	 */
	self.modifyMFSIP = function (params) {
		return _put("mf.sip.modify", params);
	}

	/**
	 * Cancel a mutual fund SIP.
	 * @method cancelMFSIP
	 * @memberOf KiteConnect
	 * @instance
	 * @param {string} sip_id ID of the SIP.
	 */
	self.cancelMFSIP = function (sip_id) {
		return _delete("mf.sip.cancel", {"sip_id": sip_id});
	}

	/**
	 * Get list of mutual fund holdings.
	 * @method getMFHoldings
	 * @memberOf KiteConnect
	 * @instance
	 */
	self.getMFHoldings = function () {
		return _get("mf.holdings");
	}

	/**
	 * Get list of mutual fund instruments.
	 * @method getMFInstruments
	 * @memberOf KiteConnect
	 * @instance
	 */
	self.getMFInstruments = function () {
		return _get("mf.instruments", null, null, transformInstrumentsResponse);
	}

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
			checksum = sha256(inputString).toString();
		} catch (e) {
			throw(e)
		}

		if (postback_data.checksum === checksum) {
			return true;
		} else {
			return false;
		}
	}

	function parseHistorical(jsonData, headers) {
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

		return {
			"data": results
		};
	}

	function parseCsv(csvString) {
		return csvParse.parse(csvString, {"header": true}).data;
	}

	function transformInstrumentsResponse(data, headers) {
		// Parse CSV responses
		if (headers["content-type"] === "text/csv") {
			return parseCsv(data)
		}

		return data;
	}

	function _get(route, params, responseType, responseTransformer) {
		return request(route, "GET", params || {}, responseType, responseTransformer);
	}

	function _post(route, params) {
		return request(route, "POST", params || {});
	}

	function _put(route, params) {
		return request(route, "PUT", params || {});
	}

	function _delete(route, params) {
		return request(route, "DELETE", params || {});
	}

	function request(route, method, params, responseType, responseTransformer) {
		// Check access token
		if (!responseType) responseType = "json";
		var authHeader = self.api_key + ":" + self.access_token;
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

		let payload = null;
		let queryParams = null;
		if (method === "GET" || method === "DELETE") {
			queryParams = params;
		} else {
			payload = params;
		}

		var options = {
			method: method,
			url: uri,
			params: queryParams,
			data: querystring.stringify(payload),
			// Set auth header
			headers: {
				Authorization: "token " + authHeader
			}
		};

		// Set response transformer
		if (responseTransformer) {
			options.transformResponse = axios.defaults.transformResponse.concat(responseTransformer);
		}

		return requestInstance.request(options);
	}
}

module.exports = KiteConnect;
