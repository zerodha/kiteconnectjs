/**
 * Represents parameters for the Kite Ticker.
 *
 * @remarks
 * This interface defines the parameters required to initialize the Kite Ticker.
 *
 * @public
 * @name KiteTickerParams
 */
export interface KiteTickerParams {
    /**
     * @type {string}
     */
    api_key: string;
    /**
     * @type {string}
     */
    access_token: string;
    /**
     * @type {?boolean}
     */
    reconnect?: boolean;
    /**
     * @type {?number}
     */
    max_retry?: number;
    /**
     * @type {?number}
     */
    max_delay?: number;
    /**
     * @type {?string}
     */
    root?: string;
}

/**
 * Represents the interface for KiteTicker.
 *
 * @remarks
 * This interface extends the KiteTickerParams interface, adding additional functionality and properties specific to KiteTicker.
 *
 * @public
 * @name KiteTickerInterface
 */
export interface KiteTickerInterface extends KiteTickerParams {
    
}

/**
 * Represents the tick response for the Last Traded Price (LTP) mode.
 *
 * @remarks
 * This interface defines the structure of a tick response in LTP mode,
 *
 * @public
 * @name TickLTP
 */
 export interface TickLTP {
    mode: string;
    tradable: boolean;
    instrument_token: number;
    last_price: number;
}
