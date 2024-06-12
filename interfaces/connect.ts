
/**
 * @public
 * @enum {string}
 */
export enum ProductTypes {
    PRODUCT_MIS = 'MIS',
    PRODUCT_CNC = 'CNC',
    PRODUCT_NRML = 'NRML'
};

/**
 * @public
 * @enum {string}
 */
export enum Varieties {
    VARIETY_AMO = 'amo',
    VARIETY_AUCTION = 'auction',
    VARIETY_ICEBERG = 'iceberg',
    VARIETY_REGULAR = 'regular',
    VARIETY_CO = 'co',
    TEST = 'test'
};

/**
 * @public
 * @enum {string}
 */
export enum ValidityTypes {
    VALIDITY_DAY = 'DAY',
    VALIDITY_IOC = 'IOC',
    VALIDITY_TTL = 'TTL',
}

/**
 * @public
 * @enum {string}
 */
export enum MarginTypes {
    MARGIN_EQUITY = 'equity',
    MARGIN_COMMODITY = 'commodity',
}

/**
 * @public
 * @enum {string}
 */
export enum StatusTypes {
    STATUS_CANCELLED = 'CANCELLED',
    STATUS_REJECTED = 'REJECTED',
    STATUS_COMPLETE = 'COMPLETE',
    STATUS_UPDATE = 'UPDATE'
}

/**
 * @public
 * @enum {string}
 */
export enum GTTStatusTypes {
    GTT_TYPE_OCO = 'two-leg',
    GTT_TYPE_SINGLE = 'single',
    GTT_STATUS_ACTIVE = 'active',
    GTT_STATUS_TRIGGERED = 'triggered',
    GTT_STATUS_DISABLED = 'disabled',
    GTT_STATUS_EXPIRED = 'expired',
    GTT_STATUS_CANCELLED = 'cancelled',
    GTT_STATUS_REJECTED = 'rejected',
    GTT_STATUS_DELETED = 'deleted',
}

/**
 * @public
 * @enum {string}
 */
export enum PositionTypes {
    POSITION_TYPE_DAY = 'day',
    POSITION_TYPE_OVERNIGHT = 'overnight',
}

/**
 * @remarks
 * This interface defines the parameters needed to authenticate and interact with the Kite Connect API.
 * @public
 * @name KiteConnectParams
 */
export interface KiteConnectParams {
    /**
     * API key issued to you.
     */
    api_key: string;
    /**
     * Token obtained after the login flow in exchange for the `request_token`.
     * Pre-login, this will default to null, but once you have obtained it, you
     * should persist it in a database or session to pass to the Kite Connect
     * class initialisation for subsequent requests.
     *
     * Defaults to `null`
     */
    access_token?: string | null;
    /**
     * API end point root. Unless you explicitly want to send API requests to a
     * non-default endpoint, this can be ignored.
     *
     * Defaults to 'https://api.kite.trade'
     */
    root?: string;
    /**
     * Kite connect login url
     *
     * Defaults to 'https://kite.zerodha.com/connect/login'
     */
    login_uri?: string;
    /**
     * If set to true, will console log requests and responses.
     *
     * Defaults to `false`
     */
    debug?: boolean;
    /**
     * Time (milliseconds) for which the API client will wait for a request to complete before it fails.
     *
     * Defaults to `7000`
     */
    timeout?: number;
};

/**
 * @public
 * @name KiteConnectInterface
 */
export interface KiteConnectInterface extends KiteConnectParams {

};

/**
 * @public
 * @enum {string}
 */
export enum Exchanges {
    NSE = 'NSE',
    BSE = 'BSE',
    NFO = 'NFO',
    BFO = 'BFO',
    CDS = 'CDS',
    MCX = 'MCX',
    BCD = 'BCD',
    NSEIX = 'NSEIX'
};

/**
 * @public
 * @enum {string}
 */
export enum TransactionTypes {
    BUY = 'BUY',
    SELL = 'SELL'
};

/**
 * @public
 * @enum {string}
 */
export enum Products {
    NRML = 'NRML',
    MIS = 'MIS',
    CNC = 'CNC'
};

/**
 * @public
 * @enum {string}
 */
export enum OrderTypes {
    LIMIT = 'LIMIT',
    SL = 'SL',
    SLM = 'SL-M',
    MARKET = 'MARKET'
};

