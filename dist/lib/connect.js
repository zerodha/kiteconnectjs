'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KiteConnect = void 0;
const axios_1 = __importDefault(require("axios"));
const papaparse_1 = __importDefault(require("papaparse"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const qs_1 = __importDefault(require("qs"));
const utils_1 = __importDefault(require("./utils"));
const interfaces_1 = require("../interfaces");
const constants_1 = require("../constants");
/**
 * @classdesc API client class. In production, you may initialise a single instance of this class per `api_key`.
 * This module provides an easy to use abstraction over the HTTP APIs.
 * The HTTP calls have been converted to methods and their JSON responses.
 * See the **[Kite Connect API documentation](https://kite.trade/docs/connect/v3/)**
 * for the complete list of APIs, supported parameters and values, and response formats.
 *
 * Getting started with API
 * ------------------------
 * ~~~~
 *
 * import { KiteConnect } from 'kiteconnect';
 *
 * const apiKey = 'your_api_key'
 * const apiSecret = 'your_api_secret'
 * const requestToken = 'your_request_token'
 *
 * const kc = new KiteConnect({ api_key: apiKey })
 *
 * async function init() {
 *     try {
 *         await generateSession()
 *         await getProfile()
 *     } catch (err) {
 *         console.error(err)
 *     }
 * }
 *
 * async function generateSession() {
 *     try {
 *         const response = await kc.generateSession(requestToken, apiSecret)
 *         kc.setAccessToken(response.access_token)
 *         console.log('Session generated:', response)
 *     } catch (err) {
 *         console.error('Error generating session:', err)
 *     }
 * }
 *
 * async function getProfile() {
 *     try {
 *         const profile = await kc.getProfile()
 *         console.log('Profile:', profile)
 *     } catch (err) {
 *         console.error('Error getting profile:', err)
 *     }
 * }
 * // Initialize the API calls
 * init();
 * ~~~~
 *
 * API promises
 * -------------
 * All API calls return a promise which you can `await` to handle asynchronously.
 *
 * ~~~~
 * try {
 *     const result = await kiteConnectApiCall;
 *     // On success
 * } catch (error) {
 *     // On rejection
 * }
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
 * @param {string} [params.root='https://api.kite.trade'] API end point root. Unless you explicitly
 *	want to send API requests to a non-default endpoint, this can be ignored.
 * @param {string} [params.login_uri='https://kite.zerodha.com/connect/login'] Kite connect login url
 * @param {bool}   [params.debug=false] If set to true, will console log requests and responses.
 * @param {number} [params.timeout=7000] Time (milliseconds) for which the API client will wait
 *	for a request to complete before it fails.
 *
 * @example <caption>Initialize KiteConnect object</caption>
 * const kc = new KiteConnect({ api_key: apiKey })
 */
class KiteConnect {
    /**
     * Creates an instance of KiteConnect.
     *
     * @constructor
     * @param {KiteConnectParams} params - The configuration parameters for initializing the instance.
     */
    constructor(params) {
        // Constants
        this.PRODUCT_MIS = 'MIS';
        this.PRODUCT_CNC = 'CNC';
        this.PRODUCT_NRML = 'NRML';
        // Order types
        this.ORDER_TYPE_MARKET = 'MARKET';
        this.ORDER_TYPE_LIMIT = 'LIMIT';
        this.ORDER_TYPE_SLM = 'SL-M';
        this.ORDER_TYPE_SL = 'SL';
        // Varieties
        this.VARIETY_REGULAR = 'regular';
        this.VARIETY_CO = 'co';
        this.VARIETY_AMO = 'amo';
        this.VARIETY_ICEBERG = 'iceberg';
        this.VARIETY_AUCTION = 'auction';
        // Transaction types
        this.TRANSACTION_TYPE_BUY = 'BUY';
        this.TRANSACTION_TYPE_SELL = 'SELL';
        // Validities
        this.VALIDITY_DAY = 'DAY';
        this.VALIDITY_IOC = 'IOC';
        this.VALIDITY_TTL = 'TTL';
        // Exchanges
        this.EXCHANGE_NSE = 'NSE';
        this.EXCHANGE_BSE = 'BSE';
        this.EXCHANGE_NFO = 'NFO';
        this.EXCHANGE_CDS = 'CDS';
        this.EXCHANGE_BCD = 'BCD';
        this.EXCHANGE_BFO = 'BFO';
        this.EXCHANGE_MCX = 'MCX';
        // Margins segments
        this.MARGIN_EQUITY = 'equity';
        this.MARGIN_COMMODITY = 'commodity';
        // Statuses
        this.STATUS_CANCELLED = 'CANCELLED';
        this.STATUS_REJECTED = 'REJECTED';
        this.STATUS_COMPLETE = 'COMPLETE';
        // GTT types
        this.GTT_TYPE_OCO = 'two-leg';
        this.GTT_TYPE_SINGLE = 'single';
        // GTT statuses
        this.GTT_STATUS_ACTIVE = 'active';
        this.GTT_STATUS_TRIGGERED = 'triggered';
        this.GTT_STATUS_DISABLED = 'disabled';
        this.GTT_STATUS_EXPIRED = 'expired';
        this.GTT_STATUS_CANCELLED = 'cancelled';
        this.GTT_STATUS_REJECTED = 'rejected';
        this.GTT_STATUS_DELETED = 'deleted';
        // Position types
        this.POSITION_TYPE_DAY = 'day';
        this.POSITION_TYPE_OVERNIGHT = 'overnight';
        /**
         * Sets a callback function to be invoked when the session expires.
         *
         * @param cb - The callback function to set as the session expiry hook.
         * @returns void
         */
        this.setSessionExpiryHook = function (cb) {
            this.session_expiry_hook = cb;
        };
        /**
         * Invalidates the specified refresh token.
         *
         * @param  {string} refresh_token - The refresh token to invalidate.
         * @returns A promise that resolves when the DELETE request is complete.
         */
        this.invalidateRefreshToken = function (refresh_token) {
            return this._delete('api.token.invalidate', {
                api_key: this.api_key,
                refresh_token: refresh_token
            });
        };
        this.api_key = params.api_key;
        this.root = params.root || constants_1.DEFAULTS.root;
        this.timeout = params.timeout || constants_1.DEFAULTS.timeout;
        this.debug = params.debug || constants_1.DEFAULTS.debug;
        this.access_token = params.access_token || null;
        this.default_login_uri = constants_1.DEFAULTS.login;
        this.session_expiry_hook = null;
        this.requestInstance = this.createAxiosInstance();
    }
    /**
     * Creates a custom Axios instance with the provided configuration.
     *
     * @private
     * @returns {AxiosInstance} Custom Axios instance
     */
    createAxiosInstance() {
        const kiteVersion = 3; // Kite version to send in header
        const userAgent = utils_1.default.getUserAgent(); // User agent to be sent with every request
        const requestInstance = axios_1.default.create({
            baseURL: this.root,
            timeout: this.timeout,
            headers: {
                'X-Kite-Version': kiteVersion,
                'User-Agent': userAgent
            },
            paramsSerializer(params) {
                const searchParams = new URLSearchParams();
                for (const key in params) {
                    if (params.hasOwnProperty(key)) {
                        const value = params[key];
                        if (Array.isArray(value)) {
                            value.forEach(val => searchParams.append(key, val));
                        }
                        else {
                            searchParams.append(key, value);
                        }
                    }
                }
                return searchParams.toString();
            }
        });
        // Add a request interceptor
        requestInstance.interceptors.request.use((request) => {
            if (this.debug)
                console.log(request);
            return request;
        });
        // Add a response interceptor
        requestInstance.interceptors.response.use((response) => {
            if (this.debug)
                console.log(response);
            const contentType = response.headers['content-type'];
            if (contentType === 'application/json' && typeof response.data === 'object') {
                // Throw incase of error
                if (response.data.error_type)
                    throw response.data;
                // Return success data
                return response.data.data;
            }
            else if (contentType === 'text/csv') {
                // Return the response directly
                return response.data;
            }
            else {
                return {
                    'error_type': 'DataException',
                    'message': 'Unknown content type (' + contentType + ') with response: (' + response.data + ')'
                };
            }
        }, (error) => {
            let resp = {
                'message': 'Unknown error',
                'error_type': 'GeneralException',
                'data': null
            };
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.data && error.response.data.error_type) {
                    if (error.response.data.error_type === 'TokenException' && this.session_expiry_hook) {
                        this.session_expiry_hook();
                    }
                    resp = error.response.data;
                }
                else {
                    resp.error_type = 'NetworkException';
                    resp.message = error.response.statusText;
                }
            }
            else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                resp.error_type = 'NetworkException';
                resp.message = 'No response from server with error code: ' + error.code;
            }
            else if (error.message) {
                resp = error;
            }
            return Promise.reject(resp);
        });
        return requestInstance;
    }
    /**
     * Sets the access token for the API client.
     *
     * @param accessToken The access token to set.
     * @returns {void}
     */
    setAccessToken(accessToken) {
        this.access_token = accessToken;
    }
    /**
     * Returns the login URL with the embedded API key.
     *
     * @remarks
     * This method constructs and returns the login URL with the embedded API key.
     *
     * @returns The login URL with the embedded API key.
     */
    getLoginURL() {
        return `${this.default_login_uri}?api_key=${this.api_key}&v=3`;
    }
    ;
    /**
     * Generates a session using the provided request token and API secret.
     *
     * @remarks
     * This method generates a session by sending a request to the API with the provided request token and API secret.
     * Upon successful completion, the method resolves with the session details, including the access token. If an error occurs,
     * the method rejects with an error.
     *
     * @param {string} request_token - The request token obtained during the login flow.
     * @param {string} api_secret - The API secret associated with the user's account.
     * @returns {Promise<any>} A promise that resolves when the session generation is successful and rejects if an error occurs.
     */
    generateSession(request_token, api_secret) {
        return new Promise((resolve, reject) => {
            const checksum = (0, sha256_1.default)(this.api_key + request_token + api_secret).toString();
            const p = this._post('api.token', {
                api_key: this.api_key,
                request_token: request_token,
                checksum: checksum
            }, null, formatGenerateSession);
            p.then((resp) => {
                // Set access token.
                if (resp && resp.access_token) {
                    this.setAccessToken(resp.access_token);
                }
                return resolve(resp);
            }).catch(function (err) {
                return reject(err);
            });
        });
    }
    ;
    /**
     * Invalidates the access token.
     *
     * @remarks
     * This method sends a DELETE request to invalidate the specified access token.
     * If no access token is provided, the method uses the default access token associated with the instance.
     *
     * @param {string} [access_token] - The access token to invalidate. If not provided, the default access token is used.
     * @returns {Promise<boolean>} A promise that resolves when the DELETE request is complete.
     */
    invalidateAccessToken(access_token) {
        return this._delete('api.token.invalidate', {
            api_key: this.api_key,
            access_token: access_token || this.access_token,
        });
    }
    ;
    /**
     * Renews the access token using the provided refresh token and API secret.
     *
     * @remarks
     * This method sends a request to renew the access token using the given refresh token
     * and API secret. If the renewal is successful, the promise resolves to the renewed
     * access token. If the renewal fails, the promise is rejected with an error message.
     *
     * @param {string} refresh_token - The refresh token used for renewing the access token.
     * @param {string} api_secret - The API secret required for the renewal process.
     * @returns {Promise<any>} A promise that resolves to the renewed access token if successful.
     *          If the renewal fails, the promise is rejected with an error message.
     */
    renewAccessToken(refresh_token, api_secret) {
        return new Promise((resolve, reject) => {
            const checksum = (0, sha256_1.default)(this.api_key + refresh_token + api_secret).toString();
            const p = this._post('api.token.renew', {
                api_key: this.api_key,
                refresh_token: refresh_token,
                checksum: checksum
            });
            p.then((resp) => {
                if (resp && resp.access_token) {
                    this.setAccessToken(resp.access_token);
                }
                return resolve(resp);
            }).catch(function (err) {
                return reject(err);
            });
        });
    }
    ;
    /**
     * Retrieves the user's profile.
     *
     * @returns {Promise<any>} A promise that resolves with the user's profile data.
     */
    getProfile() {
        return this._get('user.profile');
    }
    ;
    /**
     * Retrieves margin details for the specified segment or all segments.
     *
     * @remarks
     * If a segment is specified, margin details for that segment are retrieved. Otherwise, margin details for all segments are retrieved.
     *
     * @param {?string} segment - Optional. The segment for which to retrieve margin details.
     * @returns {Promise<any>} A promise that resolves with the margin details.
     *          If a segment is specified, the promise resolves with margin details for that segment.
     *          If no segment is specified, the promise resolves with margin details for all segments.
     */
    getMargins(segment) {
        if (segment) {
            return this._get('user.margins.segment', { 'segment': segment });
        }
        else {
            return this._get('user.margins');
        }
    }
    ;
    /**
     * Places an order with the specified variety and parameters.
     *
     * @param {Varieties} variety - The variety of the order.
     * @param {PlaceOrderParams} params - The parameters for the order.
     * @returns {Promise<any>} A promise that resolves with the result of the order placement.
     */
    placeOrder(variety, params) {
        params.variety = variety;
        return this._post('order.place', params);
    }
    ;
    /**
     * @param {Varieties} variety  - The variety of the order.
     * @param {(string | number)} order_id - The ID of the order to modify.
     * @param {ModifyOrderParams} params - The parameters for modifying the order.
     * @returns {Promise<any>} A Promise that resolves with the modified order details.
     */
    modifyOrder(variety, order_id, params) {
        params.variety = variety;
        params.order_id = order_id;
        return this._put('order.modify', params);
    }
    ;
    /**
     * @param {Varieties} variety - The variety of the order.
     * @param {(string | number)} order_id - The ID of the order to modify.
     * @param {?CancelOrderParams} [params] - The parameters for cancelling the order.
     * @returns {Promise<any>}
     */
    cancelOrder(variety, order_id, params) {
        params = params || {};
        params.variety = variety;
        params.order_id = order_id;
        return this._delete('order.cancel', params);
    }
    ;
    /**
     * @param {Varieties} variety - The variety of the order.
     * @param {string} order_id - The ID of the order to modify.
     * @param {ExitOrderParams} params - The parameters required for exiting the order.
     * @returns {Promise<any>}
     */
    exitOrder(variety, order_id, params) {
        return this.cancelOrder(variety, order_id, params);
    }
    ;
    /**
     * Retrieves orders.
     *
     * @returns {Promise<any>} A Promise that resolves to the retrieved orders.
     */
    getOrders() {
        return this._get('orders', null, null, this.formatResponse);
    }
    ;
    /**
     * Retrieves the order history for a given order ID.
     *
     * @param {(string | number)} order_id - The ID of the order to retrieve history for.
     * @returns {Promise<any>} - A Promise that resolves to the order history information.
     *          The resolved value can be of any type.
     */
    getOrderHistory(order_id) {
        return this._get('order.info', { 'order_id': order_id }, null, this.formatResponse);
    }
    ;
    /**
     * Retrieves trades data.
     *
     * @remarks
     * This method retrieves trades data from the server.
     *
     * @returns {Promise<any>} A Promise that resolves with the trades data.
     */
    getTrades() {
        return this._get('trades', null, null, this.formatResponse);
    }
    ;
    /**
     * Retrieves the trades associated with a specific order.
     *
     * @param {string | number} order_id - The ID of the order.
     * @returns {Promise<any>} A Promise resolving to the trades associated with the order.
     */
    getOrderTrades(order_id) {
        return this._get('order.trades', { 'order_id': order_id }, null, this.formatResponse);
    }
    ;
    /**
     * Calculates margins for the specified orders.
     *
     * @param {MarginOrder[]} orders - The array of orders for which margins are to be calculated.
     * @param {string} [mode='compact'] - The mode for margin calculation (optional).
     * @returns {Promise<any>} - A Promise that resolves with the calculated margins.
     */
    orderMargins(orders, mode = 'compact') {
        return this._post('order.margins', orders, null, undefined, true, { 'mode': mode });
    }
    ;
    /**
     * Retrieves the virtual contract note for the specified orders.
     *
     * @param {VirtualContractParam[]} orders - The array of orders for which to retrieve the virtual contract note.
     * @returns {Promise<any>} A Promise that resolves with the virtual contract note.
     */
    getvirtualContractNote(orders) {
        return this._post('order.contract_note', orders, null, undefined, true, null);
    }
    ;
    /**
     * Retrieves margin information for a basket of orders.
     *
     * @param {Order[]} orders - The array of orders for which to retrieve margin information.
     * @param {boolean} [consider_positions=true] - Flag indicating whether to consider existing positions.
     * @param {*} [mode='compact'] - The mode of operation. Default is compact.
     * @returns {Promise<any>} - A Promise that resolves to margin information for the basket of orders.
     */
    orderBasketMargins(orders, consider_positions = true, mode = 'compact') {
        return this._post('order.margins.basket', orders, null, undefined, true, { 'consider_positions': consider_positions, 'mode': mode });
    }
    ;
    /**
     * Retrieves the holdings from the portfolio.
     *
     * @returns {Promise<any>} A Promise that resolves with the holdings data.
     */
    getHoldings() {
        return this._get('portfolio.holdings');
    }
    ;
    /**
     * Retrieves auction instruments.
     *
     * @remarks
     * This method retrieves auction instruments from the portfolio holdings.
     *
     * @returns {Promise<any>} A Promise that resolves with the auction instruments.
     */
    getAuctionInstruments() {
        return this._get('portfolio.holdings.auction');
    }
    ;
    /**
     * Retrieves positions from the portfolio.
     *
     * @returns {Promise<any>} A promise that resolves with the positions data.
     */
    getPositions() {
        return this._get('portfolio.positions');
    }
    ;
    /**
     * Converts a position based on the provided parameters.
     *
     * @param {ConvertPositionParams} params - The parameters for converting the position.
     * @returns {Promise<any>} A Promise that resolves with the result of the conversion.
     *
     */
    convertPosition(params) {
        return this._put('portfolio.positions.convert', params);
    }
    ;
    /**
     * Retrieves instruments based on the provided exchange.
     *
     * @param {Exchanges} exchange - Exchange name
     * @returns {Promise<any>} - A Promise resolving to the fetched instruments.
     */
    getInstruments(exchange) {
        if (exchange) {
            return this._get('market.instruments', {
                'exchange': exchange
            }, null, this.transformInstrumentsResponse);
        }
        else {
            return this._get('market.instruments.all', null, null, this.transformInstrumentsResponse);
        }
    }
    ;
    /**
     * Retrieves Quote data for the specified instruments.
     *
     * @param {(string | string[])} instruments - An array of exchange:tradingsymbol
     * @returns {Promise<any>} A promise that resolves with the quote data for the specified instruments.
     */
    getQuote(instruments) {
        return this._get('market.quote', { "i": instruments }, null, formatQuoteResponse);
    }
    ;
    /**
     * Retrieves OHLC (Open, High, Low, Close) data for the specified instruments.
     *
     * @param {(string | string[])} instruments - An array of exchange:tradingsymbol.
     * @returns {Promise<any>} A promise that resolves with the OHLC data for the specified instruments.
     */
    getOHLC(instruments) {
        return this._get('market.quote.ohlc', { "i": instruments });
    }
    ;
    /**
     * Retrieves the last traded price (LTP) of the specified instruments.
     *
     * @remarks
     * This method fetches the last traded price (LTP) for the provided instruments.
     *
     * @param {(string | string[])} instruments - An array of exchange:tradingsymbol
     * @returns {Promise<any>} The last traded price (LTP) of the specified instruments as a Promise<any>.
     */
    getLTP(instruments) {
        return this._get('market.quote.ltp', { "i": instruments });
    }
    ;
    /**
     * Retrieve historical data (candles) for an instrument.
     * For example:
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
     * @param {(number | string)} instrument_token
     * @param {string} interval
     * @param {(string | Date)} from_date
     * @param {(string | Date)} to_date
     * @param {(number | boolean)} [continuous=false]
     * @param {(number | boolean)} [oi=false]
     * @returns {Promise<any>}
     */
    getHistoricalData(instrument_token, interval, from_date, to_date, continuous = false, oi = false) {
        continuous = continuous ? 1 : 0;
        oi = oi ? 1 : 0;
        if (typeof to_date === 'object')
            to_date = _getDateTimeString(to_date);
        if (typeof from_date === 'object')
            from_date = _getDateTimeString(from_date);
        return this._get('market.historical', {
            instrument_token: instrument_token,
            interval: interval,
            from: from_date,
            to: to_date,
            continuous: continuous,
            oi: oi
        }, null, this.parseHistorical);
    }
    ;
    /**
     * @param {?(string | number)} [order_id]
     * @returns {*}
     */
    getMFOrders(order_id) {
        if (order_id) {
            return this._get('mf.order.info', { 'order_id': order_id }, null, this.formatResponse);
        }
        else {
            return this._get('mf.orders', null, null, this.formatResponse);
        }
    }
    ;
    /**
     *
     *
     * @param {PlaceMFOrderParams} params
     * @returns {*}
     */
    placeMFOrder(params) {
        return this._post('mf.order.place', params);
    }
    /**
     *
     *
     * @param {(string | number)} order_id
     * @returns {*}
     */
    cancelMFOrder(order_id) {
        return this._delete('mf.order.cancel', { 'order_id': order_id });
    }
    /**
     *
     *
     * @param {?(string | number)} [sip_id]
     * @returns {*}
     */
    getMFSIPS(sip_id) {
        if (sip_id) {
            return this._get('mf.sip.info', { 'sip_id': sip_id }, null, this.formatResponse);
        }
        else {
            return this._get('mf.sips', null, null, this.formatResponse);
        }
    }
    /**
     *
     *
     * @param {Order} params
     * @returns {*}
     */
    placeMFSIP(params) {
        return this._post('mf.sip.place', params);
    }
    /**
     *
     *
     * @param {(string | number)} sip_id
     * @param {Order} params
     * @returns {*}
     */
    modifyMFSIP(sip_id, params) {
        params.sip_id = sip_id;
        return this._put('mf.sip.modify', params);
    }
    /**
     *
     *
     * @param {(string | number)} sip_id
     * @returns {*}
     */
    cancelMFSIP(sip_id) {
        return this._delete('mf.sip.cancel', { 'sip_id': sip_id });
    }
    /**
     *
     *
     * @returns {*}
     */
    getMFHoldings() {
        return this._get('mf.holdings');
    }
    /**
     *
     *
     * @returns {*}
     */
    getMFInstruments() {
        return this._get('mf.instruments', null, null, transformMFInstrumentsResponse);
    }
    /**
     * Get GTTs list
     *
     * @returns {Promise<any>}
     */
    getGTTs() {
        return this._get('gtt.triggers', null, null, this.formatResponse);
    }
    /**
     * Get specific GTT history
     *
     * @param {(string | number)} trigger_id
     * @returns {Promise<any>}
     */
    getGTT(trigger_id) {
        return this._get('gtt.trigger_info', { 'trigger_id': trigger_id }, null, this.formatResponse);
    }
    ;
    /**
     * Get API params from user defined GTT params
     *
     * @param {PlaceGTTParams} params
     * @returns {{ condition: { exchange: Exchanges; tradingsymbol: string; trigger_values: {}; last_price: any; }; orders: {}; }}
     */
    _getGTTPayload(params) {
        var _a, _b;
        if (params.trigger_type !== interfaces_1.GTTStatusTypes.GTT_TYPE_OCO && params.trigger_type !== interfaces_1.GTTStatusTypes.GTT_TYPE_SINGLE) {
            throw new Error('Invalid `params.trigger_type`');
        }
        if (params.trigger_type === interfaces_1.GTTStatusTypes.GTT_TYPE_OCO && ((_a = params.trigger_values) === null || _a === void 0 ? void 0 : _a.length) !== 2) {
            throw new Error('Invalid `trigger_values` for `OCO` order type');
        }
        if (params.trigger_type === interfaces_1.GTTStatusTypes.GTT_TYPE_SINGLE && ((_b = params.trigger_values) === null || _b === void 0 ? void 0 : _b.length) !== 1) {
            throw new Error('Invalid `trigger_values` for `single` order type');
        }
        const condition = {
            exchange: params.exchange,
            tradingsymbol: params.tradingsymbol,
            trigger_values: params.trigger_values,
            last_price: params.last_price
        };
        let orders = [];
        for (let o of params.orders) {
            orders.push({
                transaction_type: o.transaction_type,
                order_type: o.order_type,
                product: o.product,
                quantity: parseInt(o.quantity),
                price: parseFloat(o.price),
                exchange: params.exchange,
                tradingsymbol: params.tradingsymbol
            });
        }
        return { condition, orders };
    }
    ;
    /**
     * Place GTT.
     * @param {PlaceGTTParams} params
     * @returns {Promise<any>}
     */
    placeGTT(params) {
        const payload = this._getGTTPayload(params);
        return this._post('gtt.place', {
            condition: JSON.stringify(payload.condition),
            orders: JSON.stringify(payload.orders),
            type: params.trigger_type
        });
    }
    ;
    /**
     * Modify GTT Order
     *
     * @param {(string | number)} trigger_id
     * @param {PlaceGTTParams} params
     * @returns {Promise<any>}
     */
    modifyGTT(trigger_id, params) {
        const payload = this._getGTTPayload(params);
        return this._put('gtt.modify', {
            trigger_id: trigger_id,
            type: params.trigger_type,
            condition: JSON.stringify(payload.condition),
            orders: JSON.stringify(payload.orders)
        });
    }
    ;
    /**
     * Delete specific GTT order
     *
     * @param {(string | number)} trigger_id
     * @returns {Promise<any>}
     */
    deleteGTT(trigger_id) {
        return this._delete('gtt.delete', { 'trigger_id': trigger_id }, null, undefined);
    }
    ;
    /**
     * Validate postback data checksum
     *
     * @param {AnyObject} postback_data
     * @param {string} api_secret
     * @returns {boolean}
     */
    validatePostback(postback_data, api_secret) {
        if (!postback_data || !postback_data.checksum || !postback_data.order_id ||
            !postback_data.order_timestamp || !api_secret) {
            throw new Error('Invalid postback data or api_secret');
        }
        const inputString = postback_data.order_id + postback_data.order_timestamp + api_secret;
        let checksum;
        try {
            checksum = (0, sha256_1.default)(inputString).toString();
        }
        catch (e) {
            throw (e);
        }
        return postback_data.checksum === checksum;
    }
    /**
     *
     * @private
     * @param {string} route
     * @param {?(AnyObject | null)} [params]
     * @param {?(string | null)} [responseType]
     * @param {?AxiosTransformer} [responseTransformer]
     * @param {boolean} [isJSON=false]
     * @returns {*}
     */
    _get(route, params, responseType, responseTransformer, isJSON = false) {
        return this.request(route, 'GET', params || {}, responseType, responseTransformer, isJSON);
    }
    /**
     *
     *
     * @private
     * @param {string} route
     * @param {(AnyObject | null)} params
     * @param {?(string | null)} [responseType]
     * @param {?AxiosTransformer} [responseTransformer]
     * @param {boolean} [isJSON=false]
     * @param {(AnyObject | null)} [queryParams=null]
     * @returns {*}
     */
    _post(route, params, responseType, responseTransformer, isJSON = false, queryParams = null) {
        return this.request(route, 'POST', params || {}, responseType, responseTransformer, isJSON, queryParams);
    }
    /**
     *
     *
     * @private
     * @param {string} route
     * @param {(AnyObject | null)} params
     * @param {?(string | null)} [responseType]
     * @param {?AxiosTransformer} [responseTransformer]
     * @param {boolean} [isJSON=false]
     * @param {*} [queryParams=null]
     * @returns {*}
     */
    _put(route, params, responseType, responseTransformer, isJSON = false, queryParams = null) {
        return this.request(route, 'PUT', params || {}, responseType, responseTransformer, isJSON, queryParams);
    }
    /**
     *
     *
     * @private
     * @param {string} route
     * @param {(AnyObject | null)} params
     * @param {?(string | null)} [responseType]
     * @param {?AxiosTransformer} [responseTransformer]
     * @param {boolean} [isJSON=false]
     * @returns {*}
     */
    _delete(route, params, responseType, responseTransformer, isJSON = false) {
        return this.request(route, 'DELETE', params || {}, responseType, responseTransformer, isJSON);
    }
    /**
     *
     *
     * @private
     * @param {string} route
     * @param {Method} method
     * @param {AnyObject} params
     * @param {?(string | null)} [responseType]
     * @param {?AxiosTransformer} [responseTransformer]
     * @param {?boolean} [isJSON]
     * @param {?(Record<string, any> | null)} [queryParams]
     * @returns {*}
     */
    request(route, method, params, responseType, responseTransformer, isJSON, queryParams) {
        // Check access token
        if (!responseType)
            responseType = 'json';
        let uri = constants_1.ROUTES[route];
        // Replace variables in 'RESTful' URLs with corresponding params
        if (uri.indexOf('{') !== -1) {
            let k;
            for (k in params) {
                if (params.hasOwnProperty(k)) {
                    uri = uri.replace('{' + k + '}', params[k]);
                }
            }
        }
        let payload = null;
        if (method === 'GET' || method === 'DELETE') {
            queryParams = params;
        }
        else {
            if (isJSON) {
                // post JSON payload
                payload = JSON.stringify(params);
            }
            else {
                // post url encoded payload
                payload = qs_1.default.stringify(params);
            }
        }
        const options = {
            method,
            url: uri,
            params: queryParams,
            data: payload,
            // Set auth header
            headers: {}
        };
        // Send auth token
        if (this.access_token) {
            const authHeader = `${this.api_key}:${this.access_token}`;
            options['headers']['Authorization'] = `token ${authHeader}`;
        }
        // Set request header content type
        if (isJSON) {
            options['headers']['Content-Type'] = 'application/json';
        }
        else {
            options['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        // Set response transformer
        if (responseTransformer) {
            options.transformResponse = axios_1.default.defaults.transformResponse.concat(responseTransformer);
        }
        return this.requestInstance.request(options);
    }
    /**
     *
     *
     * @private
     * @param {AnyObject} jsonData
     * @returns {AnyObject}
     */
    parseHistorical(jsonData) {
        // Return if its an error
        if (jsonData.error_type)
            return jsonData;
        const results = [];
        for (let i = 0; i < jsonData.data.candles.length; i++) {
            const d = jsonData.data.candles[i];
            const c = {
                'date': new Date(d[0]),
                'open': d[1],
                'high': d[2],
                'low': d[3],
                'close': d[4],
                'volume': d[5]
            };
            // Add OI field if its returned
            if (d[6]) {
                c['oi'] = d[6];
            }
            results.push(c);
        }
        return { 'data': results };
    }
    /**
     *
     *
     * @private
     * @param {*} data
     * @param {AnyObject} headers
     * @returns {*}
     */
    transformInstrumentsResponse(data, headers) {
        // Parse CSV responses
        if (headers['content-type'] === 'text/csv') {
            const parsedData = papaparse_1.default.parse(data, { 'header': true }).data;
            for (const item of parsedData) {
                item['last_price'] = parseFloat(item['last_price']);
                item['strike'] = parseFloat(item['strike']);
                item['tick_size'] = parseFloat(item['tick_size']);
                item['lot_size'] = parseInt(item['lot_size']);
                if (item['expiry'] && item['expiry'].length === 10) {
                    item['expiry'] = new Date(item['expiry']);
                }
            }
            return parsedData;
        }
        return data;
    }
    /**
     *
     *
     * @private
     * @param {AnyObject} data
     * @returns {AnyObject}
     */
    formatResponse(data) {
        if (!data.data || typeof data.data !== 'object')
            return data;
        let list = [];
        if (data.data instanceof Array) {
            list = data.data;
        }
        else {
            list = [data.data];
        }
        const results = [];
        const fields = ['order_timestamp', 'exchange_timestamp', 'created', 'last_instalment', 'fill_timestamp'];
        for (const item of list) {
            for (const field of fields) {
                if (item[field] && item[field].length === 19) {
                    item[field] = new Date(item[field]);
                }
            }
            results.push(item);
        }
        if (data.data instanceof Array) {
            data.data = results;
        }
        else {
            data.data = results[0];
        }
        return data;
    }
}
exports.KiteConnect = KiteConnect;
/**
 *
 * @param {AnyObject} data
 * @returns {AnyObject}
 */
function formatGenerateSession(data) {
    if (!data.data || typeof data.data !== 'object')
        return data;
    if (data.data.login_time) {
        data.data.login_time = new Date(data.data.login_time);
    }
    return data;
}
/**
 *
 * @param {AnyObject} data
 * @returns {AnyObject}
 */
function formatQuoteResponse(data) {
    if (!data.data || typeof data.data !== 'object')
        return data;
    for (const k in data.data) {
        const item = data.data[k];
        for (const field of ['timestamp', 'last_trade_time']) {
            if (item[field] && item[field].length === 19) {
                item[field] = new Date(item[field]);
            }
        }
    }
    return data;
}
// Format response ex. datetime string to date
/**
 *
 * @param {*} data
 * @param {AnyObject} headers
 * @returns {*}
 */
function transformMFInstrumentsResponse(data, headers) {
    // Parse CSV responses
    if (headers['content-type'] === 'text/csv') {
        const parsedData = papaparse_1.default.parse(data, { 'header': true }).data;
        for (const item of parsedData) {
            item['minimum_purchase_amount'] = parseFloat(item['minimum_purchase_amount']);
            item['purchase_amount_multiplier'] = parseFloat(item['purchase_amount_multiplier']);
            item['minimum_additional_purchase_amount'] = parseFloat(item['minimum_additional_purchase_amount']);
            item['redemption_quantity_multiplier'] = parseFloat(item['redemption_quantity_multiplier']);
            item['minimum_additional_purchase_amount'] = parseFloat(item['minimum_additional_purchase_amount']);
            item['last_price'] = parseFloat(item['last_price']);
            item['purchase_allowed'] = Boolean(parseInt(item['purchase_allowed']));
            item['redemption_allowed'] = Boolean(parseInt(item['redemption_allowed']));
            if (item['last_price_date'] && item['last_price_date'].length === 10) {
                item['last_price_date'] = new Date(item['last_price_date']);
            }
        }
        return parsedData;
    }
    return data;
}
/**
 
 *
 * @param {Date} date
 * @returns {*}
 */
function _getDateTimeString(date) {
    const isoString = date.toISOString();
    return isoString.replace('T', ' ').split('.')[0];
}
