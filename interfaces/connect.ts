
/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum ProductTypes {
    PRODUCT_MIS = 'MIS',
    PRODUCT_CNC = 'CNC',
    PRODUCT_CO = 'CO',
    PRODUCT_NRML = 'NRML',
    PRODUCT_BO = 'BO',
};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum Varieties {
    VARIETY_AMO = 'amo',
    VARIETY_AUCTION = 'auction',
    VARIETY_BO = 'bo',
    VARIETY_ICEBERG = 'ice',
    VARIETY_REGULAR = 'regular',
    VARIETY_CO = 'co',
    TEST = 'test'
};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum ValidityTypes {
    VALIDITY_DAY = 'DAY',
    VALIDITY_IOC = 'IOC',
    VALIDITY_TTL = 'TTL',
}

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum MarginTypes {
    MARGIN_EQUITY = 'equity',
    MARGIN_COMMODITY = 'commodity',
}

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum StatusTypes {
    STATUS_CANCELLED = 'CANCELLED',
    STATUS_REJECTED = 'REJECTED',
    STATUS_COMPLETE = 'COMPLETE',
}

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
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
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum PositionTypes {
    POSITION_TYPE_DAY = 'day',
    POSITION_TYPE_OVERNIGHT = 'overnight',
}

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @interface KiteConnectParams
 * @typedef {KiteConnectParams}
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
     * Defaults to 'https?://api.kite.trade'
     */
    root?: string;
    /**
     * Kite connect login url
     *
     * Defaults to 'https?://kite.trade/connect/login'
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
    /*
     * Default url for which user will be redirected to login page
     * defa
     */
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?string}
     */
    default_login_uri?: string;
};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @interface KiteConectInterface
 * @typedef {KiteConectInterface}
 * @extends {KiteConnectParams}
 */
export interface KiteConectInterface extends KiteConnectParams {

};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum ExchangeTypes {
    NSE = 'NSE',
    BSE = 'BPSE',
    NFO = 'NFO',
    BFO = 'BFO',
    CDS = 'CDS',
    MCX = 'MCX'
};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum TransactionTypes {
    BUY = 'BUY',
    SELL = 'SELL'
};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum Products {
    NRML = 'NRML',
    MIS = 'MIS',
    CNC = 'CNC'
};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum OrderTypes {
    LIMIT = 'LIMIT',
    SL = 'SL',
    SLM = 'SL-M',
    MARKET = 'MARKET'
};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @enum {number}
 */
export enum Validities {
    DAY = 'DAY',
    IOC = 'IOC',
};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @interface OrderParams
 * @typedef {OrderParams}
 */
export interface OrderParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?string}
     */
    exchange?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?string}
     */
    tradingsymbol?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?TransactionTypes}
     */
    transaction_type?: TransactionTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    quantity?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?Products}
     */
    product?: Products;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {OrderTypes}
     */
    order_type: OrderTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?Validities}
     */
    validity?: Validities;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    price?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    disclosed_quantity?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    trigger_price?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    squareoff?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    stoploss?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    traling_stoploss?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    validity_ttl?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    iceberg_legs?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    iceberg_quantity?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?number}
     */
    auction_number?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?string}
     */
    tag?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?string}
     */
    variety?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?(string | number)}
     */
    order_id?: string | number;
};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @interface CancelOrderParams
 * @typedef {CancelOrderParams}
 */
export interface CancelOrderParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?(string | number)}
     */
    parent_order_id?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?string}
     */
    variety?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?(string | number)}
     */
    order_id?: string | number;
};

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @interface ExitOrderParams
 * @typedef {ExitOrderParams}
 */
export interface ExitOrderParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?(string | number)}
     */
    parent_order_id?: string | number;
}

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @interface ConvertPositionParams
 * @typedef {ConvertPositionParams}
 */
export interface ConvertPositionParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {string}
     */
    exchange: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {string}
     */
    tradingsymbol: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {TransactionTypes}
     */
    transaction_type: TransactionTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {PositionTypes}
     */
    position_type: PositionTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {(string | number)}
     */
    quantity: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {Products}
     */
    old_product: Products;
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {Products}
     */
    new_product: Products;
}

/**
 * 
 * @date 07/06/2023 - 21:38:13
 *
 * @export
 * @interface Order
 * @typedef {Order}
 */
export interface Order {
    /**
     * 
     * @date 07/06/2023 - 21:38:13
     *
     * @type {?TransactionTypes}
     */
    transaction_type?: TransactionTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    quantity?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?Products}
     */
    product?: Products;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?OrderTypes}
     */
    order_type?: OrderTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?ExchangeTypes}
     */
    exchange?: ExchangeTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?string}
     */
    tradingsymbol?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?Varieties}
     */
    variety?: Varieties;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(number | string)}
     */
    price?: number | string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?number}
     */
    trigger_price?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?PositionTypes}
     */
    position_type?: PositionTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?Products}
     */
    old_product?: Products;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?Products}
     */
    new_product?: Products;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    amount?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?string}
     */
    tag?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    instalments?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?string}
     */
    frequency?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    initial_amount?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    instalment_day?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    status?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    sip_id?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE)}
     */
    trigger_type?: GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?any[]}
     */
    trigger_values?: any[];
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    last_price?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?Order[]}
     */
    orders?: Order[];
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    order_id?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    parent_order_id?: string | number;
}

