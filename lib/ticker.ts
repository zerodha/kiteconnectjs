import WebSocket from 'ws';
import { AnyObject, KiteTickerInterface, KiteTickerParams } from '../interfaces';
import utils from './utils';

/**
 * 
 * @date 07/06/2023 - 21:38:00
 *
 * @type {number}
 */
let read_timeout = 5, // seconds
	reconnect_max_delay = 0,
	reconnect_max_tries = 0,

	// message flags (outgoing)
	mSubscribe = 'subscribe',
	mUnSubscribe = 'unsubscribe',
	mSetMode = 'mode',

	// incoming

	// public constants
	modeFull = 'full', // Full quote including market depth. 164 bytes.
	modeQuote = 'quote', // Quote excluding market depth. 52 bytes.
	modeLTP = 'ltp';

/**
 * 
 * @date 07/06/2023 - 21:38:00
 *
 * @type {(WebSocket | null)}
 */
let ws: WebSocket | null = null,
	triggers: AnyObject = {
		'connect': [],
		'ticks': [],
		'disconnect': [],
		'error': [],
		'close': [],
		'reconnect': [],
		'noreconnect': [],
		'message': [],
		'order_update': []
	},
	read_timer: any = null,
	last_read: any = 0,
	auto_reconnect: any = false,
	current_reconnection_count = 0,
	last_reconnect_interval: any = 0,
	current_ws_url: any = null,
	defaultReconnectMaxDelay: number = 60,
	defaultReconnectMaxRetries: number = 50,
	maximumReconnectMaxRetries: number = 300,
	minimumReconnectMaxDelay: number = 5;

// segment constants
/**
 * 
 * @date 07/06/2023 - 21:38:00
 *
 * @type {1}
 */
const NseCM = 1,
	NseFO = 2,
	NseCD = 3,
	BseCM = 4,
	BseFO = 5,
	BseCD = 6,
	McxFO = 7,
	McxSX = 8,
	Indices = 9;

/**
 * The WebSocket client for connecting to Kite connect streaming quotes service.
 *
 * Getting started:
 * ---------------
 *
 * 	const KiteTicker = require('kiteconnect').KiteTicker;
 * 	const ticker = new KiteTicker({
 * 		api_key: 'api_key',
 * 		access_token: 'access_token'
 *	});
 *
 * 	ticker.connect();
 * 	ticker.on('ticks', onTicks);
 * 	ticker.on('connect', subscribe);
 *
 * 	function onTicks(ticks) {
 * 		console.log('Ticks', ticks);
 * 	}
 *
 * 	function subscribe() {
 * 		const items = [738561];
 * 		ticker.subscribe(items);
 * 		ticker.setMode(ticker.modeFull, items);
 * 	}
 *
 * Tick structure (passed to the tick callback you assign):
 * ---------------------------
 * [{ tradable: true,
 *    mode: 'full',
 *    instrument_token: 208947,
 *    last_price: 3939,
 *    last_quantity: 1,
 *    average_price: 3944.77,
 *    volume: 28940,
 *    buy_quantity: 4492,
 *    sell_quantity: 4704,
 *    ohlc: { open: 3927, high: 3955, low: 3927, close: 3906 },
 *    change: 0.8448540706605223,
 *    last_trade_time: 1515491369,
 *    timestamp: 1515491373,
 *    oi: 24355,
 *    oi_day_high: 0,
 *    oi_day_low: 0,
 *    depth:
 *			buy: [{
 *				 quantity: 59,
 *				 price: 3223,
 *				 orders: 5
 *			  },
 *			  {
 *				 quantity: 164,
 *				 price: 3222,
 *				 orders: 15
 *			  },
 *			  {
 *				 quantity: 123,
 *				 price: 3221,
 *				 orders: 7
 *			  },
 *			  {
 *				 quantity: 48,
 *				 price: 3220,
 *				 orders: 7
 *			  },
 *			  {
 *				 quantity: 33,
 *				 price: 3219,
 *				 orders: 5
 *			  }],
 *		   sell: [{
 *				 quantity: 115,
 *				 price: 3224,
 *				 orders: 15
 *			  },
 *			  {
 *				 quantity: 50,
 *				 price: 3225,
 *				 orders: 5
 *			  },
 *			  {
 *				 quantity: 175,
 *				 price: 3226,
 *				 orders: 14
 *			  },
 *			  {
 *				 quantity: 49,
 *				 price: 3227,
 *				 orders: 10
 *			  },
 *			  {
 *				 quantity: 106,
 *				 price: 3228,
 *				 orders: 13
 *			  }]
 *		}
 *	}, ...]
 *
 * Auto reconnection
 * -----------------
 * Auto reonnection is enabled by default and it can be disabled by passing `reconnect` param while initialising `KiteTicker`.
 *
 * Auto reonnection mechanism is based on [Exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) algorithm in which
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
 *
 * 	const KiteTicker = require('kiteconnect').KiteTicker;
 * 	const ticker = new KiteTicker({
 * 		api_key: 'api_key',
 * 		access_token: 'access_token'
 *	});
 *
 * 	// set autoreconnect with 10 maximum reconnections and 5 second interval
 * 	ticker.autoReconnect(true, 10, 5)
 * 	ticker.connect();
 * 	ticker.on('ticks', onTicks);
 * 	ticker.on('connect', subscribe);
 *
 * 	ticker.on('noreconnect', function() {
 * 		console.log('noreconnect');
 * 	});
 *
 * 	ticker.on('reconnect', function(reconnect_count, reconnect_interval) {
 * 		console.log('Reconnecting: attempt - ', reconnect_count, ' interval - ', reconnect_interval);
 * 	});
 * 
 *  ticker.on('message', function(binary_msg){
 *		console.log('Binary message', binary_msg);
 *  });
 *
 * 	function onTicks(ticks) {
 * 		console.log('Ticks', ticks);
 * 	}
 *
 * 	function subscribe() {
 * 		const items = [738561];
 * 		ticker.subscribe(items);
 * 		ticker.setMode(ticker.modeFull, items);
 * 	}
 *
 *
 * @constructor
 * @name KiteTicker
 * @param {Object} params
 * @param {string} params.api_key API key issued you.
 * @param {string} params.access_token Access token obtained after successful login flow.
 * @param {bool}   [params.reconnect] Enable/Disable auto reconnect. Enabled by default.
 * @param {number} [params.max_retry=50] is maximum number re-connection attempts. Defaults to 50 attempts and maximum up to 300 attempts.
 * @param {number} [params.max_delay=60] in seconds is the maximum delay after which subsequent re-connection interval will become constant. Defaults to 60s and minimum acceptable value is 5s.
 * #param {string} [params.root='wss://websocket.kite.trade/'] Kite websocket root.
 */
