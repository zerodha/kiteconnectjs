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
 * kc.generateSession("request_token", "api_secret")
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
 * 	kc.getMargins()
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
    self.default_login_uri = defaults.login;
    self.session_expiry_hook = null;

      var kiteVersion = 3; // Kite version to send in header
      var userAgent = utils.getUserAgent();  // User agent to be sent with every request

    var routes = {
        "api.token": "/session/token",
        "api.token.invalidate": "/session/token",
        "api.token.renew": "/session/refresh_token",
        "user.profile": "/user/profile",
        "user.margins": "/user/margins",
        "user.margins.segment": "/user/margins/{segment}",

        "orders": "/orders",
        "trades": "/trades",
        "order.info": "/orders/{order_id}",
        "order.place": "/orders/{variety}",
        "order.modify": "/orders/{variety}/{order_id}",
        "order.cancel": "/orders/{variety}/{order_id}",
        "order.trades": "/orders/{order_id}/trades",
        "order.margins": "/margins/orders",

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
        "market.trigger_range": "/instruments/trigger_range/{transaction_type}",

        "market.quote": "/quote",
        "market.quote.ohlc": "/quote/ohlc",
        "market.quote.ltp": "/quote/ltp",

        "gtt.triggers": "/gtt/triggers",
        "gtt.trigger_info": "/gtt/triggers/{trigger_id}",
        "gtt.place": "/gtt/triggers",
        "gtt.modify": "/gtt/triggers/{trigger_id}",
        "gtt.delete": "/gtt/triggers/{trigger_id}"
    };

    var requestInstance = axios.create({
        baseURL: self.root,
        timeout: self.timeout,
        headers: {
            "X-Kite-Version": kiteVersion,
            "User-Agent": userAgent
        },
    });

    // Add a request interceptor
    requestInstance.interceptors.request.use(function(request) {
        if (self.debug) console.log(request);
        return request;
    });

    // Add a response interceptor
    requestInstance.interceptors.response.use(function(response) {
        if (self.debug) console.log(response);

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
                if (error.response.data.error_type === "TokenException" && self.session_expiry_hook) {
                    self.session_expiry_hook()
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
            resp = error
        }

        return Promise.reject(resp);
    });

    // Constants
    // Products
    /**
    * @memberOf KiteTicker
    */
    self.PRODUCT_MIS = "MIS";
    /**
    * @memberOf KiteTicker
    */
    self.PRODUCT_CNC = "CNC";
    /**
    * @memberOf KiteTicker
    */
    self.PRODUCT_NRML = "NRML";
    /**
    * @memberOf KiteTicker
    */
    self.PRODUCT_CO = "CO";
    /**
    * @memberOf KiteTicker
    */
    self.PRODUCT_BO = "BO";

    // Order types
    /**
    * @memberOf KiteTicker
    */
    self.ORDER_TYPE_MARKET = "MARKET";
    /**
    * @memberOf KiteTicker
    */
    self.ORDER_TYPE_LIMIT = "LIMIT";
    /**
    * @memberOf KiteTicker
    */
    self.ORDER_TYPE_SLM = "SL-M";
    /**
    * @memberOf KiteTicker
    */
    self.ORDER_TYPE_SL = "SL";

    // Varities
    /**
    * @memberOf KiteTicker
    */
    self.VARIETY_REGULAR = "regular";
    /**
    * @memberOf KiteTicker
    */
    self.VARIETY_BO = "bo";
    /**
    * @memberOf KiteTicker
    */
    self.VARIETY_CO = "co";
    /**
    * @memberOf KiteTicker
    */
    self.VARIETY_AMO = "amo";

    // Transaction type
    /**
    * @memberOf KiteTicker
    */
    self.TRANSACTION_TYPE_BUY = "BUY";
    /**
    * @memberOf KiteTicker
    */
    self.TRANSACTION_TYPE_SELL = "SELL";

    // Validity
    /**
    * @memberOf KiteTicker
    */
    self.VALIDITY_DAY = "DAY";
    /**
    * @memberOf KiteTicker
    */
    self.VALIDITY_IOC = "IOC";

    // Exchanges
    /**
    * @memberOf KiteTicker
    */
    self.EXCHANGE_NSE = "NSE";
    /**
    * @memberOf KiteTicker
    */
    self.EXCHANGE_BSE = "BSE";
    /**
    * @memberOf KiteTicker
    */
    self.EXCHANGE_NFO = "NFO";
    /**
    * @memberOf KiteTicker
    */
    self.EXCHANGE_CDS = "CDS";
    /**
    * @memberOf KiteTicker
    */
    self.EXCHANGE_BFO = "BFO";
    /**
    * @memberOf KiteTicker
    */
    self.EXCHANGE_MCX = "MCX";

    // Margins segments
    /**
    * @memberOf KiteTicker
    */
    self.MARGIN_EQUITY = "equity";
    /**
    * @memberOf KiteTicker
    */
    self.MARGIN_COMMODITY = "commodity";

    /**
    * @memberOf KiteTicker
    */
    self.STATUS_CANCELLED = "CANCELLED";
    /**
    * @memberOf KiteTicker
    */
    self.STATUS_REJECTED = "REJECTED";
    /**
    * @memberOf KiteTicker
    */
    self.STATUS_COMPLETE = "COMPLETE";
    /**
    * @memberOf KiteTicker
    */
    self.GTT_TYPE_OCO = "two-leg";
    /**
    * @memberOf KiteTicker
    */
    self.GTT_TYPE_SINGLE = "single";
	/**
	* @memberOf KiteTicker
	*/
	self.GTT_STATUS_ACTIVE = "active";
    /**
    * @memberOf KiteTicker
    */
	self.GTT_STATUS_TRIGGERED = "triggered";
    /**
    * @memberOf KiteTicker
    */
	self.GTT_STATUS_DISABLED = "disabled";
    /**
    * @memberOf KiteTicker
    */
	self.GTT_STATUS_EXPIRED = "expired";
    /**
    * @memberOf KiteTicker
    */
	self.GTT_STATUS_CANCELLED = "cancelled";
    /**
    * @memberOf KiteTicker
    */
	self.GTT_STATUS_REJECTED = "rejected";
    /**
    * @memberOf KiteTicker
    */
	self.GTT_STATUS_DELETED = "deleted";

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
        self.session_expiry_hook = cb;
    };

    /**
     * Get the remote login url to which a user should be redirected to initiate the login flow.
     * @method getLoginURL
     * @memberOf KiteConnect
     * @instance
     */
    self.getLoginURL = function() {
        return self.default_login_uri + "?api_key=" + self.api_key + "&v=3";
    };

    /**
     * Do the token exchange with the `request_token` obtained after the login flow,
     * and retrieve the `access_token` required for all subsequent requests. The
     * response contains not just the `access_token`, but metadata for
     * the user who has authenticated.
     * @method generateSession
     * @memberOf KiteConnect
     * @instance
     *
     * @param {string} request_token Token obtained from the GET parameters after a successful login redirect.
     * @param {string} api_secret API secret issued with the API key.
     */
    self.generateSession = function(request_token, api_secret) {
        var checksum = sha256(self.api_key + request_token + api_secret).toString();

        var p = _post("api.token", {
                api_key: self.api_key,
                request_token: request_token,
                checksum: checksum
            }, null, formatGenerateSession);

        p.then(function(response) {
            self.setAccessToken(response.access_token);
        }).catch(function(err) {
            throw err
        });

        return p;
    };

    /**
     * Kill the session by invalidating the access token.
     * If access_token is passed then it will be set as current access token and get in validated.
     * @method invalidateAccessToken
     * @memberOf KiteConnect
     * @instance
     * @param {string} [access_token] Token to invalidate. Default is the active `access_token`.
     */
    self.invalidateAccessToken = function(access_token) {
        access_token = access_token || this.access_token;

        return _delete("api.token.invalidate", {
            api_key: self.api_key,
            access_token: access_token
        });
    };

    /**
     * Renew access token by active refresh token.
     * Renewed access token is implicitly set.
     * @method renewAccessToken
     * @memberOf KiteConnect
     * @instance
     *
     * @param {string} refresh_token Token obtained from previous successful login.
     * @param {string} api_secret API secret issued with the API key.
     */
    self.renewAccessToken = function(refresh_token, api_secret) {
        var checksum = sha256(self.api_key + refresh_token + api_secret).toString();

        var p = _post("api.token.renew", {
            api_key: self.api_key,
            refresh_token: refresh_token,
            checksum: checksum
        });

        p.then(function(response) {
            self.setAccessToken(response.access_token);
        }).catch(function(err) {
            throw err
        });

        return p;
    };

    /**
     * Invalidate the refresh token.
     * @method invalidateRefreshToken
     * @memberOf KiteConnect
     * @instance
     * @param {string} refresh_token Token to invalidate.
     */
    self.invalidateRefreshToken = function(refresh_token) {
        return _delete("api.token.invalidate", {
            api_key: this.api_key,
            refresh_token: refresh_token
        });
    };

    /**
     * Get user profile details.
     * @method getProfile
     * @memberOf KiteConnect
     * @instance
     */
    self.getProfile = function() {
        return _get("user.profile");
    }

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
     * @param {string} variety Order variety (ex. bo, co, amo, regular).
     * @param {string} params Order params.
     * @param {string} params.exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
     * @param {string} params.tradingsymbol Tradingsymbol of the instrument (ex. RELIANCE, INFY).
     * @param {string} params.transaction_type Transaction type (BUY or SELL).
     * @param {number} params.quantity Order quantity
     * @param {string} params.product	Product code (NRML, MIS, CNC).
     * @param {string} params.order_type Order type (NRML, SL, SL-M, MARKET).
     * @param {string} [params.validity] Order validity (DAY, IOC).
     * @param {number} [params.price] Order Price
     * @param {number} [params.disclosed_quantity] Disclosed quantity
     * @param {number} [params.trigger_price] Trigger price
     * @param {number} [params.squareoff] Square off value (only for bracket orders)
     * @param {number} [params.stoploss] Stoploss value (only for bracket orders)
     * @param {number} [params.trailing_stoploss] Trailing stoploss value (only for bracket orders)
     */
    self.placeOrder = function (variety, params) {
        params.variety = variety;
        return _post("order.place", params);
    };

    /**
     * Modify an order
     * @method modifyOrder
     * @memberOf KiteConnect
     * @instance
     * @param {string} variety Order variety (ex. bo, co, amo, regular).
     * @param {string} order_id ID of the order.
     * @param {Object} params Order modify params.
     * @param {number} [params.quantity] Order quantity
     * @param {number} [params.price] Order Price
     * @param {string} [params.order_type] Order type (NRML, SL, SL-M, MARKET).
     * @param {string} [params.validity] Order validity (DAY, IOC).
     * @param {number} [params.disclosed_quantity] Disclosed quantity
     * @param {number} [params.trigger_price] Trigger price
     * @param {string} [params.parent_order_id] Parent order id incase of multilegged orders.
     */
    self.modifyOrder = function(variety, order_id, params) {
        params.variety = variety;
        params.order_id = order_id;
        return _put("order.modify", params);
    };

    /**
     * Cancel an order
     * @method cancelOrder
     * @memberOf KiteConnect
     * @instance
     * @param {string} variety Order variety (ex. bo, co, amo,
     * @param {string} order_id ID of the order.
     * @param {Object} [params] Order params.
regular).
     * @param {string} [params.parent_order_id] Parent order id incase of multilegged orders.
     */
    self.cancelOrder = function (variety, order_id, params) {
        params = params || {};
        params.variety = variety;
        params.order_id = order_id;
        return _delete("order.cancel", params);
    };

    /**
     * Exit an order
     * @method exitOrder
     * @memberOf KiteConnect
     * @instance
     * @param {string} variety Order variety (ex. bo, co, amo,
     * @param {string} order_id ID of the order.
     * @param {Object} [params] Order params.
regular).
     * @param {string} [params.parent_order_id] Parent order id incase of multilegged orders.
     */
    self.exitOrder = function (variety, order_id, params) {
        return self.cancelOrder(variety, order_id, params);
    };

    /**
     * Get list of orders.
     * @method getOrders
     * @memberOf KiteConnect
     * @instance
     */
    self.getOrders = function() {
        return _get("orders", null, null, formatResponse);
    };

    /**
     * Get list of order history.
     * @method getOrderHistory
     * @memberOf KiteConnect
     * @instance
     * @param {string} order_id ID of the order whose order details to be retrieved.
     */
    self.getOrderHistory = function(order_id) {
        return  _get("order.info", {"order_id": order_id}, null, formatResponse);
    };

    /**
     * Retrieve the list of trades executed.
     * @method getTrades
     * @memberOf KiteConnect
     * @instance
     */
    self.getTrades = function(order_id) {
        return _get("trades", null, null, formatResponse);
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
        return  _get("order.trades", {"order_id": order_id}, null, formatResponse);
    };

    /**
     * Fetch required margin for order/list of orders
     * @method orderMargins
     * @memberOf KiteConnect
     * @instance
     * @param {Object} params   Margin fetch order params.
     * @param {string} params.exchange    Name of the exchange(eg. NSE, BSE, NFO, CDS, MCX)
     * @param {string} params.tradingsymbol   Trading symbol of the instrument
     * @param {string} params.transaction_type   eg. BUY, SELL  
     * @param {string} params.variety   Order variety (regular, amo, bo, co etc.)
     * @param {string} params.product   Margin product to use for the order
     * @param {string} params.order_type   Order type (MARKET, LIMIT etc.)
     * @param {number} params.quantity   Quantity of the order
     * @param {number} params.price   Price at which the order is going to be placed (LIMIT orders)
     * @param {number} params.trigger_price   Trigger price (for SL, SL-M, CO orders)
     */
    self.orderMargins = function(params){
        return _post("order.margins", params, ...Array(2), true);
    }

    /**
     * Retrieve the list of equity holdings.
     * @method getHoldings
     * @memberOf KiteConnect
     * @instance
     */
    self.getHoldings = function() {
        return _get("portfolio.holdings");
    };

    /**
     * Retrieve positions.
     * @method getPositions
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
     * @method getInstruments
     * @memberOf KiteConnect
     * @instance
     * @param {Array} [segment] Filter instruments based on exchange (NSE, BSE, NFO, BFO, CDS, MCX).
     * If no `segment` is specified, all instruments are returned.
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
     * @param {Array} instruments is a list of instruments, Instrument are in the format of `tradingsymbol:exchange`.
     * 	For example NSE:INFY
     */
    self.getQuote = function(instruments) {
        return _get("market.quote", {"i": instruments}, null, formatQuoteResponse);
    };

    /**
     * Retrieve OHLC for list of instruments.
     * @method getOHLC
     * @memberOf KiteConnect
     * @instance
     * @param {Array} instruments is a list of instruments, Instrument are in the format of `tradingsymbol:exchange`.
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
     * @param {Array} instruments is a list of instruments, Instrument are in the format of `tradingsymbol:exchange`.
     * 	For example NSE:INFY
     */
    self.getLTP = function(instruments) {
        return _get("market.quote.ltp", {"i": instruments});
    };

    // /**
    //  * Retrieve margins provided for individual segments.
    //  * @method getInstrumentsMargins
    //  * @memberOf KiteConnect
    //  * @instance
    //  * @param {string} segment is segment name to retrieve. For example equity, commodity
    //  */
    // self.getInstrumentsMargins = function(segment) {
    //     return self._get("market.margins", {"segment": segment});
    // };

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
     * @method getHistoricalData
     * @memberOf KiteConnect
     * @instance
     * @param {string} instrument_token Instrument identifier (retrieved from the instruments()) call.
     * @param {string} interval candle interval (minute, day, 5 minute etc.)
     * @param {string|Date} from_date From date (String in format of 'yyyy-mm-dd HH:MM:SS' or Date object).
     * @param {string|Date} to_date To date (String in format of 'yyyy-mm-dd HH:MM:SS' or Date object).
     * @param {bool}  [continuous=false] is a bool flag to get continuous data for futures and options instruments. Defaults to false.
     */
    self.getHistoricalData = function(instrument_token, interval, from_date, to_date, continuous) {
        continuous = continuous ? 1 : 0;
        if (typeof to_date === "object") to_date = _getDateTimeString(to_date)
        if (typeof from_date === "object") from_date = _getDateTimeString(from_date)

        return _get("market.historical", {
                instrument_token: instrument_token,
                interval: interval,
                from: from_date,
                to: to_date,
                continuous: continuous
            }, null, parseHistorical);
    };

    // Convert Date object to string of format yyyy-mm-dd HH:MM:SS
    function _getDateTimeString(date) {
        var isoString = date.toISOString();
        return isoString.replace("T", " ").split(".")[0];
    }

    /**
     * Retrieve the buy/sell trigger range for Cover Orders.
     * @method getTriggerRange
     * @memberOf KiteConnect
     * @instance
     * @param {string} exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
     * @param {string} tradingsymbol Tranding symbol of the instrument (ex. RELIANCE, INFY).
     * @param {string} transaction_type Transaction type (BUY or SELL).
     */
    self.getTriggerRange = function(transaction_type, instruments) {
        return _get("market.trigger_range",
            {
                "i": instruments,
                "transaction_type": transaction_type.toLowerCase()
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
            return _get("mf.order.info", { "order_id": order_id }, null, formatResponse);
        } else {
            return _get("mf.orders", null, null, formatResponse);
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
            return _get("mf.sip.info", {"sip_id": sip_id}, null, formatResponse);
        } else {
            return _get("mf.sips", null, null, formatResponse);
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
     * @param {string} sip_id ID of the SIP.
     * @param {string} params Order params.
     * @param {string} [params.instalments] Number of instalments to trigger. If set to -1, instalments are triggered at fixed intervals until the SIP is cancelled
     * @param {string} [params.frequency] Order frequency. weekly, monthly, or quarterly.
     * @param {string} [params.instalment_day] If frequency is monthly, the day of the month (1, 5, 10, 15, 20, 25) to trigger the order on.
     * @param {string} [params.status] Pause or unpause an SIP (active or paused).
     */
    self.modifyMFSIP = function (sip_id, params) {
        params.sip_id = sip_id;
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
        return _get("mf.instruments", null, null, transformMFInstrumentsResponse);
    }

    /**
     * Get GTTs list
     * @method getGTTs
     * @memberOf KiteConnect
     * @instance
     */
    self.getGTTs = function () {
        return _get("gtt.triggers", null, null, formatResponse);
    }

    /**
     * Get list of order history.
     * @method getGTT
     * @memberOf KiteConnect
     * @instance
     * @param {string} trigger_id GTT trigger ID
     */
    self.getGTT = function (trigger_id) {
        return _get("gtt.trigger_info", { "trigger_id": trigger_id }, null, formatResponse);
    };

	// Get API params from user defined GTT params.
    self._getGTTPayload = function (params) {
        if (params.trigger_type !== self.GTT_TYPE_OCO && params.trigger_type !== self.GTT_TYPE_SINGLE) {
            throw("Invalid `params.trigger_type`")
        }
        if (params.trigger_type === self.GTT_TYPE_OCO && params.trigger_values.length !== 2) {
            throw ("Invalid `trigger_values` for `OCO` order type")
        }
        if (params.trigger_type === self.GTT_TYPE_SINGLE && params.trigger_values.length !== 1) {
            throw ("Invalid `trigger_values` for `single` order type")
        }
        let condition = {
            exchange: params.exchange,
            tradingsymbol: params.tradingsymbol,
            trigger_values: params.trigger_values,
            last_price: parseFloat(params.last_price)
        }
        let orders = []
        for (let o of params.orders) {
            orders.push({
                transaction_type: o.transaction_type,
                order_type: o.order_type,
                product: o.product,
                quantity: parseInt(o.quantity),
                price: parseFloat(o.price),
                exchange: params.exchange,
                tradingsymbol: params.tradingsymbol
            })
        }
        return { condition, orders }
    };

    /**
     * Place GTT.
     * @method placeGTT
     * @memberOf KiteConnect
     * @instance
     * @param {string} params.trigger_type GTT type, its either `self.GTT_TYPE_OCO` or `self.GTT_TYPE_SINGLE`.
     * @param {string} params.tradingsymbol Tradingsymbol of the instrument (ex. RELIANCE, INFY).
     * @param {string} params.exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
     * @param {number[]} params.trigger_values List of trigger values, number of items depends on trigger type.
     * @param {number} params.last_price Price at which trigger is created. This is usually the last price of the instrument.
     * @param {Object[]} params.orders List of orders.
     * @param {string} params.orders.transaction_type Transaction type (BUY or SELL).
     * @param {number} params.orders.quantity Order quantity
     * @param {string} params.orders.product Product code (NRML, MIS, CNC).
     * @param {string} params.orders.order_type Order type (NRML, SL, SL-M, MARKET).
     * @param {number} params.orders.price Order price.
     */
    self.placeGTT = function (params) {
        let payload = self._getGTTPayload(params)
        return _post("gtt.place", {
            condition: JSON.stringify(payload.condition),
            orders: JSON.stringify(payload.orders),
            type: params.trigger_type
        });
    };

    /**
     * Place GTT.
     * @method modifyGTT
     * @memberOf KiteConnect
     * @instance
     * @param {string} trigger_id GTT trigger ID.
     * @param {Object} params Modify params
     * @param {string} params.trigger_type GTT type, its either `self.GTT_TYPE_OCO` or `self.GTT_TYPE_SINGLE`.
     * @param {string} params.tradingsymbol Tradingsymbol of the instrument (ex. RELIANCE, INFY).
     * @param {string} params.exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
     * @param {number[]} params.trigger_values List of trigger values, number of items depends on trigger type.
     * @param {number} params.last_price Price at which trigger is created. This is usually the last price of the instrument.
     * @param {Object[]} params.orders List of orders.
     * @param {string} params.orders.transaction_type Transaction type (BUY or SELL).
     * @param {number} params.orders.quantity Order quantity
     * @param {string} params.orders.product Product code (NRML, MIS, CNC).
     * @param {string} params.orders.order_type Order type (NRML, SL, SL-M, MARKET).
     * @param {number} params.orders.price Order price.
     */
    self.modifyGTT = function (trigger_id, params) {
        let payload = self._getGTTPayload(params)
        return _put("gtt.modify", {
            trigger_id: trigger_id,
            type: params.trigger_type,
            condition: JSON.stringify(payload.condition),
            orders: JSON.stringify(payload.orders)
        });
    };

    /**
     * Get list of order history.
     * @method deleteGTT
     * @memberOf KiteConnect
     * @instance
     * @param {string} trigger_id GTT ID
     */
    self.deleteGTT = function (trigger_id) {
        return _delete("gtt.delete", { "trigger_id": trigger_id }, null, null);
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

    // Format generate session response
    function formatGenerateSession(data) {
        if (!data.data || typeof data.data !== "object") return data;

        if (data.data.login_time) {
            data.data.login_time = new Date(data.data.login_time);
        }

        return data;
    }

    function formatQuoteResponse(data) {
        if (!data.data || typeof data.data !== "object") return data;

        for (var k in data.data) {
            var item = data.data[k];
            for (var field of ["timestamp", "last_trade_time"]) {
                if (item[field] && item[field].length === 19) {
                    item[field] = new Date(item[field]);
                }
            }
        }

        return data;
    }

    // Format response ex. datetime string to date
    function formatResponse(data) {
        if (!data.data || typeof data.data !== "object") return data;
        var list = [];
        if (data.data instanceof Array) {
            list = data.data;
        } else {
            list = [data.data]
        }

        var results = [];
        var fields = ["order_timestamp", "exchange_timestamp", "created", "last_instalment", "fill_timestamp"];

        for (var item of list) {
            for (var field of fields) {
                if (item[field] && item[field].length === 19) {
                    item[field] = new Date(item[field]);
                }
            }

            results.push(item);
        }

        if (data.data instanceof Array) {
            data.data = results;
        } else {
            data.data = results[0];
        }

        return data;
    }

    function parseHistorical(jsonData, headers) {
        // Return if its an error
        if (jsonData.error_type) return jsonData;

        var results = [];
        for(var i=0; i<jsonData.data.candles.length; i++) {
            var d = jsonData.data.candles[i];
            results.push({
                "date": new Date(d[0]),
                "open": d[1],
                "high": d[2],
                "low": d[3],
                "close": d[4],
                "volume": d[5]
            });
        }

        return { "data": results };
    }

    function transformInstrumentsResponse(data, headers) {
        // Parse CSV responses
        if (headers["content-type"] === "text/csv") {
            var parsedData = csvParse.parse(data, {"header": true}).data;
            for (var item of parsedData) {
                item["last_price"] = parseFloat(item["last_price"]);
                item["strike"] = parseFloat(item["strike"]);
                item["tick_size"] = parseFloat(item["tick_size"]);
                item["lot_size"] = parseInt(item["lot_size"]);

                if (item["expiry"] && item["expiry"].length === 10) {
                    item["expiry"] = new Date(item["expiry"]);
                }
            }

            return parsedData;
        }

        return data;
    }

    function transformMFInstrumentsResponse(data, headers) {
        // Parse CSV responses
        if (headers["content-type"] === "text/csv") {
            var parsedData = csvParse.parse(data, {"header": true}).data;
            for (var item of parsedData) {
                item["minimum_purchase_amount"] = parseFloat(item["minimum_purchase_amount"]);
                item["purchase_amount_multiplier"] = parseFloat(item["purchase_amount_multiplier"]);
                item["minimum_additional_purchase_amount"] = parseFloat(item["minimum_additional_purchase_amount"]);
                item["redemption_quantity_multiplier"] = parseFloat(item["redemption_quantity_multiplier"]);
                item["minimum_additional_purchase_amount"] = parseFloat(item["minimum_additional_purchase_amount"]);
                item["last_price"] = parseFloat(item["last_price"]);
                item["purchase_allowed"] = Boolean(parseInt(item["purchase_allowed"]));
                item["redemption_allowed"] = Boolean(parseInt(item["redemption_allowed"]));

                if (item["last_price_date"] && item["last_price_date"].length === 10) {
                    item["last_price_date"] = new Date(item["last_price_date"]);
                }
            }

            return parsedData;
        }

        return data;
    }

    function _get(route, params, responseType, responseTransformer, isJSON = false) {
        return request(route, "GET", params || {}, responseType, responseTransformer, isJSON);
    }

    function _post(route, params, responseType, responseTransformer, isJSON = false) {
        return request(route, "POST", params || {}, responseType, responseTransformer, isJSON);
    }

    function _put(route, params, responseType, responseTransformer, isJSON = false) {
        return request(route, "PUT", params || {}, responseType, responseTransformer, isJSON);
    }

    function _delete(route, params, responseType, responseTransformer, isJSON = false) {
        return request(route, "DELETE", params || {}, responseType, responseTransformer, isJSON);
    }

    function request(route, method, params, responseType, responseTransformer, isJSON) {
        // Check access token
        if (!responseType) responseType = "json";
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
            if (isJSON) {
            // post JSON payload
            payload = JSON.stringify(params);
            } else {
            // post url encoded payload    
            payload = querystring.stringify(params);
            }
        }

        var options = {
            method: method,
            url: uri,
            params: queryParams,
            data: payload,
            // Set auth header
            headers: {}
        };

        // Send auth token
        if (self.access_token) {
            var authHeader = self.api_key + ":" + self.access_token;
            options["headers"]["Authorization"] = "token " + authHeader;
        }

        // Set request header content type
        if(isJSON){
            options["headers"]["Content-Type"] = "application/json"
        } else {
            options["headers"]["Content-Type"] = "application/x-www-form-urlencoded"
        } 
        // Set response transformer
        if (responseTransformer) {
            options.transformResponse = axios.defaults.transformResponse.concat(responseTransformer);
        }

        return requestInstance.request(options);
    }
}

module.exports = KiteConnect;
