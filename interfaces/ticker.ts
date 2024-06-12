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
 *
 * @remarks
 * This interface defines the structure of a tick response
 *
 * @public
 * @name BaseTick
 */
export interface BaseTick {
    tradable: boolean;
    mode: string;
    instrument_token: number;
    last_price: number;
}

/**
 *
 * @remarks
 * This interface defines the structure of a tick response in the LTP mode.
 *
 * @public
 * @name LTPTick
 */
export interface LTPTick extends BaseTick {
    mode: string;
}

/**
 *
 * @remarks
 * This interface defines the structure of a tick response in the Quote mode.
 *
 * @public
 * @name QuoteTick
 */
export interface QuoteTick extends BaseTick {
    mode: string;
    ohlc: {
        high: number;
        low: number;
        open: number;
        close: number;
    };
    change: number;
    exchange_timestamp?: Date | null;
}

/**
 *
 * @remarks
 * This interface defines the structure of a tick response in the Full mode.
 *
 * @public
 * @name FullTick
 */
export interface FullTick extends BaseTick {
    mode: string;
    last_traded_quantity: number;
    average_traded_price: number;
    volume_traded: number;
    total_buy_quantity: number;
    total_sell_quantity: number;
    ohlc: {
        high: number;
        low: number;
        open: number;
        close: number;
    };
    change: number;
    exchange_timestamp?: Date | null;
    last_trade_time?: Date | null;
    oi?: number;
    oi_day_high?: number;
    oi_day_low?: number;
    depth?: {
        buy: Depth[];
        sell: Depth[];
    };
}

export interface Depth {
    quantity: number;
    price: number;
    orders: number;
}

// Combined type for all tick modes
export type Tick = LTPTick | QuoteTick | FullTick;