/**
 * @public
 * @enum {string}
 */
export enum Validities {
    DAY = 'DAY',
    IOC = 'IOC',
    TTL = 'TTL'
};

/**
 * Represents parameters for cancelling an order.
 *
 * @remarks
 * This interface defines the parameters required to cancel an order.
 *
 * @public
 * @name CancelOrderParams
 */
export interface CancelOrderParams {
    /**
     * @type {?(string | number)}
     */
    parent_order_id?: string | number;
    /**
     * @type {?string}
     */
    variety?: string;
    /**
     * @type {?(string | number)}
     */
    order_id?: string | number;
};

/**
 * Represents parameters for exiting an order.
 *
 * @remarks
 * This interface defines the parameters required to exit an existing order.
 *
 * @public
 * @name ExitOrderParams
 */
export interface ExitOrderParams {
    /**
     * @type {?(string | number)}
     */
    parent_order_id?: string | number;
}

/**
 * Represents parameters for converting a position.
 *
 * @remarks
 * This interface defines the parameters required to convert a position from one product type to another.
 *
 * @public
 * @name ConvertPositionParams
 */
export interface ConvertPositionParams {
    /**
     * @type {Exchanges}
     */
    exchange: Exchanges;
    /**
     * @type {string}
     */
    tradingsymbol: string;
    /**
     * @type {TransactionTypes}
     */
    transaction_type: TransactionTypes;
    /**
     * @type {PositionTypes}
     */
    position_type: PositionTypes;
    /**
     * @type {(string | number)}
     */
    quantity: string | number;
    /**
     * @type {Products}
     */
    old_product: Products;
    /**
     * @type {Products}
     */
    new_product: Products;
}

/**
 * @remarks
 * Represents an order.
 *
 * @public
 * @name Order
 */
export interface Order {
    /**
     * @type {?TransactionTypes}
     */
    transaction_type?: TransactionTypes;
    /**
     * @type {?(string | number)}
     */
    quantity?: string | number;
    /**
     * @type {?Products}
     */
    product?: Products;
    /**
     * @type {?OrderTypes}
     */
    order_type?: OrderTypes;
    /**
     * @type {?Exchanges}
     */
    exchange?: Exchanges;
    /**
     * @type {?string}
     */
    tradingsymbol?: string;
    /**
     * @type {?Varieties}
     */
    variety?: Varieties;
    /**
     * @type {?(number | string)}
     */
    price?: number | string;
    /**
     * @type {?number}
     */
    trigger_price?: number;
    /**
     * @type {?PositionTypes}
     */
    position_type?: PositionTypes;
    /**
     * @type {?Products}
     */
    old_product?: Products;
    /**
     * @type {?Products}
     */
    new_product?: Products;
    /**
     * @type {?(string | number)}
     */
    amount?: string | number;
    /**
     * @type {?string}
     */
    tag?: string;
    /**
     * @type {?(string | number)}
     */
    instalments?: string | number;
    /**
     * @type {?string}
     */
    frequency?: string;
    /**
     * @type {?(string | number)}
     */
    initial_amount?: string | number;
    /**
     * @type {?(string | number)}
     */
    instalment_day?: string | number;
    /**
     * @type {?(string | number)}
     */
    status?: string | number;
    /**
     * @type {?(string | number)}
     */
    sip_id?: string | number;
    /**
     * @type {?(GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE)}
     */
    trigger_type?: GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE;
    /**
     * @type {?any[]}
     */
    trigger_values?: any[];
    /**
     * @type {?(string | number)}
     */
    last_price?: string | number;
    /**
     * @type {?Order[]}
     */
    orders?: Order[];
    /**
     * @type {?(string | number)}
     */
    order_id?: string | number;
    /**
     * @type {?(string | number)}
     */
    parent_order_id?: string | number;
    /**
     * @type {number}
     */
     average_price?: number;
}

/**
 * Represents parameters for fetching historical data.
 *
 * @remarks
 * This interface defines the parameters required to retrieve historical data.
 *
 * @public
 * @name getHistoricalDataParams
 */
