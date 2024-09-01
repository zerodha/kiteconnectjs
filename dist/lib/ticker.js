"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KiteTicker = void 0;
const ws_1 = __importDefault(require("ws"));
const utils_1 = __importDefault(require("./utils"));
/**
 * Read timeout duration in seconds. Default: 5 seconds.
 * @type {number}
 */
let read_timeout = 5;
/**
 * Maximum delay for reconnection attempts. Default: 0 (no delay).
 * @type {number}
 */
let reconnect_max_delay = 0;
/**
 * Maximum number of reconnection attempts. Default: 0 (no retries).
 * @type {number}
 */
let reconnect_max_tries = 0;
/**
 * Outgoing message flags.
 * @type {string}
 */
let mSubscribe = 'subscribe', mUnSubscribe = 'unsubscribe', mSetMode = 'mode';
/**
 * Public constants.
 * @type {string}
 */
const modeFull = 'full', modeQuote = 'quote', modeLTP = 'ltp';
/**
 * WebSocket connection instance.
 * @type {(WebSocket | null)}
 */
let ws = null;
/**
 * Event triggers and their associated callbacks.
 * @type {Object}
 */
let triggers = {
    'connect': [],
    'ticks': [],
    'disconnect': [],
    'error': [],
    'close': [],
    'reconnect': [],
    'noreconnect': [],
    'message': [],
    'order_update': []
};
/**
 * Timer for reading data.
 * @type {any}
 */
let read_timer = null;
/**
 * Timestamp of the last read operation.
 * @type {any}
 */
let last_read = 0;
/**
 * Flag indicating whether auto-reconnect is enabled.
 * @type {boolean}
 */
let auto_reconnect = false;
/**
 * Flag to control reconnection behavior.
 * @type {boolean}
 */
let should_reconnect = true;
/**
 * Current count of reconnection attempts.
 * @type {number}
 */
let current_reconnection_count = 0;
/**
 * Last interval used for reconnecting.
 * @type {any}
 */
let last_reconnect_interval = 0;
/**
 * Current WebSocket URL in use.
 * @type {string}
 */
let current_ws_url = '';
/**
 * Default maximum delay for reconnection attempts in seconds.
 * @type {number}
 */
const defaultReconnectMaxDelay = 60;
/**
 * Default maximum number of reconnection attempts.
 * @type {number}
 */
const defaultReconnectMaxRetries = 50;
/**
 * Maximum allowed value for the number of reconnection attempts.
 * @type {number}
 */
const maximumReconnectMaxRetries = 300;
/**
 * Minimum allowed value for the maximum delay for reconnection attempts in seconds.
 * @type {number}
 */
const minimumReconnectMaxDelay = 5;
// segment constants
/**
 * Constants representing different market segments.
 * @type {number}
 */