class KiteTicker implements KiteTickerInterface {
	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @type {string}
	 */
	modeFull: string;
	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @type {string}
	 */
	modeQuote: string;
	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @type {string}
	 */
	modeLTP: string;
	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @type {?string}
	 */
	api_key?: string;
	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @type {?string}
	 */
	access_token?: string;
	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @type {?boolean}
	 */
	reconnect?: boolean;
	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @type {?number}
	 */
	max_retry?: number;
	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @type {?number}
	 */
	max_delay?: number;
	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @type {string}
	 */
	root: string;
	/**
	 * Creates an instance of KiteTicker.
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @constructor
	 * @param {KiteTickerParams} params
	 */
	constructor(params: KiteTickerParams) {
		this.root = params.root || 'wss://ws.kite.trade/';
		// public constants
		/**
		 * @memberOf KiteTicker
		 * @desc Set mode full
		 */
		this.modeFull = modeFull;

		/**
		 * @memberOf KiteTicker
		 * @desc Set mode quote
		 */
		this.modeQuote = modeQuote;

		/**
		 * @memberOf KiteTicker
		 * @desc Set mode LTP
		 */
		this.modeLTP = modeLTP;

		if (!params.reconnect) params.reconnect = true;
		this.autoReconnect(params.reconnect, params.max_retry as number, params.max_delay as number);
	}

	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @param {boolean} t
	 * @param {number} max_retry
	 * @param {number} max_delay
	 */
	autoReconnect(t: boolean, max_retry: number, max_delay: number) {
		auto_reconnect = (t == true);

		// Set default values
		max_retry = max_retry || defaultReconnectMaxRetries;
		max_delay = max_delay || defaultReconnectMaxDelay;

		// Set reconnect constraints
		reconnect_max_tries = max_retry >= maximumReconnectMaxRetries ? maximumReconnectMaxRetries : max_retry;
		reconnect_max_delay = max_delay <= minimumReconnectMaxDelay ? minimumReconnectMaxDelay : max_delay;
	}/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 */
	;

	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 */
	connect() {
		// Skip if its already connected
		if (!ws) return;
		if (ws.readyState == ws.CONNECTING || ws.readyState == ws.OPEN) return;

		const url = this.root + '?api_key=' + this.api_key +
			'&access_token=' + this.access_token + '&uid=' + (new Date().getTime().toString());

		ws = new WebSocket(url, {
			headers: {
				'X-Kite-Version': '3',
				'User-Agent': utils.getUserAgent()
			}
		});

		ws.binaryType = 'arraybuffer';

		ws.onopen = function () {
			// Reset last reconnect interval
			last_reconnect_interval = null;
			// Reset current_reconnection_count attempt
			current_reconnection_count = 0
			// Store current open connection url to check for auto re-connection.
			if (!current_ws_url) current_ws_url = this.url;
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
					current_ws_url = null;
					if (ws) ws.close();
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
					if (d) trigger('ticks', [d]);
				}
			} else {
				parseTextMessage(e.data)
			}