export interface getHistoricalDataParms {
    /**
     * @type {string}
     */
    instrument_token: string;
    /**
     * @type {string}
     */
    interval: string;
    /**
     * @type {(string | Date)}
     */
    from_date: string | Date;
    /**
     * @type {(string | Date)}
     */
    to_date: string | Date;
    /**
     * @type {?boolean}
     */
    continuous?: boolean;
    /**
     * @type {?boolean}
     */
    oi?: boolean;
};

/**
 * Represents parameters for modifying a GTT (Good 'Til Triggered) order.
 *
 * @public
 * @name ModifyGTTParams
 */
export interface ModifyGTTParams {
    /**
     * @type {(GTTStatusTypes.GTT_TYPE_SINGLE | GTTStatusTypes.GTT_TYPE_OCO)}
     */
    trigger_type: GTTStatusTypes.GTT_TYPE_SINGLE | GTTStatusTypes.GTT_TYPE_OCO;
    /**
     * @type {string}
     */
    tradingsymbol: string;
    /**
     * @type {Exchanges}
     */
    exchange: Exchanges;
    /**
     * @type {Array<number>}
     */
    trigger_values: Array<number>;
    /**
     * @type {number}
     */
    last_price: number;
    /**
     * Represents an array of orders.
     * @type {Array<{
     *    exchange: string;
     *    tradingsymbol: string;
     *    transaction_type: string;
     *    quantity: number;
     *    product: Products;
     *    order_type: OrderTypes;
     *    price: number;
     * }>}
     */
    orders: {
        exchange: string;
        tradingsymbol: string;
        transaction_type: string;
        quantity: number;
        product: Products;
        order_type: OrderTypes;
        price: number;
    }[];
};

/**
 * Represents parameters for modifying an MFSIP (Mutual Fund SIP).
 *
 * @remarks
 * This interface defines the parameters required to modify an existing Mutual Fund SIP.
 *
 * @public
 * @name ModifyMFSIPParams
 */
export interface ModifyMFSIPParams {
    /**
     * @type {?string}
     */
    instalments?: string;
    /**
     * @type {?string}
     */
    frequency?: string;
    /**
     * @type {?string}
     */
    instalment_day?: string;
    /**
     * @type {?string}
     */
    status?: string;
}

/**
 * Represents parameters for modifying an order.
 *
 * @remarks
 * This interface defines the parameters required to modify an existing order.
 *
 * @public
 * @name ModifyOrderParams
 */
export interface ModifyOrderParams {
    /**
     * @type {?number}
     */
    quantity?: number;
    /**
     * @type {?number}
     */
    price?: number;
    /**
     * @type {?OrderTypes}
     */
    order_type?: OrderTypes;
    /**
     * @type {?Validities}
     */
    validity?: Validities;
    /**
     * @type {?number}
     */
    disclosed_quantity?: number;
    /**
     * @type {?number}
     */
    trigger_price?: number;
    /**
     * @type {?(string | number)}
     */
    parent_order_id?: string | number;
    /**
     * @type {?string}
     */
    variety?: string;
    /**
     * @type {?(string | number)}
     */
    order_id?: string | number;
};

/**
 * Represents parameters for placing an order based on margin.
 * @remarks
 * Represents interface for placing an order based on margin.
 * @public
 * @name OrderMarginOrder
 */
export interface OrderMarginOrder {
    /**
     * @type {string}
     */
    exchange: string;
    /**
     * @type {string}
     */
    tradingsymbol: string;
    /**
     * @type {TransactionTypes}
     */
    transaction_type: TransactionTypes;
    /**
     * @type {Varieties}
     */
    variety: Varieties;
    /**
     * @type {ProductTypes}
     */
    product: ProductTypes;
    /**
     * @type {OrderTypes}
     */
    order_type: OrderTypes;
    /**
     * @type {number}
     */
    quantity: number;
    /**
     * @type {number}
     */
    price: number;
    /**
     * @type {number}
     */
    trigger_price: number;
};

/**
 * Represents parameters for placing a mutual fund order.
 *
 * @remarks
 * This interface defines the parameters required to place a mutual fund order.
 *
 * @public
 * @name PlaceMFOrderParams
 */
export interface PlaceMFOrderParams {
    /**
     * @type {string}
     */
    tradingsymbol: string
    /**
     * @type {TransactionTypes}
     */
    transaction_type: TransactionTypes;
    /**
     * @type {?(string | number)}
     */
    quantity?: string | number;
    /**
     * @type {?(string | number)}
     */
    amount?: string | number;
    /**
     * @type {?string}
     */
    tag?: string;
}