const NseCM = 1, NseFO = 2, NseCD = 3, BseCM = 4, BseFO = 5, BseCD = 6, McxFO = 7, McxSX = 8, Indices = 9;
/**
 * @classdesc
 * Ticker client class. The WebSocket client for connecting to Kite connect streaming quotes service.
 *
 * Getting started:
 * ---------------------------
 *
 * ~~~~
 * import { KiteTicker } from "kiteconnect";
 *
 * const apiKey = 'your_api_key';
 * const accessToken = 'generated_access_token';
 *
 * const ticker = new KiteTicker({
 *     api_key: apiKey,
 *     access_token: accessToken
 * });
 *
 * ticker.connect();
 * ticker.on('ticks', onTicks);
 * ticker.on('connect', subscribe);
 * ticker.on('disconnect', onDisconnect);
 * ticker.on('error', onError);
 * ticker.on('close', onClose);
 * ticker.on('order_update', onTrade);
 *
 * function onTicks(ticks: any[]): void {
 *     console.log("Ticks", ticks);
 * }
 *
 * function subscribe(): void {
 *     const tokens = [738561, 256265];
 *     ticker.subscribe(tokens);
 *     ticker.setMode(ticker.modeFull, tokens);
 * }
 *
 * function onDisconnect(error: Error): void {
 *     console.log("Closed connection on disconnect", error);
 * }
 *
 * function onError(error: Error): void {
 *     console.log("Closed connection on error", error);
 * }
 *
 * function onClose(reason: string): void {
 *     console.log("Closed connection on close", reason);
 * }
 *
 * function onTrade(order: any): void {
 *     console.log("Order update", order);
 * }
 * ~~~~
 *
 * -------------
 * ~~~~
 * [{
 *     tradable: true,
 *     mode: 'full',
 *     instrument_token: 738561,
 *     last_price: 2940.7,
 *     last_traded_quantity: 1,
 *     average_traded_price: 2933.55,
 *     volume_traded: 2827705,
 *     total_buy_quantity: 213779,
 *     total_sell_quantity: 425119,
 *     ohlc: { open: 2915, high: 2949, low: 2910.35, close: 2913.35 },
 *     change: 0.9387818147493404,
 *     last_trade_time: 2024-06-12T07:16:09.000Z,
 *     exchange_timestamp: 2024-06-12T07:16:09.000Z,
 *     oi: 0,
 *     oi_day_high: 0,
 *     oi_day_low: 0,
 *     depth: { buy: [Array], sell: [Array] }
 *   },
 *   {
 *     tradable: false,
 *     mode: 'full',
 *     instrument_token: 256265,
 *     last_price: 23406.85,
 *     ohlc: { high: 23441.95, low: 23295.95, open: 23344.45, close: 23264.85 },
 *     change: 0.6103628435171514,
 *     exchange_timestamp: 2024-06-12T07:16:09.000Z
 *   }
 * ]
 * ~~~~
 *
 * Auto reconnection is enabled by default and it can be disabled by passing `reconnect` param while initialising `KiteTicker`. Auto reonnection mechanism is based on [Exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) algorithm in which
 * next retry interval will be increased exponentially. `max_delay` and `max_tries` params can be used to tweak
 * the alogrithm where `max_delay` is the maximum delay after which subsequent reconnection interval will become constant and
 * `max_tries` is maximum number of retries before it quits reconnection.
 * For example if `max_delay` is 60 seconds and `max_tries` is 50 then the first reconnection interval starts from
 * minimum interval which is 2 seconds and keep increasing up to 60 seconds after which it becomes constant and when reconnection attempt
 * is reached upto 50 then it stops reconnecting.
 * Callback `reconnect` will be called with current reconnect attempt and next reconnect interval and
 * `on_noreconnect` is called when reconnection attempts reaches max retries.
 *
 * Here is an example demonstrating auto reconnection.
 * -------------
 * ~~~~
 * import { KiteTicker } from "kiteconnect";
 *
 * const apiKey = 'your_api_key';
 * const accessToken = 'generated_access_token';
 * const ticker = new KiteTicker({
 *     api_key: 'api_key',
 *     access_token: 'access_token'
 * })
 * ticker.autoReconnect(true, 10, 5);
 * ticker.connect();
 * ticker.on('ticks', onTicks);
 * ticker.on('connect', subscribe);
 * ticker.on('noreconnect', () => {
 *     console.log('noreconnect')
 * })
 * ticker.on('reconnect', (reconnect_count:any, reconnect_interval:any) => {
 *     console.log('Reconnecting: attempt - ', reconnect_count, ' interval - ', reconnect_interval)
 * })
 *
 * function onTicks(ticks: any[]) {
 *     console.log('Ticks', ticks)
 * }
 *
 * function subscribe() {
 *     const items = [738561]
 *     ticker.subscribe(items)
 *     ticker.setMode(ticker.modeFull, items)
 * }
 * ~~~~
 *
 * @constructor
 * @name KiteTicker
 * @param {Object} params
 * @param {string} params.api_key API key issued you.
 * @param {string} params.access_token Access token obtained after successful login flow.
 * @param {bool}   [params.reconnect] Enable/Disable auto reconnect. Enabled by default.
 * @param {number} [params.max_retry=50] is maximum number re-connection attempts. Defaults to 50 attempts and maximum up to 300 attempts.
 * @param {number} [params.max_delay=60] in seconds is the maximum delay after which subsequent re-connection interval will become constant. Defaults to 60s and minimum acceptable value is 5s.
 * @param {string} [params.root='wss://websocket.kite.trade/'] Kite websocket root.
 */
