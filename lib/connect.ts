'use strict';

import axios, { AxiosInstance, AxiosRequestConfig, AxiosTransformer, Method } from 'axios';
import csvParse from 'papaparse';
import sha256 from 'crypto-js/sha256';
import querystring from 'querystring';
import utils from './utils';
import { KiteConnectParams, Varieties, GTTStatusTypes, AnyObject, Order, TransactionTypes, KiteConectInterface, CancelOrderParams, ExitOrderParams, ModifyGTTParams, ModifyOrderParams, PlaceGTTParams, PlaceMFOrderParams, PlaceOrderParams } from '../interfaces';
import { DEFAULTS, ROUTES } from '../constants';


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
 * const KiteConnect = require('kiteconnect').KiteConnect;
 *
 * const kc = new KiteConnect({api_key: 'your_api_key'});
 *
 * kc.generateSession('request_token', 'api_secret')
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
 * @param {string} [params.root='https://api.kite.trade'] API end point root. Unless you explicitly
 *	want to send API requests to a non-default endpoint, this can be ignored.
 * @param {string} [params.login_uri='https://kite.zerodha.com/connect/login'] Kite connect login url
 * @param {bool}   [params.debug=false] If set to true, will console log requests and responses.
 * @param {number} [params.timeout=7000] Time (milliseconds) for which the API client will wait
 *	for a request to complete before it fails.
 *
 * @example <caption>Initialize KiteConnect object</caption>
 * const kc = KiteConnect('my_api_key', {timeout: 10, debug: false})
 */





class KiteConnect implements KiteConectInterface {
    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @type {string}
     */
    api_key: string;
    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @type {?(string | null)}
     */
    access_token?: string | null;
    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @type {?string}
     */
    root?: string;
    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @type {?string}
     */
    login_uri?: string;
    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @type {?boolean}
     */
    debug?: boolean;
    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @type {?number}
     */
    timeout?: number;
    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @type {?string}
     */
    default_connect_uri?: string;
    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @type {?(string | null)}
     */
    session_expiry_hook?: string | null;
    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @type {?string}
     */
    default_login_uri?: string;
    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @private
     * @type {AxiosInstance}
     */
    private requestInstance: AxiosInstance;

