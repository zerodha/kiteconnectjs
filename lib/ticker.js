var WebSocket = require("ws");

/**
 * The WebSocket client for connecting to Kite Connect's streaming quotes service.
 *
 * Getting started:
 * ---------------
 *
 * 	var KiteTicker = require("kiteconnect").KiteTicker;
 * 	var ticker = new KiteTicker(api_key, user_id, public_token);
 *
 * 	ticker.connect();
 * 	ticker.on("tick", setTick);
 * 	ticker.on("connect", subscribe);
 *
 * 	function setTick(ticks) {
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
 *	[{
 *		mode: 'full',
 *		tradeable: true,
 *		Token: 53256711,
 *		LastTradedPrice: 3223,
 *		LastTradeQuantity: 6,
 *		AverageTradePrice: 3229.56,
 *		VolumeTradedToday: 96037,
 *		TotalBuyQuantity: 3890,
 *		TotalSellQuantity: 3572,
 *		OpenPrice: 3231,
 *		HighPrice: 3261,
 *		LowPrice: 3206,
 *		ClosePrice: 3222,
 *		NetPriceChangeFromClosingPrice: 0.031036623215394164,
 *		Depth: {
 *			buy:[{
 *				 Quantity:59,
 *				 Price:3223,
 *				 Total:5
 *			  },
 *			  {
 *				 Quantity:164,
 *				 Price:3222,
 *				 Total:15
 *			  },
 *			  {
 *				 Quantity:123,
 *				 Price:3221,
 *				 Total:7
 *			  },
 *			  {
 *				 Quantity:48,
 *				 Price:3220,
 *				 Total:7
 *			  },
 *			  {
 *				 Quantity:33,
 *				 Price:3219,
 *				 Total:5
 *			  }],
 *		   sell:[{
 *				 Quantity:115,
 *				 Price:3224,
 *				 Total:15
 *			  },
 *			  {
 *				 Quantity:50,
 *				 Price:3225,
 *				 Total:5
 *			  },
 *			  {
 *				 Quantity:175,
 *				 Price:3226,
 *				 Total:14
 *			  },
 *			  {
 *				 Quantity:49,
 *				 Price:3227,
 *				 Total:10
 *			  },
 *			  {
 *				 Quantity:106,
 *				 Price:3228,
 *				 Total:13
 *			  }]
 *		}
 *	}, ...]
 *
 * Auto re-connect WebSocket client
 * -------------------------------
 * ```
 * Available from version 1.2
 * ```
 * Optionally you can enable client side auto reconnection to automatically reconnect if the connection is dropped.
 * It is very useful at times when client side network is unreliable and patchy.
 *
 * All you need to do is enable auto reconnection with preferred interval and time. For example
 *
 * 	// Enable auto reconnect with 5 second interval and retry for maximum of 20 times.
 * 	ticker.autoReconnect(true, 20, 5)
 *
 * 	// You can also set reconnection times to -1 for inifinite reconnections
 * 	ticker.autoReconnect(true, -1, 5)
 *
 * - Event `reconnecting` is called when auto reconnection is triggered and event callback carries two additional params `reconnection interval set` and `current reconnection count`.
 *
 * - Event `noreconnect` is called when number of auto reconnections exceeds the maximum reconnection count set. For example if maximum reconnection count is set as `20` then after 20th reconnection this event will be triggered. Also note that the current process is exited when this event is triggered.
 *
 * - Event `connect` will be triggered again when reconnection succeeds.
 *
 * Here is an example demonstrating auto reconnection.
 *
 * 	var KiteTicker = require("kiteconnect").KiteTicker;
 * 	var ticker = new KiteTicker(api_key, user_id, public_token);
 *
 * 	// set autoreconnect with 10 maximum reconnections and 5 second interval
 * 	ticker.autoReconnect(true, 10, 5)
 * 	ticker.connect();
 * 	ticker.on("tick", setTick);
 * 	ticker.on("connect", subscribe);
 *
 * 	ticker.on("noreconnect", function() {
 * 		console.log("noreconnect")
 * 	});
 *
 * 	ticker.on("reconnecting", function(reconnect_interval, reconnections) {
 * 		console.log("Reconnecting: attempet - ", reconnections, " innterval - ", reconnect_interval);
 * 	});
 *
 * 	function setTick(ticks) {
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
 * @param {string} api_key API key issued you.
 * @param {string} user_id Zerodha client id (ex. DV0006)
 * @param {string} public_token Token obtained after the login flow.
 * #param {string} [address="wss://websocket.kite.trade/"] Kite websocket address.
 */