class KiteTicker {
    /**
     * Creates an instance of KiteTicker.
     *
     * @constructor
     * @param {KiteTickerParams} params
     */
    constructor(params) {
        this.root = params.root || 'wss://ws.kite.trade/';
        this.api_key = params.api_key;
        this.access_token = params.access_token;
        this.modeFull = modeFull;
        this.modeQuote = modeQuote;
        this.modeLTP = modeLTP;
        // Set reconnect to true for undefined
        if (params.reconnect === undefined) {
            params.reconnect = true;
        }
        this.autoReconnect(params.reconnect, params.max_retry, params.max_delay);
    }
    /**
     * @param  {bool} t
     * @param  {number} [max_retry=50]
     * @param  {number} [max_delay=60]
     */
    autoReconnect(t, max_retry, max_delay) {
        auto_reconnect = t;
        // Set default values
        max_retry = max_retry || defaultReconnectMaxRetries;
        max_delay = max_delay || defaultReconnectMaxDelay;
        // Set reconnect constraints
        reconnect_max_tries = max_retry >= maximumReconnectMaxRetries ? maximumReconnectMaxRetries : max_retry;
        reconnect_max_delay = max_delay <= minimumReconnectMaxDelay ? minimumReconnectMaxDelay : max_delay;
    }
    /**
     * Establishes a WebSocket connection to the server.
     *
     * This method creates a WebSocket connection using the provided credentials and options.
     * If a connection is already established or in the process of being established, this method does nothing.
     *
     * @returns {void}
     */
    connect() {
        // Skip if its already connected
        if (ws && (ws.readyState === ws.CONNECTING || ws.readyState === ws.OPEN))
            return;
        const url = this.root + '?api_key=' + this.api_key +
            '&access_token=' + this.access_token + '&uid=' + (new Date().getTime().toString());
        ws = new ws_1.default(url, {
            headers: {
                'X-Kite-Version': '3',
                'User-Agent': utils_1.default.getUserAgent()
            }
        });
        // Set binaryType to arraybuffer
        ws.binaryType = 'arraybuffer';
        ws.onopen = () => {
            // Reset last reconnect interval
            last_reconnect_interval = null;
            // Reset current_reconnection_count attempt
            current_reconnection_count = 0;
            // Store current open connection url to check for auto re-connection.
            if (!current_ws_url)
                current_ws_url = url;
            // Trigger on connect event
            trigger('connect');
            // If there isn't an incoming message in n seconds, assume disconnection.
            clearInterval(read_timer);
            last_read = new Date();
            read_timer = setInterval(() => {
                // @ts-ignore
                if ((new Date() - last_read) / 1000 >= read_timeout) {
                    // reset current_ws_url incase current connection times out
                    // This is determined when last heart beat received time interval
                    // exceeds read_timeout value
                    current_ws_url = '';
                    if (ws)
                        ws.close();
                    clearInterval(read_timer);
                    this.triggerDisconnect();
                }
            }, read_timeout * 1000);
        };
        ws.onmessage = function (e) {
            // Binary tick data.
            if (e.data instanceof ArrayBuffer) {
                // Trigger on message event when binary message is received
                trigger('message', [e.data]);
                if (e.data.byteLength > 2) {
                    const d = parseBinary(e.data);
                    if (d)
                        trigger('ticks', [d]);
                }
            }
            else {
                parseTextMessage(e.data);
            }
            // Set last read time to check for connection timeout
            last_read = new Date();
        };
        ws.onerror = function (e) {
            trigger('error', [e]);
            // Force close to avoid ghost connections
            if (this && this.readyState == this.OPEN)
                this.close();
        };
        ws.onclose = (e) => {
            trigger('close', [e]);
            // the ws id doesn't match the current global id,
            // meaning it's a ghost close event. just ignore.
            if (current_ws_url && (url != current_ws_url))
                return;
            this.triggerDisconnect(e);
        };
    }
    attemptReconnection() {
        // Try reconnecting only so many times.
        // Or if reconnection is not allowed
        if ((current_reconnection_count > reconnect_max_tries) || !should_reconnect) {
            trigger('noreconnect');
            process.exit(1);
        }
        if (current_reconnection_count > 0) {
            last_reconnect_interval = Math.pow(2, current_reconnection_count);
        }
        else if (!last_reconnect_interval) {
            last_reconnect_interval = 1;
        }
        if (last_reconnect_interval > reconnect_max_delay) {
            last_reconnect_interval = reconnect_max_delay;
        }
        current_reconnection_count++;
        trigger('reconnect', [current_reconnection_count, last_reconnect_interval]);
        setTimeout(() => {
            this.connect();
        }, last_reconnect_interval * 1000);
    }
    /**
     * @param {?WebSocket.CloseEvent} [e]
     * @returns {void}
     */
    triggerDisconnect(e) {
        ws = null;
        trigger('disconnect', [e]);
        if (auto_reconnect)
            this.attemptReconnection();
    }
    /**
     * This method closes the WebSocket connection if it is currently open.
     * It checks the readyState to ensure that the connection is not
     * already in the process of closing or closed.
     */
    disconnect() {
        if (ws && ws.readyState !== ws_1.default.CLOSING && ws.readyState !== ws_1.default.CLOSED) {
            // Stop reconnection mechanism
            should_reconnect = false;
            // Close and clear the ws object
            ws.close();
            ws = null;
        }
    }
    /**
     * Checks if the WebSocket connection is currently open.
     *
     * This method returns a boolean value indicating whether a WebSocket connection is currently open.
     *
     * @returns {boolean} A boolean value indicating whether the WebSocket connection is open.
     */
    connected() {
        return (ws !== null && ws.readyState === ws.OPEN);
    }
    /**
     *
     * @param {string} e
     * @param {Function} callback
     */
    on(e, callback) {
        if (triggers.hasOwnProperty(e)) {
            triggers[e].push(callback);
        }
    }
    ;
    /**
     *
     * @param {(string[] | number[])} tokens
     * @returns {{}}
     */
    subscribe(tokens) {
        if (tokens.length > 0) {
            send({ 'a': mSubscribe, 'v': tokens });
        }
        return tokens;
    }
    ;
    /**
     *
     * @param {(string[] | number[])} tokens
     * @returns {{}}
     */
    unsubscribe(tokens) {
        if (tokens.length > 0) {
            send({ 'a': mUnSubscribe, 'v': tokens });
        }
        return tokens;
    }
    ;
    /**
     *
     * @param {string} mode
     * @param {(string[] | number[])} tokens
     * @returns {{}}
     */
    setMode(mode, tokens) {
        if (tokens.length > 0) {
            send({ 'a': mSetMode, 'v': [mode, tokens] });
        }
        return tokens;
    }
    ;
    /**
     *
     *
     * @param {ArrayBuffer} binpacks
     * @returns {{}}
     */
    parseBinary(binpacks) {
        return parseBinary(binpacks);
    }
}
exports.KiteTicker = KiteTicker;
// send a message via the socket
// automatically encodes json if possible
/**
 * @param {(AnyObject | string)} message
 */
