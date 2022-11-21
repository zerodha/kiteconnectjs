var WebSocket = require("ws");
var utils = require("./utils");

/**
 * The WebSocket client for connecting to Kite connect streaming quotes service.
 *
 * Getting started:
 * ---------------
 *
 * 	var KiteTicker = require("kiteconnect").KiteTicker;
 * 	var ticker = new KiteTicker({
 * 		api_key: "api_key",
 * 		access_token: "access_token"
 *	});
 *
 * 	ticker.connect();
 * 	ticker.on("ticks", onTicks);
 * 	ticker.on("connect", subscribe);
 *
 * 	function onTicks(ticks) {
 * 		console.log("Ticks", ticks);
 * 	}
 *
 * 	function subscribe() {
 * 		var items = [738561];
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
 * 	var KiteTicker = require("kiteconnect").KiteTicker;
 * 	var ticker = new KiteTicker({
 * 		api_key: "api_key",
 * 		access_token: "access_token"
 *	});
 *
 * 	// set autoreconnect with 10 maximum reconnections and 5 second interval
 * 	ticker.autoReconnect(true, 10, 5)
 * 	ticker.connect();
 * 	ticker.on("ticks", onTicks);
 * 	ticker.on("connect", subscribe);
 *
 * 	ticker.on("noreconnect", function() {
 * 		console.log("noreconnect");
 * 	});
 *
 * 	ticker.on("reconnect", function(reconnect_count, reconnect_interval) {
 * 		console.log("Reconnecting: attempt - ", reconnect_count, " interval - ", reconnect_interval);
 * 	});
 * 
 *  ticker.on("message", function(binary_msg){
 *		console.log("Binary message", binary_msg);
 *  });
 *
 * 	function onTicks(ticks) {
 * 		console.log("Ticks", ticks);
 * 	}
 *
 * 	function subscribe() {
 * 		var items = [738561];
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
 * #param {string} [params.root="wss://websocket.kite.trade/"] Kite websocket root.
 */