/**
 * Represents parameters for placing a Good Till Trigger (GTT) order.
 *
 * @remarks
 * This interface defines the parameters required to place a Good Till Trigger (GTT) order.
 *
 * @public
 * @name PlaceGTTParams
 */
export interface PlaceGTTParams {
    /**
     * @type {(GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE)}
     */
    trigger_type: GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE;
    /**
     * @type {string}
     */
    tradingsymbol: string;
    /**
     * @type {Exchanges}
     */
    exchange: Exchanges;
    /**
     * @type {Array<Number>}
     */
    trigger_values: Array<Number>;
    /**
     * @type {number}
     */
    last_price: number;
    /**
     * @type {{
     *      exchange: string;
     *      tradingsymbol: string;
     *      transaction_type: TransactionTypes;
     *      quantity: number;
     *      product: Products;
     *      order_type: OrderTypes;
     *      price: number;
     *  }[]}
     */
    orders: {
        exchange: string;
        tradingsymbol: string;
        transaction_type: TransactionTypes;
        quantity: number;
        product: Products;
        order_type: OrderTypes;
        price: number
    }[];
};

/**
 * Represents parameters for placing an order.
 *
 * @remarks
 * This interface defines the parameters required to place an order.
 *
 * @public
 * @name PlaceOrderParams
 */
export interface PlaceOrderParams {
    /**
     * @type {?string}
     */
    variety?: Varieties;
    /**
     * @type {string}
     */
    tradingsymbol: string;
    /**
     * @type {Exchanges}
     */
    exchange: Exchanges;
    /**
     * @type {TransactionTypes}
     */
    transaction_type: TransactionTypes;
    /**
     * @type {OrderTypes}
     */
    order_type: OrderTypes;
    /**
     * @type {Products}
     */
    product: Products;
    /**
     * @type {number}
     */
    quantity: number;
    /**
     * @type {Validities}
     */
    validity?: Validities;
    /**
     * @type {?number}
     */
    price?: number;
    /**
     * @type {?string}
     */
    tag?: string;
};


/**
 * Represents parameters for order margin.
 *
 * @remarks
 * This interface defines the order parameters required to fetch order margins.
 *
 * @public
 * @name MarginOrder
 */

export type MarginOrder = {
    /**
     * Name of the exchange(eg. NSE, BSE, NFO, CDS, MCX)
     */
    exchange: Exchanges;
    /**
     * Trading symbol of the instrument
     */
    tradingsymbol: string;
    /**
     * eg. BUY, SELL
     */
    transaction_type: TransactionTypes;
    /**
     * Order variety (regular, amo, bo, co etc.)
     */
    variety: Varieties;
    /**
     * Margin product to use for the order
     */
    product: Products;
    /**
     * Order type (MARKET, LIMIT etc.)
     */
    order_type: OrderTypes;
    /**
     * Quantity of the order
     */
    quantity: number;
    /**
     * Price at which the order is going to be placed (LIMIT orders)
     */
    price: number;
    /**
     * Trigger price (for SL, SL-M, CO orders)
     */
    trigger_price: number;
  };

/**
 * Represents parameters for virtual contract margin.
 *
 * @remarks
 * This interface defines the order parameters required to fetch virtual contract margin.
 *
 * @public
 * @name VirtualContractParam
 */

 export type VirtualContractParam = {
    /**
     * Unique order ID (It can be any random string to calculate charges for an imaginary order)
     */
    order_id: number | string;
    /**
     * Name of the exchange(eg. NSE, BSE, NFO, CDS, MCX)
     */
    exchange: Exchanges;
    /**
     * Trading symbol of the instrument
     */
    tradingsymbol: string;
    /**
     * eg. BUY, SELL
     */
    transaction_type: TransactionTypes;
    /**
     * Order variety (regular, amo, bo, co etc.)
     */
    variety: Varieties;
    /**
     * Margin product to use for the order
     */
    product: Products;
    /**
     * Order type (MARKET, LIMIT etc.)
     */
    order_type: OrderTypes;
    /**
     * Quantity of the order
     */
    quantity: number;
    /**
     * Average price at which the order was executed (Note: Should be non-zero).
     */
    average_price: number;
  };