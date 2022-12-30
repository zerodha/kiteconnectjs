type KiteTickerParams = {
    /**
     * API key issued you.
     */
    api_key: string;
    /**
     * Access token obtained after successful login flow.
     */
    access_token: string;
    /**
     * Enable/Disable auto reconnect. Enabled by default.
     */
    reconnect?: boolean;
    /**
     * is maximum number re-connection attempts. Defaults to 50 attempts and maximum up to 300 attempts.
     */
    max_retry?: number;
    /**
     * in seconds is the maximum delay after which subsequent re-connection interval will become constant. Defaults to 60s and minimum acceptable value is 5s.
     */
    max_delay?: number;
  };
  
  type Ticker = {
    /**
     * Set mode full
     */
    modeFull: 'full';
    /**
     * this.modeLTP
     */
    modeLTP: 'ltp';
    /**
     * this.modeQuote
     */
    modeQuote: 'quote';
  
    /**
     * Auto reconnect settings
     * @param Enable or disable auto disconnect, defaults to false
     * @param max_retry is maximum number re-connection attempts. Defaults to 50 attempts and maximum up to 300 attempts.
     * @param max_delay in seconds is the maximum delay after which subsequent re-connection interval will become constant. Defaults to 60s and minimum acceptable value is 5s.
     * @returns
     */
    autoReconnect: (
      Enable: boolean,
      max_retry?: number,
      max_delay?: number
    ) => void;
    /**
     * Initiate a websocket connection
     */
    connect: () => void;
    /**
     * Check if the ticker is connected
     */
    connected: () => boolean;
    /**
     * Check if the ticker is connected
     */
    disconnect: () => boolean;
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
     * @example
     * ticker.on("ticks", callback);
     * ticker.on("connect", callback);
     * ticker.on("disconnect", callback);
     */
    on: (
      event:
        | 'connect'
        | 'ticks'
        | 'disconnect'
        | 'error'
        | 'close'
        | 'reconnect'
        | 'noreconnect'
        | 'order_update',
      callback: Function
    ) => void;
    /**
     * Set modes to array of tokens
     * @param mode mode to set
     * @param tokens Array of tokens to be subscribed
     *
     * @example
     * ticker.setMode(ticker.modeFull, [738561]);
     */
    setMode: (mode: 'ltp' | 'quote' | 'full', tokens: number[]) => number[];
    /**
     * Subscribe to array of tokens
     * @param tokens Array of tokens to be subscribed
     *
     * @example
     * ticker.subscribe([738561]);
     */
    subscribe: (tokens: number[]) => number[];
    /**
     * Unsubscribe to array of tokens
     * @param tokens Array of tokens to be unsubscribed
     *
     * @example
     * ticker.unsubscribe([738561]);
     */
    unsubscribe: (tokens: number[]) => number[];
  };
  
  type KiteTicker = {
    /**
     * The WebSocket client for connecting to Kite connect streaming quotes service.
     *
     * Getting started:
     * ---------------
     *
     *  import { KiteTicker } from "kiteconnect";
     * 	const ticker = new KiteTicker({
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
     * 	import { KiteTicker } from "kiteconnect";
     * 	const ticker = new KiteTicker({
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
     * 		const items = [738561];
     * 		ticker.subscribe(items);
     * 		ticker.setMode(ticker.modeFull, items);
     * 	}
     *
     */
    new (params: KiteTickerParams): Ticker;
  };
  
  declare const KiteTicker: KiteTicker;
  export default KiteTicker;