var KiteTicker = function(api_key, user_id, public_token, address) {
	if(!address) {
		var address = "wss://websocket.kite.trade/";
	}

	var read_timeout = 5, // seconds
		reconnect_interval = 5,
		reconnect_tries = 5,

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
					"tick": [],
					"disconnect": [],
					"reconnecting": [],
					"noreconnect": []},

		read_timer = null,
		last_read = 0,
		reconnect_timer = null,
		auto_reconnect = false,
		reconnections = 0,
		currentWsUrl = null,
		token_modes = {};

	// segment constants
	var NseCM = 1,
		NseFO = 2,
		NseCD = 3,
		BseCM = 4,
		BseFO = 5,
		BseCD = 6,
		McxFO = 7,
		McxSX = 8,
		NseIndices = 9;

	/**
	 * Auto reconnect settings
	 * @param  {bool} Enable or disable auto disconnect, defaults to false
	 * @param  {number} [times=5] Number of times to retry, defaults to 5. Set -1 for infinite reconnections.
	 * @param  {number} [times=5] Timeout in seconds, default to 5.
	 * @memberOf KiteTicker
	 * @method autoReconnect
	 */
	this.autoReconnect = function(t, times, timeout) {
		auto_reconnect = (t == true ? true : false);

		if(times) {
			reconnect_tries = times;
		}

		if(timeout) {
			reconnect_interval = timeout;
		}
	};

	/**
	 * Initiate a websocket connectipn
	 * @memberOf KiteTicker
	 * @method connect
	 * @instance
	 */
	this.connect = function() {
		if(ws && (ws.readyState == ws.CONNECTING || ws.readyState == ws.OPEN)) {
			return;
		}

		ws = new WebSocket(address + "?api_key=" + api_key + "&user_id=" + user_id +
			"&public_token=" + public_token + "&uid=" + (new Date().getTime().toString()));
		ws.binaryType = "arraybuffer";

		ws.onopen = function() {
			// Store current open connection url to check for auto reconnection
			if (!currentWsUrl) {
				currentWsUrl = this.url
			}

			// Reset reconnections attempt
			reconnections = 0

			// Trigger onconnect event
			trigger("connect");

			// If there isn't an incoming message in n seconds, assume disconnection.
			clearInterval(read_timer);

			last_read = new Date();
			read_timer = setInterval(function() {
				if((new Date() - last_read ) / 1000 >= read_timeout) {
					// reset currentWsUrl incase current connection times out
					// This is determined when last heart beat received time interval
					// exceeds read_timeout value
					currentWsUrl = null;

					if(ws) {
						ws.close();
					}

					clearInterval(read_timer);
					triggerDisconnect();
				}
			}, read_timeout * 1000);
		};

		ws.onmessage = function(e) {
			// Binary tick data.
			if(e.data instanceof ArrayBuffer) {
				if(e.data.byteLength > 2) {
					var d = parseBinary(e.data);
					if(d) {
						trigger("tick", [d]);
					}
				}
			}

			// Set last read time to check for connection timeout
			last_read = new Date();
		};

		ws.onerror = function(e) {
			if(this && this.readyState == this.OPEN) {
				this.close();
			}
		};

		ws.onclose = function(e) {
			// the ws id doesn't match the current global id,
			// meaning it's a ghost close event. just ignore.
			if(currentWsUrl && (this.url != currentWsUrl)) {
				return;
			}

			triggerDisconnect();
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
	 * tick - when ticks are available (Arrays of `ticks` object as the first argument).
	 * disconnect - when socket connction is disconnected.
	 * reconnecting - When reconnecting (Reconnecting interval and current reconnetion count as arguments respectively).
	 * noreconnect - When reconnection fails after n number times.
	 * ~~~~
	 *
	 * @memberOf KiteTicker
	 * @method on
	 * @instance
	 *
	 * @example
	 * ticker.on("tick", callback);
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
	 * On close/error of websocket, trigger the disconnect event and start attemping reconnections
	 * @memberOf KiteTicker
	 * @method triggerDisconnect
	 * @instance
	 */
	function triggerDisconnect() {
		ws = null;
		trigger("disconnect");

		if(auto_reconnect) {
			attemptReconnection();
		}
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
		for(var n=0; n<triggers[e].length; n++) {
			triggers[e][n].apply(triggers[e][n], args ? args : []);
		}
	}

	// parse received binary message. each message is a combination of multiple tick packets
	// [2-bytes num packets][size1][tick1][size2][tick2] ...
	function parseBinary(binpacks) {
		// token and segment.

		var packets = splitPackets(binpacks),
			ticks = [];

		for(var n=0; n<packets.length; n++) {
			var bin = packets[n];

			var t = buf2long(bin.slice(0, 4)),
				token = t >> 8,
				segment = t & 0xff;

			switch(segment) {
				case NseIndices:
					var dec = 100;
					var q = {
						mode: modeFull,
						tradeable: false,
						Token: t,
						LastTradedPrice: buf2long(bin.slice(4,8)) / dec,
						HighPrice: buf2long(bin.slice(8,12)) / dec,
						LowPrice: buf2long(bin.slice(12,16)) / dec,
						OpenPrice: buf2long(bin.slice(16,20)) / dec,
						ClosePrice: buf2long(bin.slice(20,24)) / dec,
						NetPriceChangeFromClosingPrice: buf2long(bin.slice(24,28)) / dec
					};

					ticks.push(q);
				break;

				case McxFO:
				case NseCM:
				case BseCM:
				case NseFO:
				case NseCD:
					// decimal precision
					var dec = (segment == NseCD) ? 10000000 : 100;

					// ltp only quote
					if(bin.byteLength == 8) {
						ticks.push({
							mode: modeLTP,
							tradeable: true,
							Token: t,
							LastTradedPrice: buf2long(bin.slice(4,8)) / dec
						});

						continue;
					}

					var q = {
						mode: modeQuote,
						tradeable: true,
						Token: t,
						LastTradedPrice: buf2long(bin.slice(4,8)) / dec,
						LastTradeQuantity: buf2long(bin.slice(8,12)),
						AverageTradePrice: buf2long(bin.slice(12,16))  / dec,
						VolumeTradedToday: buf2long(bin.slice(16,20)),
						TotalBuyQuantity: buf2long(bin.slice(20,24)),
						TotalSellQuantity: buf2long(bin.slice(24,28)),
						OpenPrice: buf2long(bin.slice(28,32)) / dec,
						HighPrice: buf2long(bin.slice(32,36)) / dec,
						LowPrice: buf2long(bin.slice(36,40)) / dec,
						ClosePrice: buf2long(bin.slice(40,44)) / dec,
						Depth: {"buy": [], "sell": []}
					};

					// Change %
					q.NetPriceChangeFromClosingPrice = 0;
					if(q.ClosePrice !== 0) {
						q.NetPriceChangeFromClosingPrice = (q.LastTradedPrice - q.ClosePrice)*100 / q.ClosePrice;
					}

					// full quote including depth
					if(bin.byteLength > 60) {
						q.mode = modeFull;

						var s = 0, depth = bin.slice(44, 164);
						for(var i=0; i<10; i++) {
							s = i * 12;
							q.Depth[i < 5 ? "buy" : "sell"].push({
								Quantity: buf2long(depth.slice(s, s+4)),
								Price:    buf2long(depth.slice(s+4, s+8)) / dec,
								Total:    buf2long(depth.slice(s+8, s+10))
							});
						}
					}

					ticks.push(q);
				break;
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
		if(reconnect_tries !== -1 && reconnections >= reconnect_tries) {
			trigger("noreconnect");
			process.exit(1);
		}

		trigger("reconnecting", [reconnect_interval, reconnections]);
		reconnect_timer = setTimeout(function() {
			self.connect();
		}, reconnect_interval * 1000);

		reconnections++;
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

	// de-duplicate an array
	function arrayUnique() {
		var u = {}, a = [];
		for(var i = 0, l = this.length; i < l; ++i){
			if(u.hasOwnProperty(this[i])) {
				continue;
			}

			a.push(this[i]);
			u[this[i]] = 1;
		}

		return a;
	}

	var self = this;
};

module.exports = KiteTicker;
