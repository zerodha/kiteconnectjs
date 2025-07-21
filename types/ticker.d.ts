import { Tick } from '../interfaces/ticker';

export type KiteTickerParams = {
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
  
export type Ticker = {
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
  disconnect: () => void;
  /**
   * Register websocket event callbacks with type-safe callbacks
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
   * ticker.on('ticks', (ticks: Tick[]) => { ... });  // Type-safe (new)
   * ticker.on('ticks', (ticks: any[]) => { ... });   // Backward compatible
   * ticker.on('connect', () => { ... });
   * ticker.on('disconnect', (error: Error) => { ... });
   * ticker.on('message', (binaryData: ArrayBuffer) => { ... });
   */
  on(event: 'connect', callback: () => void): void;
  on(event: 'ticks', callback: (ticks: Tick[]) => void): void;
  on(event: 'ticks', callback: (ticks: any[]) => void): void;  // Backward compatibility
  on(event: 'disconnect', callback: (error: Error) => void): void;
  on(event: 'error', callback: (error: Error) => void): void;
  on(event: 'close', callback: (reason: string) => void): void;
  on(event: 'reconnect', callback: (reconnect_count: number, reconnect_interval: number) => void): void;
  on(event: 'noreconnect', callback: () => void): void;
  on(event: 'message', callback: (binaryData: ArrayBuffer) => void): void;
  on(event: 'order_update', callback: (order: any) => void): void;
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
  
export type KiteTicker = {
  /**
    * The WebSocket client for connecting to Kite connect streaming quotes service.
    *
    * Getting started:
    * ---------------
    *
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
    * ticker.on('close', onClose);`
    * ticker.on('order_update', onTrade);
    *
    * function onTicks(ticks: Tick[]): void {
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
    *
    * Tick structure (passed to the tick callback you assign):
    * ---------------------------
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
    * ticker.on('reconnect', (reconnect_count: number, reconnect_interval: number) => {
    *     console.log('Reconnecting: attempt - ', reconnect_count, ' interval - ', reconnect_interval)
    * })
    *
    * function onTicks(ticks: Tick[]) {
    *     console.log('Ticks', ticks)
    * }
    *
    * function subscribe() {
    *     const items = [738561]
    *     ticker.subscribe(items)
    *     ticker.setMode(ticker.modeFull, items)
    * }
    */
  new (params: KiteTickerParams): Ticker;
};
  
declare const KiteTicker: KiteTicker;
export default KiteTicker;