/**
 * 
 * @date 07/06/2023 - 21:38:12
 *
 * @export
 * @interface getHistoricalDataParms
 * @typedef {getHistoricalDataParms}
 */
export interface getHistoricalDataParms {
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {string}
     */
    instrument_token: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {string}
     */
    interval: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {(string | Date)}
     */
    from_date: string | Date;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {(string | Date)}
     */
    to_date: string | Date;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?boolean}
     */
    continuous?: boolean;
};

/**
 * 
 * @date 07/06/2023 - 21:38:12
 *
 * @export
 * @interface ModifyGTTParams
 * @typedef {ModifyGTTParams}
 */
export interface ModifyGTTParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {(GTTStatusTypes.GTT_TYPE_SINGLE | GTTStatusTypes.GTT_TYPE_OCO)}
     */
    trigger_type: GTTStatusTypes.GTT_TYPE_SINGLE | GTTStatusTypes.GTT_TYPE_OCO;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {string}
     */
    tradingsymbol: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {ExchangeTypes}
     */
    exchange: ExchangeTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {Array<number>}
     */
    trigger_values: Array<number>;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {number}
     */
    last_price: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {{
            transaction_type: string
            quantity: number;
            product: Products;
            order_type: OrderTypes;
            price: number;
        }[]}
     */
    orders: {
        transaction_type: string
        quantity: number;
        product: Products;
        order_type: OrderTypes;
        price: number;
    }[];
};

/**
 * 
 * @date 07/06/2023 - 21:38:12
 *
 * @export
 * @interface ModifyMFSIPParams
 * @typedef {ModifyMFSIPParams}
 */
export interface ModifyMFSIPParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?string}
     */
    instalments?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?string}
     */
    frequency?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?string}
     */
    instalment_day?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?string}
     */
    status?: string;
}

/**
 * 
 * @date 07/06/2023 - 21:38:12
 *
 * @export
 * @interface ModifyOrderParams
 * @typedef {ModifyOrderParams}
 */
export interface ModifyOrderParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?number}
     */
    quantity?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?number}
     */
    price?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?OrderTypes}
     */
    order_type?: OrderTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?Validities}
     */
    validity?: Validities;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?number}
     */
    disclosed_quantity?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?number}
     */
    trigger_price?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    parent_order_id?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?string}
     */
    variety?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    order_id?: string | number;
};

/**
 * 
 * @date 07/06/2023 - 21:38:12
 *
 * @export
 * @interface OrderMarginOrder
 * @typedef {OrderMarginOrder}
 */
export interface OrderMarginOrder {
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {string}
     */
    exchange: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {string}
     */
    tradingsymbol: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {TransactionTypes}
     */
    transaction_type: TransactionTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {Varieties}
     */
    variety: Varieties;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {ProductTypes}
     */
    product: ProductTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {OrderTypes}
     */
    order_type: OrderTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {number}
     */
    quantity: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {number}
     */
    price: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {number}
     */
    trigger_price: number;
};

/**
 * 
 * @date 07/06/2023 - 21:38:12
 *
 * @export
 * @interface PlaceMFOrderParams
 * @typedef {PlaceMFOrderParams}
 */
export interface PlaceMFOrderParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {string}
     */
    tradingsymbol: string
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {TransactionTypes}
     */
    transaction_type: TransactionTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    quantity?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    amount?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?string}
     */
    tag?: string;
}

/**
 * 
 * @date 07/06/2023 - 21:38:12
 *
 * @export
 * @interface PlaceGTTParams
 * @typedef {PlaceGTTParams}
 */
export interface PlaceGTTParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {(GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE)}
     */
    trigger_type: GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {string}
     */
    tradingsymbol: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {ExchangeTypes}
     */
    exchange: ExchangeTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {Array<Number>}
     */
    trigger_values: Array<Number>;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {number}
     */
    last_price: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {{
            transaction_type: TransactionTypes;
            quantity: number;
            product: Products;
            order_type: OrderTypes;
            price: number
        }[]}
     */
    orders: {
        transaction_type: TransactionTypes;
        quantity: number;
        product: Products;
        order_type: OrderTypes;
        price: number
    }[];
};

/**
 * 
 * @date 07/06/2023 - 21:38:12
 *
 * @export
 * @interface PlaceOrderParams
 * @typedef {PlaceOrderParams}
 */
export interface PlaceOrderParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {string}
     */
    tradingsymbol: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?Varieties}
     */
    variety?: Varieties;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?ExchangeTypes}
     */
    exchange?: ExchangeTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {TransactionTypes}
     */
    transaction_type: TransactionTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?OrderTypes}
     */
    order_type?: OrderTypes;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?Products}
     */
    product?: Products;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    quantity?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?(string | number)}
     */
    amount?: string | number;
    /**
     * 
     * @date 07/06/2023 - 21:38:12
     *
     * @type {?string}
     */
    tag?: string;
};