			// Set last read time to check for connection timeout
			last_read = new Date();
		};

		ws.onerror = function (e) {
			trigger('error', [e]);

			// Force close to avoid ghost connections
			if (this && this.readyState == this.OPEN) this.close();
		};

		ws.onclose = function (e) {
			trigger('close', [e]);

			// the ws id doesn't match the current global id,
			// meaning it's a ghost close event. just ignore.
			if (current_ws_url && (this.url != current_ws_url)) return;

			this.triggerDisconnect(e);
		};
	}/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 */
	;

	/**
	 * 
	 * @date 07/06/2023 - 21:38:00
	 */
	attemptReconnection() {
		// Try reconnecting only so many times.
		if (current_reconnection_count > reconnect_max_tries) {
			trigger('noreconnect');
			process.exit(1);
		}

		if (current_reconnection_count > 0) {
			last_reconnect_interval = Math.pow(2, current_reconnection_count);
		} else if (!last_reconnect_interval) {
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
	 * 
	 * @date 07/06/2023 - 21:38:00
	 *
	 * @param {?WebSocket.CloseEvent} [e]
	 */
	triggerDisconnect(e?: WebSocket.CloseEvent) {
		ws = null;
		trigger('disconnect', [e]);
		if (auto_reconnect) this.attemptReconnection();
	}

	/**
	 * 
	 * @date 07/06/2023 - 21:37:59
	 *
	 * @returns {boolean}
	 */
	connected() {
		return (ws && ws.readyState == ws.OPEN);
	}

	/**
	 * 
	 * @date 07/06/2023 - 21:37:59
	 *
	 * @param {string} e
	 * @param {Function} callback
	 */
	on(e: string, callback: Function) {
		if (triggers.hasOwnProperty(e)) {
			(triggers as AnyObject)[e].push(callback);
		}
	}/**
	 * 
	 * @date 07/06/2023 - 21:37:59
	 */
	;

	/**
	 * 
	 * @date 07/06/2023 - 21:37:59
	 *
	 * @param {(string[] | number[])} tokens
	 * @returns {{}}
	 */
	subscribe(tokens: string[] | number[]) {
		if (tokens.length > 0) {
			send({ 'a': mSubscribe, 'v': tokens });
		}
		return tokens;
	}/**
	 * 
	 * @date 07/06/2023 - 21:37:59
	 */
	;

	/**
	 * 
	 * @date 07/06/2023 - 21:37:59
	 *
	 * @param {(string[] | number[])} tokens
	 * @returns {{}}
	 */
	unsubscribe(tokens: string[] | number[]) {
		if (tokens.length > 0) {
			send({ 'a': mUnSubscribe, 'v': tokens });
		}
		return tokens;
	}/**
	 * 
	 * @date 07/06/2023 - 21:37:59
	 */
	;

	/**
	 * 
	 * @date 07/06/2023 - 21:37:59
	 *
	 * @param {string} mode
	 * @param {(string[] | number[])} tokens
	 * @returns {{}}
	 */
	setMode(mode: string, tokens: string[] | number[]) {
		if (tokens.length > 0) {
			send({ 'a': mSetMode, 'v': [mode, tokens] });
		}
		return tokens;
	}/**
	 * 
	 * @date 07/06/2023 - 21:37:59
	 */
	;

	/**
	 * 
	 * @date 07/06/2023 - 21:37:59
	 *
	 * @param {ArrayBuffer} binpacks
	 * @returns {{}}
	 */
	parseBinary(binpacks: ArrayBuffer) {
		return parseBinary(binpacks);
	}


}


// send a message via the socket
// automatically encodes json if possible
/**
 * 
 * @date 07/06/2023 - 21:37:59
 *
 * @param {(AnyObject | string)} message
 */
function send(message: AnyObject | string) {
	if (!ws || ws.readyState != ws.OPEN) return;

	try {
		if (typeof (message) == 'object') {
			message = JSON.stringify(message);
		}
		ws.send(message);
	} catch (e) { ws.close(); };
}

// trigger event callbacks
/**
 * 
 * @date 07/06/2023 - 21:37:59
 *
 * @param {string} e
 * @param {?any[]} [args]
 */
function trigger(e: string, args?: any[]) {
	if (!triggers[e]) return
	for (let n = 0; n < triggers[e].length; n++) {
		triggers[e][n].apply(triggers[e][n], args ? args : []);
	}
}

/**
 * 
 * @date 07/06/2023 - 21:37:59
 *
 * @param {(string | AnyObject)} data
 */
function parseTextMessage(data: string | AnyObject) {
	try {
		data = JSON.parse(data as string)
	} catch (e) {
		return
	}

	if ((data as AnyObject).type === 'order') {
		trigger('order_update', [(data as AnyObject).data]);
	}
}

// parse received binary message. each message is a combination of multiple tick packets
// [2-bytes num packets][size1][tick1][size2][tick2] ...
/**
 * 
 * @date 07/06/2023 - 21:37:59
 *
 * @param {ArrayBuffer} binpacks
 * @returns {{}}
 */
function parseBinary(binpacks: ArrayBuffer) {
	const packets = splitPackets(binpacks),
		ticks: any[] = [];

	for (let n = 0; n < packets.length; n++) {
		const bin: any = packets[n],
			instrument_token = buf2long(bin.slice(0, 4)),
			segment = instrument_token & 0xff;

		let tradable = true;
		if (segment === Indices) tradable = false;

		// Add price divisor based on segment
		let divisor = 100.0;
		if (segment === NseCD) {
			divisor = 10000000.0;

		} else if (segment == BseCD) {
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
		} else if (bin.byteLength === 28 || bin.byteLength === 32) {
			let mode = modeQuote;
			if (bin.byteLength === 32) mode = modeFull;

			const tick: AnyObject = {
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
				if (timestamp) tick.exchange_timestamp = new Date(timestamp * 1000);
			}

			ticks.push(tick);
		} else if (bin.byteLength === 44 || bin.byteLength === 184) {
			let mode = modeQuote;
			if (bin.byteLength === 184) mode = modeFull;

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
				}
			} as AnyObject;

			// Compute the change price using close price and last price
			if (tick.ohlc.close != 0) {
				tick.change = (tick.last_price - tick.ohlc.close) * 100 / tick.ohlc.close;
			}

			// Parse full mode
			if (bin.byteLength === 184) {
				// Parse last trade time
				tick.last_trade_time = null;
				const last_trade_time = buf2long(bin.slice(44, 48));
				if (last_trade_time) tick.last_trade_time = new Date(last_trade_time * 1000);

				// Parse timestamp
				tick.exchange_timestamp = null;
				const timestamp = buf2long(bin.slice(60, 64));
				if (timestamp) tick.exchange_timestamp = new Date(timestamp * 1000);

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
 * 
 * @date 07/06/2023 - 21:37:59
 *
 * @param {ArrayBuffer} bin
 * @returns {{}}
 */
function splitPackets(bin: ArrayBuffer) {
	// number of packets
	let num = buf2long(bin.slice(0, 2)),
		j = 2,
		packets: any[] = [];

	for (let i = 0; i < num; i++) {
		// first two bytes is the packet length
		const size = buf2long(bin.slice(j, j + 2)),
			packet = bin.slice(j + 2, j + 2 + size);

		packets.push(packet);

		j += 2 + size;
	}

	return packets;
}

// Big endian byte array to long.
/**
 * 
 * @date 07/06/2023 - 21:37:59
 *
 * @param {ArrayBuffer} buf
 * @returns {number}
 */
function buf2long(buf: ArrayBuffer) {
	let b = new Uint8Array(buf),
		val = 0,
		len = b.length;

	for (let i = 0, j = len - 1; i < len; i++, j--) {
		val += b[j] << (i * 8);
	}

	return val;
}

export default KiteTicker;