    /**
     * Creates an instance of KiteConnect.
     * @date 07/06/2023 - 21:37:49
     *
     * @constructor
     * @param {KiteConnectParams} params
     */
    constructor(params: KiteConnectParams) {
        this.api_key = params.api_key;
        this.root = params.root || DEFAULTS.root;
        this.timeout = params.timeout || DEFAULTS.timeout;
        this.debug = params.debug || DEFAULTS.debug;
        this.access_token = params.access_token || null;
        this.default_connect_uri = DEFAULTS.login;
        this.session_expiry_hook = null;
        this.requestInstance = this.createAxiosInstance();
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @private
     * @returns {*}
     */
    private createAxiosInstance() {
        const kiteVersion = 3; // Kite version to send in header
        const userAgent = utils.getUserAgent();  // User agent to be sent with every request
        const requestInstance = axios.create({
            baseURL: this.root as string,
            timeout: this.timeout,
            headers: {
                'X-Kite-Version': kiteVersion,
                'User-Agent': userAgent
            },
            paramsSerializer(params) {
                return querystring.stringify(params);
            }
        });

        // Add a request interceptor
        requestInstance.interceptors.request.use((request) => {
            if (this.debug) console.log(request);
            return request;
        });

        // Add a response interceptor
        requestInstance.interceptors.response.use((response) => {
            if (this.debug) console.log(response);

            const contentType = response.headers['content-type'];
            if (contentType === 'application/json' && typeof response.data === 'object') {
                // Throw incase of error
                if (response.data.error_type) throw response.data;

                // Return success data
                return response.data.data;
            } else if (contentType === 'text/csv') {
                // Return the response directly
                return response.data
            } else {
                return {
                    'error_type': 'DataException',
                    'message': 'Unknown content type (' + contentType + ') with response: (' + response.data + ')'
                };
            }
        }, function (error) {
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
                        this.session_expiry_hook()
                    }

                    resp = error.response.data;
                } else {
                    resp.error_type = 'NetworkException';
                    resp.message = error.response.statusText;
                }
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                resp.error_type = 'NetworkException';
                resp.message = 'No response from server with error code: ' + error.code;
            } else if (error.message) {
                resp = error
            }

            return Promise.reject(resp);
        });
        return requestInstance;
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @param {string} accessToken
     */
    setAccessToken(accessToken: string) {
        this.access_token = accessToken;
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @param {Function} cb
     */
    setSessionExpiryHook = function (cb: Function) {
        this.session_expiry_hook = cb;
    };

    /**
     * 
     * @date 07/06/2023 - 21:37:49
     *
     * @returns {string}
     */
    getLoginURL() {
        return `${this.default_login_uri}?api_key=${this.api_key}&v=3`;
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {string} request_token
     * @param {string} api_secret
     * @returns {*}
     */
    generateSession(request_token: string, api_secret: string) {
        return new Promise(function (resolve, reject) {
            const checksum = sha256(this.api_key + request_token + api_secret).toString();
            const p = this._post('api.token', {
                api_key: this.api_key,
                request_token: request_token,
                checksum: checksum
            }, null, formatGenerateSession);

            p.then(function (resp: any) {
                // Set access token.
                if (resp && resp.access_token) {
                    this.setAccessToken(resp.access_token);
                }
                return resolve(resp);
            }).catch(function (err: Error) {
                return reject(err);
            });
        });
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {?string} [access_token]
     * @returns {*}
     */
    invalidateAccessToken(access_token?: string) {
        return this._delete('api.token.invalidate', {
            api_key: this.api_key,
            access_token: access_token || this.access_token,
        });
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {string} refresh_token
     * @param {string} api_secret
     * @returns {*}
     */
    renewAccessToken(refresh_token: string, api_secret: string) {
        return new Promise((resolve, reject) => {
            const checksum = sha256(this.api_key + refresh_token + api_secret).toString();

            const p = this._post('api.token.renew', {
                api_key: this.api_key,
                refresh_token: refresh_token,
                checksum: checksum
            });

            p.then(function (resp: any) {
                if (resp && resp.access_token) {
                    this.setAccessToken(resp.access_token);
                }
                return resolve(resp);
            }).catch(function (err: Error) {
                return reject(err);
            });
        });
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {string} refresh_token
     * @returns {*}
     */
    invalidateRefreshToken = function (refresh_token: string) {
        return this._delete('api.token.invalidate', {
            api_key: this.api_key,
            refresh_token: refresh_token
        });
    };

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @returns {*}
     */
    getProfile() {
        return this._get('user.profile');
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {?string} [segment]
     * @returns {*}
     */
    getMargins(segment?: string) {
        if (segment) {
            return this._get('user.margins.segment', { 'segment': segment });
        } else {
            return this._get('user.margins');
        }
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {Varieties} variety
     * @param {PlaceOrderParams} params
     * @returns {*}
     */
    placeOrder(variety: Varieties, params: PlaceOrderParams) {
        params.variety = variety;
        return this._post('order.place', params);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {Varieties} variety
     * @param {(string | number)} order_id
     * @param {ModifyOrderParams} params
     * @returns {*}
     */
    modifyOrder(variety: Varieties, order_id: string | number, params: ModifyOrderParams) {
        params.variety = variety;
        params.order_id = order_id;
        return this._put('order.modify', params);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {Varieties} variety
     * @param {(string | number)} order_id
     * @param {?CancelOrderParams} [params]
     * @returns {*}
     */
    cancelOrder(variety: Varieties, order_id: string | number, params?: CancelOrderParams) {
        params = params || {};
        params.variety = variety;
        params.order_id = order_id;
        return this._delete('order.cancel', params);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {Varieties} variety
     * @param {string} order_id
     * @param {ExitOrderParams} params
     * @returns {*}
     */
    exitOrder(variety: Varieties, order_id: string, params: ExitOrderParams) {
        return this.cancelOrder(variety, order_id, params);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @returns {*}
     */
    getOrders() {
        return this._get('orders', null, null, this.formatResponse);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string | number)} order_id
     * @returns {*}
     */
    getOrderHistory(order_id: string | number) {
        return this._get('order.info', { 'order_id': order_id }, null, this.formatResponse);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @returns {*}
     */
    getTrades() {
        return this._get('trades', null, null, this.formatResponse);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string | number)} order_id
     * @returns {*}
     */
    getOrderTrades(order_id: string | number) {
        return this._get('order.trades', { 'order_id': order_id }, null, this.formatResponse);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {Order[]} orders
     * @param {*} [mode=null]
     * @returns {*}
     */
    orderMargins(orders: Order[], mode = null) {
        return this._post('order.margins', orders, null, undefined, true,
            { 'mode': mode });
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {Order[]} orders
     * @param {boolean} [consider_positions=true]
     * @param {*} [mode=null]
     * @returns {*}
     */
    orderBasketMargins(orders: Order[], consider_positions = true, mode = null) {
        return this._post('order.margins.basket', orders, null, undefined, true,
            { 'consider_positions': consider_positions, 'mode': mode });
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @returns {*}
     */
    getHoldings() {
        return this._get('portfolio.holdings');
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @returns {*}
     */
    getAuctionInstruments() {
        return this._get('portfolio.holdings.auction');
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @returns {*}
     */
    getPositions() {
        return this._get('portfolio.positions');
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {Order} params
     * @returns {*}
     */
    convertPosition(params: Order) {
        return this._put('portfolio.positions.convert', params);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {boolean} exchange
     * @returns {*}
     */
    getInstruments(exchange: boolean) {
        if (exchange) {
            return this._get('market.instruments', {
                'exchange': exchange
            }, null, this.transformInstrumentsResponse);
        } else {
            return this._get('market.instruments.all', null, null, this.transformInstrumentsResponse);
        }
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string[] | string)} instruments
     * @returns {*}
     */
    getQuote(instruments: string[] | string) {
        return this._get('market.quote', { 'i': instruments }, null, formatQuoteResponse);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string[] | string)} instruments
     * @returns {*}
     */
    getOHLC(instruments: string[] | string) {
        return this._get('market.quote.ohlc', { 'i': instruments });
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string[] | string)} instruments
     * @returns {*}
     */
    getLTP(instruments: string[] | string) {
        return this._get('market.quote.ltp', { 'i': instruments });
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string | number)} instrument_token
     * @param {string} interval
     * @param {(string | Date)} from_date
     * @param {(string | Date)} to_date
     * @param {(number | boolean)} [continuous=false]
     * @param {(number | boolean)} [oi=false]
     * @returns {*}
     */
    getHistoricalData(instrument_token: string | number, interval: string, from_date: string | Date, to_date: string | Date, continuous: number | boolean = false, oi: number | boolean = false) {
        continuous = continuous ? 1 : 0;
        oi = oi ? 1 : 0;
        if (typeof to_date === 'object') to_date = _getDateTimeString(to_date)
        if (typeof from_date === 'object') from_date = _getDateTimeString(from_date)

        return this._get('market.historical', {
            instrument_token: instrument_token,
            interval: interval,
            from: from_date,
            to: to_date,
            continuous: continuous,
            oi: oi
        }, null, this.parseHistorical);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {?(string | number)} [order_id]
     * @returns {*}
     */
    getMFOrders(order_id?: string | number) {
        if (order_id) {
            return this._get('mf.order.info', { 'order_id': order_id }, null, this.formatResponse);
        } else {
            return this._get('mf.orders', null, null, this.formatResponse);
        }
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {PlaceMFOrderParams} params
     * @returns {*}
     */
    placeMFOrder(params: PlaceMFOrderParams) {
        return this._post('mf.order.place', params);
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string | number)} order_id
     * @returns {*}
     */
    cancelMFOrder(order_id: string | number) {
        return this._delete('mf.order.cancel', { 'order_id': order_id })
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {?(string | number)} [sip_id]
     * @returns {*}
     */
    getMFSIPS(sip_id?: string | number) {
        if (sip_id) {
            return this._get('mf.sip.info', { 'sip_id': sip_id }, null, this.formatResponse);
        } else {
            return this._get('mf.sips', null, null, this.formatResponse);
        }
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {Order} params
     * @returns {*}
     */
    placeMFSIP(params: Order) {
        return this._post('mf.sip.place', params);
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string | number)} sip_id
     * @param {Order} params
     * @returns {*}
     */
    modifyMFSIP(sip_id: string | number, params: Order) {
        params.sip_id = sip_id;
        return this._put('mf.sip.modify', params);
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string | number)} sip_id
     * @returns {*}
     */
    cancelMFSIP(sip_id: string | number) {
        return this._delete('mf.sip.cancel', { 'sip_id': sip_id });
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @returns {*}
     */
    getMFHoldings() {
        return this._get('mf.holdings');
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @returns {*}
     */
    getMFInstruments() {
        return this._get('mf.instruments', null, null, transformMFInstrumentsResponse);
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @returns {*}
     */
    getGTTs() {
        return this._get('gtt.triggers', null, null, this.formatResponse);
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string | number)} trigger_id
     * @returns {*}
     */
    getGTT(trigger_id: string | number) {
        return this._get('gtt.trigger_info', { 'trigger_id': trigger_id }, null, this.formatResponse);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {Order} params
     * @returns {{ condition: { exchange: ExchangeTypes; tradingsymbol: string; trigger_values: {}; last_price: any; }; orders: {}; }}
     */
    _getGTTPayload(params: Order) {
        if (params.trigger_type !== GTTStatusTypes.GTT_TYPE_OCO && params.trigger_type !== GTTStatusTypes.GTT_TYPE_SINGLE) {
            throw new Error('Invalid `params.trigger_type`')
        }
        if (params.trigger_type === GTTStatusTypes.GTT_TYPE_OCO && params.trigger_values?.length !== 2) {
            throw new Error('Invalid `trigger_values` for `OCO` order type')
        }
        if (params.trigger_type === GTTStatusTypes.GTT_TYPE_SINGLE && params.trigger_values?.length !== 1) {
            throw new Error('Invalid `trigger_values` for `single` order type')
        }
        const condition = {
            exchange: params.exchange,
            tradingsymbol: params.tradingsymbol,
            trigger_values: params.trigger_values,
            last_price: parseFloat(params.last_price as string)
        }
        let orders = [] as any[];
        for (let o of params.orders as Order[]) {
            orders.push({
                transaction_type: o.transaction_type,
                order_type: o.order_type,
                product: o.product,
                quantity: parseInt(o.quantity as string),
                price: parseFloat(o.price as string),
                exchange: params.exchange,
                tradingsymbol: params.tradingsymbol
            })
        }
        return { condition, orders };
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {PlaceGTTParams} params
     * @returns {*}
     */
    placeGTT(params: PlaceGTTParams) {
        const payload = this._getGTTPayload(params);
        return this._post('gtt.place', {
            condition: JSON.stringify(payload.condition),
            orders: JSON.stringify(payload.orders),
            type: params.trigger_type
        });
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string | number)} trigger_id
     * @param {ModifyGTTParams} params
     * @returns {*}
     */
    modifyGTT(trigger_id: string | number, params: ModifyGTTParams) {
        const payload = this._getGTTPayload(params as Order);
        return this._put('gtt.modify', {
            trigger_id: trigger_id,
            type: params.trigger_type,
            condition: JSON.stringify(payload.condition),
            orders: JSON.stringify(payload.orders)
        });
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {(string | number)} trigger_id
     * @returns {*}
     */
    deleteGTT(trigger_id: string | number) {
        return this._delete('gtt.delete', { 'trigger_id': trigger_id }, null, undefined);
    }/**
     * 
     * @date 07/06/2023 - 21:37:48
     */
    ;

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @param {AnyObject} postback_data
     * @param {string} api_secret
     * @returns {boolean}
     */
    validatePostback(postback_data: AnyObject, api_secret: string) {
        if (!postback_data || !postback_data.checksum || !postback_data.order_id ||
            !postback_data.order_timestamp || !api_secret) {
            throw new Error('Invalid postback data or api_secret');
        }

        const inputString = postback_data.order_id + postback_data.order_timestamp + api_secret;
        let checksum;
        try {
            checksum = sha256(inputString).toString();
        } catch (e) {
            throw (e)
        }

        return postback_data.checksum === checksum;
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @private
     * @param {string} route
     * @param {?(AnyObject | null)} [params]
     * @param {?(string | null)} [responseType]
     * @param {?AxiosTransformer} [responseTransformer]
     * @param {boolean} [isJSON=false]
     * @returns {*}
     */
    private _get(route: string, params?: AnyObject | null, responseType?: string | null, responseTransformer?: AxiosTransformer, isJSON = false) {
        return this.request(route, 'GET', params || {}, responseType, responseTransformer, isJSON);
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
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
    private _post(route: string, params: AnyObject | null, responseType?: string | null, responseTransformer?: AxiosTransformer, isJSON = false, queryParams: AnyObject | null = null) {
        return this.request(route, 'POST', params || {}, responseType, responseTransformer, isJSON, queryParams);
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
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
    private _put(route: string, params: AnyObject | null, responseType?: string | null, responseTransformer?: AxiosTransformer, isJSON = false, queryParams = null) {
        return this.request(route, 'PUT', params || {}, responseType, responseTransformer, isJSON, queryParams);
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @private
     * @param {string} route
     * @param {(AnyObject | null)} params
     * @param {?(string | null)} [responseType]
     * @param {?AxiosTransformer} [responseTransformer]
     * @param {boolean} [isJSON=false]
     * @returns {*}
     */
    private _delete(route: string, params: AnyObject | null, responseType?: string | null, responseTransformer?: AxiosTransformer, isJSON = false) {
        return this.request(route, 'DELETE', params || {}, responseType, responseTransformer, isJSON);
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
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
    private request(route: string, method: Method, params: AnyObject, responseType?: string | null, responseTransformer?: AxiosTransformer, isJSON?: boolean, queryParams?: Record<string, any> | null) {
        // Check access token
        if (!responseType) responseType = 'json';
        let uri = ROUTES[route];

        // Replace variables in 'RESTful' URLs with corresponding params
        if (uri.indexOf('{') !== -1) {
            let k;
            for (k in params) {
                if (params.hasOwnProperty(k)) {
                    uri = uri.replace('{' + k + '}', params[k]);
                }
            }
        }

        let payload: null | string = null;
        if (method === 'GET' || method === 'DELETE') {
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

        const options: AxiosRequestConfig = {
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
        } else {
            options['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        // Set response transformer
        if (responseTransformer) {
            options.transformResponse = (axios.defaults.transformResponse as any).concat(responseTransformer);
        }

        return this.requestInstance.request(options);
    }


    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @private
     * @param {AnyObject} jsonData
     * @returns {AnyObject}
     */
    private parseHistorical(jsonData: AnyObject): AnyObject {
        // Return if its an error
        if (jsonData.error_type) return jsonData;
    
        const results = [] as any[];
        for (let i = 0; i < jsonData.data.candles.length; i++) {
            const d = jsonData.data.candles[i];
            const c: AnyObject = {
                'date': new Date(d[0]),
                'open': d[1],
                'high': d[2],
                'low': d[3],
                'close': d[4],
                'volume': d[5]
            }
    
            // Add OI field if its returned
            if (d[6]) {
                c['oi'] = d[6]
            }
    
            results.push(c);
        }
    
        return { 'data': results };
    }

    /**
     * 
     * @date 07/06/2023 - 21:37:48
     *
     * @private
     * @param {*} data
     * @param {AnyObject} headers
     * @returns {*}
     */
    private transformInstrumentsResponse(data: any, headers: AnyObject) {
        // Parse CSV responses
        if (headers['content-type'] === 'text/csv') {
            const parsedData = csvParse.parse(data, { 'header': true }).data;
            for (const item of parsedData as any) {
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
     * @date 07/06/2023 - 21:37:48
     *
     * @private
     * @param {AnyObject} data
     * @returns {AnyObject}
     */
    private formatResponse(data: AnyObject) {
        if (!data.data || typeof data.data !== 'object') return data;
        let list: any = [];
        if (data.data instanceof Array) {
            list = data.data;
        } else {
            list = [data.data]
        }
    
        const results: any[] = [];
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
        } else {
            data.data = results[0];
        }
    
        return data;
    }


}

/**
 * 
 * @date 07/06/2023 - 21:37:48
 *
 * @param {AnyObject} data
 * @returns {AnyObject}
 */
function formatGenerateSession(data: AnyObject) {
    if (!data.data || typeof data.data !== 'object') return data;

    if (data.data.login_time) {
        data.data.login_time = new Date(data.data.login_time);
    }

    return data;
}

/**
 * 
 * @date 07/06/2023 - 21:37:48
 *
 * @param {AnyObject} data
 * @returns {AnyObject}
 */
function formatQuoteResponse(data: AnyObject) {
    if (!data.data || typeof data.data !== 'object') return data;

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
 * @date 07/06/2023 - 21:37:48
 *
 * @param {*} data
 * @param {AnyObject} headers
 * @returns {*}
 */
function transformMFInstrumentsResponse(data: any, headers: AnyObject) {
    // Parse CSV responses
    if (headers['content-type'] === 'text/csv') {
        const parsedData = csvParse.parse(data, { 'header': true }).data;
        for (const item of parsedData as any) {
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
 * @date 07/06/2023 - 21:37:48
 *
 * @param {Date} date
 * @returns {*}
 */
function _getDateTimeString(date: Date) {
    const isoString = date.toISOString();
    return isoString.replace('T', ' ').split('.')[0];
}

export default KiteConnect;