function send(message) {
    if (!ws || ws.readyState != ws.OPEN)
        return;
    try {
        if (typeof (message) == 'object') {
            message = JSON.stringify(message);
        }
        ws.send(message);
    }
    catch (e) {
        ws.close();
    }
    ;
}
// trigger event callbacks
/**
 * @param {string} e
 * @param {?any[]} [args]
 * @returns {void}
 */
function trigger(e, args) {
    if (!triggers[e])
        return;
    for (let n = 0; n < triggers[e].length; n++) {
        triggers[e][n].apply(triggers[e][n], args ? args : []);
    }
}
/**
 * @param {(string | AnyObject)} data
 */
function parseTextMessage(data) {
    try {
        data = JSON.parse(data);
    }
    catch (e) {
        return;
    }
    if (data.type === 'order') {
        trigger('order_update', [data.data]);
    }
}
// parse received binary message. each message is a combination of multiple tick packets
// [2-bytes num packets][size1][tick1][size2][tick2] ...
/**
 * @param {ArrayBuffer} binpacks
 * @returns {Tick[]}
 */
function parseBinary(binpacks) {
    const packets = splitPackets(binpacks), ticks = [];
    for (let n = 0; n < packets.length; n++) {
        const bin = packets[n], instrument_token = buf2long(bin.slice(0, 4)), segment = instrument_token & 0xff;
        let tradable = true;
        if (segment === Indices)
            tradable = false;
        // Add price divisor based on segment
        let divisor = 100.0;
        if (segment === NseCD) {
            divisor = 10000000.0;
        }
        else if (segment == BseCD) {
            divisor = 10000.0;
        }
        // Parse LTP
        if (bin.byteLength === 8) {
            ticks.push({
                tradable: tradable,
                mode: modeLTP,
                instrument_token,
                last_price: buf2long(bin.slice(4, 8)) / divisor
            });
            // Parse indices quote and full mode
        }
        else if (bin.byteLength === 28 || bin.byteLength === 32) {
            let mode = modeQuote;
            if (bin.byteLength === 32)
                mode = modeFull;
            const tick = {
                tradable,
                mode,
                instrument_token,
                last_price: buf2long(bin.slice(4, 8)) / divisor,
                ohlc: {
                    high: buf2long(bin.slice(8, 12)) / divisor,
                    low: buf2long(bin.slice(12, 16)) / divisor,
                    open: buf2long(bin.slice(16, 20)) / divisor,
                    close: buf2long(bin.slice(20, 24)) / divisor
                },
                change: buf2long(bin.slice(24, 28))
            };
            // Compute the change price using close price and last price
            if (tick.ohlc.close != 0) {
                tick.change = (tick.last_price - tick.ohlc.close) * 100 / tick.ohlc.close;
            }
            // Full mode with timestamp in seconds
            if (bin.byteLength === 32) {
                tick.exchange_timestamp = null;
                const timestamp = buf2long(bin.slice(28, 32));
                if (timestamp)
                    tick.exchange_timestamp = new Date(timestamp * 1000);
            }
            ticks.push(tick);
        }
        else if (bin.byteLength === 44 || bin.byteLength === 184) {
            let mode = modeQuote;
            if (bin.byteLength === 184)
                mode = modeFull;
            const tick = {
                tradable,
                mode,
                instrument_token,
                last_price: buf2long(bin.slice(4, 8)) / divisor,
                last_traded_quantity: buf2long(bin.slice(8, 12)),
                average_traded_price: buf2long(bin.slice(12, 16)) / divisor,
                volume_traded: buf2long(bin.slice(16, 20)),
                total_buy_quantity: buf2long(bin.slice(20, 24)),
                total_sell_quantity: buf2long(bin.slice(24, 28)),
                ohlc: {
                    open: buf2long(bin.slice(28, 32)) / divisor,
                    high: buf2long(bin.slice(32, 36)) / divisor,
                    low: buf2long(bin.slice(36, 40)) / divisor,
                    close: buf2long(bin.slice(40, 44)) / divisor
                },
                // To be computed later
                change: 0
            };
            // Compute the change price using close price and last price
            if (tick.ohlc.close != 0) {
                tick.change = (tick.last_price - tick.ohlc.close) * 100 / tick.ohlc.close;
            }
            // Parse full mode
            if (bin.byteLength === 184) {
                // Parse last trade time
                tick.last_trade_time = null;
                const last_trade_time = buf2long(bin.slice(44, 48));
                if (last_trade_time)
                    tick.last_trade_time = new Date(last_trade_time * 1000);
                // Parse timestamp
                tick.exchange_timestamp = null;
                const timestamp = buf2long(bin.slice(60, 64));
                if (timestamp)
                    tick.exchange_timestamp = new Date(timestamp * 1000);
                // Parse OI
                tick.oi = buf2long(bin.slice(48, 52));
                tick.oi_day_high = buf2long(bin.slice(52, 56));
                tick.oi_day_low = buf2long(bin.slice(56, 60));
                tick.depth = {
                    buy: [],
                    sell: []
                };
                let s = 0, depth = bin.slice(64, 184);
                for (let i = 0; i < 10; i++) {
                    s = i * 12;
                    tick.depth[i < 5 ? 'buy' : 'sell'].push({
                        quantity: buf2long(depth.slice(s, s + 4)),
                        price: buf2long(depth.slice(s + 4, s + 8)) / divisor,
                        orders: buf2long(depth.slice(s + 8, s + 10))
                    });
                }
            }
            ticks.push(tick);
        }
    }
    return ticks;
}
// split one long binary message into individual tick packets
/**
 * @param {ArrayBuffer} bin
 * @returns {{}}
 */
function splitPackets(bin) {
    // number of packets
    let num = buf2long(bin.slice(0, 2)), j = 2, packets = [];
    for (let i = 0; i < num; i++) {
        // first two bytes is the packet length
        const size = buf2long(bin.slice(j, j + 2)), packet = bin.slice(j + 2, j + 2 + size);
        packets.push(packet);
        j += 2 + size;
    }
    return packets;
}
// Big endian byte array to long.
/**
 * @param {ArrayBuffer} buf
 * @returns {number}
 */
function buf2long(buf) {
    let b = new Uint8Array(buf), val = 0, len = b.length;
    for (let i = 0, j = len - 1; i < len; i++, j--) {
        val += b[j] << (i * 8);
    }
    return val;
}