var KiteTicker = function(params) {
	var root = params.root || "wss://ws.kite.trade/";

	var read_timeout = 5, // seconds
		reconnect_max_delay = 0,
		reconnect_max_tries = 0,

		// message flags (outgoing)
		mSubscribe = "subscribe",
		mUnSubscribe = "unsubscribe",
		mSetMode = "mode",

		// incoming
		mAlert = 10,
		mMessage = 11,
		mLogout = 12,
		mReload = 13,
		mClearCache = 14,

		// public constants
		modeFull  = "full", // Full quote including market depth. 164 bytes.
		modeQuote = "quote", // Quote excluding market depth. 52 bytes.
		modeLTP   = "ltp";

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

	var ws = null,
		triggers = {"connect": [],
					"ticks": [],
					"disconnect": [],
					"error": [],
					"close": [],
					"reconnect": [],
					"noreconnect": [],
					"message": [],
					"order_update": []},
		read_timer = null,
		last_read = 0,
		reconnect_timer = null,
		auto_reconnect = false,
		current_reconnection_count = 0,
		last_reconnect_interval = 0,
		current_ws_url = null,
		defaultReconnectMaxDelay = 60,
		defaultReconnectMaxRetries = 50,
		maximumReconnectMaxRetries = 300,
		minimumReconnectMaxDelay = 5;

	// segment constants
	var NseCM = 1,
		NseFO = 2,
		NseCD = 3,
		BseCM = 4,
		BseFO = 5,
		BseCD = 6,
		McxFO = 7,
		McxSX = 8,
		Indices = 9;


	// Enable auto reconnect by default
	if (!params.reconnect) params.reconnect = true;
	autoReconnect(params.reconnect, params.max_retry, params.max_delay);

	/**
	 * Auto reconnect settings
	 * @param  {bool} Enable or disable auto disconnect, defaults to false
	 * @param  {number} [max_retry=50] is maximum number re-connection attempts. Defaults to 50 attempts and maximum up to 300 attempts.
	 * @param  {number} [max_delay=60] in seconds is the maximum delay after which subsequent re-connection interval will become constant. Defaults to 60s and minimum acceptable value is 5s.
	 * @memberOf KiteTicker
	 * @method autoReconnect
	 */
	this.autoReconnect = function(t, max_retry, max_delay) {
		autoReconnect(t, max_retry, max_delay)
	};

	/**
	 * Initiate a websocket connection
	 * @memberOf KiteTicker
	 * @method connect
	 * @instance
	 */
	this.connect = function() {
		// Skip if its already connected
		if(ws && (ws.readyState == ws.CONNECTING || ws.readyState == ws.OPEN)) return;

		var url = root + "?api_key=" + params.api_key +
					"&access_token=" + params.access_token + "&uid=" + (new Date().getTime().toString());

		ws = new WebSocket(url, {
			headers: {
				"X-Kite-Version": "3",
				"User-Agent": utils.getUserAgent()
			}
		});

		ws.binaryType = "arraybuffer";

		ws.onopen = function() {
			// Reset last reconnect interval
			last_reconnect_interval = null;
			// Reset current_reconnection_count attempt
			current_reconnection_count = 0
			// Store current open connection url to check for auto re-connection.
			if (!current_ws_url) current_ws_url = this.url
			// Trigger on connect event
			trigger("connect");
			// If there isn't an incoming message in n seconds, assume disconnection.
			clearInterval(read_timer);

			last_read = new Date();
			read_timer = setInterval(function() {
				if((new Date() - last_read ) / 1000 >= read_timeout) {
					// reset current_ws_url incase current connection times out
					// This is determined when last heart beat received time interval
					// exceeds read_timeout value
					current_ws_url = null;
					if(ws) ws.close();
					clearInterval(read_timer);
					triggerDisconnect();
				}
			}, read_timeout * 1000);
		};

		ws.onmessage = function(e) {
			// Binary tick data.
			if(e.data instanceof ArrayBuffer) {
				// Trigger on message event when binary message is received
				trigger("message", [e.data]);
				if(e.data.byteLength > 2) {
					var d = parseBinary(e.data);
					if(d) trigger("ticks", [d]);
				}
			} else {
				parseTextMessage(e.data)
			}

			// Set last read time to check for connection timeout
			last_read = new Date();
		};

		ws.onerror = function(e) {
			trigger("error", [e]);

			// Force close to avoid ghost connections
			if(this && this.readyState == this.OPEN) this.close();
		};

		ws.onclose = function(e) {
			trigger("close", [e]);

			// the ws id doesn't match the current global id,
			// meaning it's a ghost close event. just ignore.
			if(current_ws_url && (this.url != current_ws_url)) return;

			triggerDisconnect(e);
		};
	};

	/**
	 * @memberOf KiteTicker
	 * @method disconnect
	 * @instance
	 */
	this.disconnect = function() {
		if(ws && ws.readyState != ws.CLOSING && ws.readyState != ws.CLOSED) {
			ws.close();
		}
	}

	/**
	 * Check if the ticker is connected
	 * @memberOf KiteTicker
	 * @method connected
	 * @instance
	 * @returns {bool}
	 */
	this.connected = function() {
		if(ws && ws.readyState == ws.OPEN) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Register websocket event callbacks
	 * Available events
	 * ~~~~
	 * connect -  when connection is successfully established.
	 * ticks - when ticks are available (Arrays of `ticks` object as the first argument).
	 * disconnect - when socket connection is disconnected. Error is received as a first param.
	 * error - when socket connection is closed with error. Error is received as a first param.
	 * close - when socket connection is closed cleanly.
	 * reconnect - When reconnecting (current re-connection count and reconnect interval as arguments respectively).
	 * noreconnect - When re-connection fails after n number times.
	 * order_update - When order update (postback) is received for the connected user (Data object is received as first argument).
	 * message - when binary message is received from the server.
	 * ~~~~
	 *
	 * @memberOf KiteTicker
	 * @method on
	 * @instance
	 *
	 * @example
	 * ticker.on("ticks", callback);
	 * ticker.on("connect", callback);
	 * ticker.on("disconnect", callback);
	 */
	this.on = function(e, callback) {
		if(triggers.hasOwnProperty(e)) {
			triggers[e].push(callback);
		}
	};

	/**
	 * Subscribe to array of tokens
	 * @memberOf KiteTicker
	 * @method subscribe
	 * @instance
	 * @param {array} tokens Array of tokens to be subscribed
	 *
	 * @example
	 * ticker.subscribe([738561]);
	 */
	this.subscribe = function(tokens) {
		if(tokens.length > 0) {
			send({"a": mSubscribe, "v": tokens});
		}
		return tokens;
	};

	/**
	 * Unsubscribe to array of tokens
	 * @memberOf KiteTicker
	 * @method unsubscribe
	 * @instance
	 * @param {array} tokens Array of tokens to be subscribed
	 *
	 * @example
	 * ticker.unsubscribe([738561]);
	 */
	this.unsubscribe = function(tokens) {
		if(tokens.length > 0) {
			send({"a": mUnSubscribe, "v": tokens});
		}
		return tokens;
	};

	/**
	 * Set modes to array of tokens
	 * @memberOf KiteTicker
	 * @method setMode
	 * @instance
	 * @param {string} mode - mode to set
	 * @param {array} tokens Array of tokens to be subscribed
	 *
	 * @example
	 * ticker.setMode(ticker.modeFull, [738561]);
	 */
	this.setMode = function(mode, tokens) {
		if(tokens.length > 0) {
			send({"a": mSetMode, "v": [mode, tokens]});
		}
		return tokens;
	};

	/**
	 * Parse received binary message
	 * @memberOf KiteTicker
	 * @method parseBinary
	 * @instance
	 * @param {ArrayBufferTypes} binpacks - tick buffer packets
	 */

	this.parseBinary = function(binpacks) {
		return parseBinary(binpacks);
	}

	function autoReconnect(t, max_retry, max_delay) {
		auto_reconnect = (t == true);

		// Set default values
		max_retry = max_retry || defaultReconnectMaxRetries;
		max_delay = max_delay || defaultReconnectMaxDelay;

		// Set reconnect constraints
		reconnect_max_tries = max_retry >= maximumReconnectMaxRetries ? maximumReconnectMaxRetries : max_retry;
		reconnect_max_delay = max_delay <= minimumReconnectMaxDelay  ? minimumReconnectMaxDelay : max_delay;
	}

	function triggerDisconnect(e) {
		ws = null;
		trigger("disconnect", [e]);
		if(auto_reconnect) attemptReconnection();
	}

	// send a message via the socket
	// automatically encodes json if possible
	function send(message) {
		if(!ws || ws.readyState != ws.OPEN) return;

		try {
			if(typeof(message) == "object") {
				message = JSON.stringify(message);
			}
			ws.send(message);
		} catch(e) { ws.close(); };
	}

	// trigger event callbacks
	function trigger(e, args) {
		if (!triggers[e]) return
		for(var n=0; n<triggers[e].length; n++) {
			triggers[e][n].apply(triggers[e][n], args ? args : []);
		}
	}

	function parseTextMessage(data) {
        try {
            data = JSON.parse(data)
		} catch (e) {
			return
		}

		if (data.type === "order") {
			trigger("order_update", [data.data]);
		}
	}

	// parse received binary message. each message is a combination of multiple tick packets
	// [2-bytes num packets][size1][tick1][size2][tick2] ...
	function parseBinary(binpacks) {
		var packets = splitPackets(binpacks),
			ticks = [];

		for(var n=0; n<packets.length; n++) {
			var bin = packets[n],
				instrument_token = buf2long(bin.slice(0, 4)),
				segment = instrument_token & 0xff;

			var tradable = true;
			if (segment === Indices) tradable = false;

			// Add price divisor based on segment
			var divisor = 100.0;
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
					instrument_token: instrument_token,
					last_price: buf2long(bin.slice(4,8)) / divisor
				});
			// Parse indices quote and full mode
			} else if (bin.byteLength === 28 || bin.byteLength === 32) {
				var mode = modeQuote;
				if (bin.byteLength === 32) mode = modeFull;

                var tick = {
                    tradable: tradable,
                    mode: mode,
                    instrument_token: instrument_token,
                    last_price: buf2long(bin.slice(4,8)) / divisor,
                    ohlc: {
                        high: buf2long(bin.slice(8, 12)) / divisor,
                        low: buf2long(bin.slice(12, 16)) / divisor,
                        open: buf2long(bin.slice(16, 20)) / divisor,
                        close: buf2long(bin.slice(20, 24)) / divisor
					},
					change: buf2long(bin.slice(24, 28))
				};

                // Compute the change price using close price and last price
                if(tick.ohlc.close != 0) {
                    tick.change = (tick.last_price - tick.ohlc.close) * 100 / tick.ohlc.close;
				}

                // Full mode with timestamp in seconds
                if (bin.byteLength === 32) {
					tick.exchange_timestamp = null;
					var timestamp = buf2long(bin.slice(28, 32));
					if (timestamp) tick.exchange_timestamp = new Date(timestamp * 1000);
				}

				ticks.push(tick);
			} else if (bin.byteLength === 44 || bin.byteLength === 184) {
				var mode = modeQuote;
				if (bin.byteLength === 184) mode = modeFull;

				var tick = {
                    tradable: tradable,
                    mode: mode,
                    instrument_token: instrument_token,
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
				};

                // Compute the change price using close price and last price
                if (tick.ohlc.close != 0) {
                    tick.change = (tick.last_price - tick.ohlc.close) * 100 / tick.ohlc.close;
				}

				// Parse full mode
				if (bin.byteLength === 184) {
					// Parse last trade time
					tick.last_trade_time = null;
					var last_trade_time = buf2long(bin.slice(44, 48));
					if (last_trade_time) tick.last_trade_time = new Date(last_trade_time * 1000);

					// Parse timestamp
					tick.exchange_timestamp = null;
					var timestamp = buf2long(bin.slice(60, 64));
					if (timestamp) tick.exchange_timestamp = new Date(timestamp * 1000);

					// Parse OI
					tick.oi = buf2long(bin.slice(48, 52));
                    tick.oi_day_high = buf2long(bin.slice(52, 56));
					tick.oi_day_low = buf2long(bin.slice(56, 60));
					tick.depth = {
						buy: [],
						sell: []
					};

					var s = 0, depth = bin.slice(64, 184);
					for (var i=0; i<10; i++) {
						s = i * 12;
						tick.depth[i < 5 ? "buy" : "sell"].push({
							quantity:	buf2long(depth.slice(s, s + 4)),
							price:		buf2long(depth.slice(s + 4, s + 8)) / divisor,
							orders: 	buf2long(depth.slice(s + 8, s + 10))
						});
					}
				}

				ticks.push(tick);
			}
		}

		return ticks;
	}

	// split one long binary message into individual tick packets
	function splitPackets(bin) {
		// number of packets
		var num = buf2long(bin.slice(0, 2)),
			j = 2,
			packets = [];

		for(var i=0; i<num; i++) {
			// first two bytes is the packet length
			var size = buf2long(bin.slice(j, j+2)),
				packet = bin.slice(j+2, j+2+size);

			packets.push(packet);

			j += 2 + size;
		}

		return packets;
	}

	function attemptReconnection() {
		// Try reconnecting only so many times.
		if(current_reconnection_count > reconnect_max_tries) {
			trigger("noreconnect");
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

		trigger("reconnect", [current_reconnection_count, last_reconnect_interval]);

		reconnect_timer = setTimeout(function() {
			self.connect();
		}, last_reconnect_interval * 1000);
	}

	// Big endian byte array to long.
	function buf2long(buf) {
		var b = new Uint8Array(buf),
			val = 0,
			len = b.length;

		for(var i=0, j=len-1; i<len; i++, j--) {
			val += b[j] << (i*8);
		}

		return val;
	}
	var self = this;
};

module.exports = KiteTicker;
