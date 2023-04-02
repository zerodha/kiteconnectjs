import { Url } from 'url';

export enum ProductTypes {
    PRODUCT_MIS = 'MIS',
    PRODUCT_CNC = 'CNC',
    PRODUCT_CO = 'CO',
    PRODUCT_NRML = 'NRML',
    PRODUCT_BO = 'BO',
};

export enum OrderTypes {
    ORDER_TYPE_MARKET = 'MARKET',
    ORDER_TYPE_LIMIT = 'LIMIT',
    ORDER_TYPE_SL = 'SL',
    ORDER_TYPE_SLM = 'SLM',
};

export enum Varieties {
    VARIETY_AMO = 'amo',
    VARIETY_AUCTION = 'auction',
    VARIETY_BO = 'bo',
    VARIETY_ICEBERG = 'ice',
    VARIETY_REGULAR = 'regular',
    VARIETY_CO = 'co',
    TEST = 'test'
};

export enum TransactionTypes {
    TRANSACTION_TYPE_BUY = 'buy',
    TRANSACTION_TYPE_SELL = 'sell',
}

export enum ValidityTypes {
    VALIDITY_DAY = 'DAY',
    VALIDITY_IOC = 'IOC',
    VALIDITY_TTL = 'TTL',
}

export enum ExchangeTypes {
    EXCHANGE_NSE = 'NSE',
    EXCHANGE_BSE = 'BSE',
    EXCHANGE_NFO = 'NFO',
    EXCHANGE_CDS = 'CDS',
    EXCHANGE_BCD = 'BCD',
    EXCHANGE_BFO = 'BFO',
    EXCHANGE_MCX = 'MCX',
}

export enum MarginTypes {
    MARGIN_EQUITY = 'equity',
    MARGIN_COMMODITY = 'commodity',
}

export enum StatusTypes {
    STATUS_CANCELLED = 'CANCELLED',
    STATUS_REJECTED = 'REJECTED',
    STATUS_COMPLETE = 'COMPLETE',
}

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

export enum PositionTypes {
    POSITION_TYPE_DAY = 'day',
    POSITION_TYPE_OVERNIGHT = 'overnight',
}

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
    default_login_uri?: string;
};

export interface KiteConectInterface extends KiteConnectParams {

};

export enum ExchangeTypes {
    NSE = 'NSE',
    BSE = 'BPSE',
    NFO = 'NFO',
    BFO = 'BFO',
    CDS = 'CDS',
    MCX = 'MCX'
};

export enum TransactionTypes {
    BUY = 'BUY',
    SELL = 'SELL'
};

export enum Products {
    NRML = 'NRML',
    MIS = 'MIS',
    CNC = 'CNC'
};

export enum OrderTypes {
    LIMIT = 'LIMIT',
    SL = 'SL',
    SLM = 'SL-M',
    MARKET = 'MARKET'
};

export enum Validities {
    DAY = 'DAY',
    IOC = 'IOC',
};

export interface OrderParams {
    exchange?: string;
    tradingsymbol?: string;
    transaction_type?: TransactionTypes;
    quantity?: number;
    product?: Products;
    order_type: OrderTypes;
    validity?: Validities;
    price?: number;
    disclosed_quantity?: number;
    trigger_price?: number;
    squareoff?: number;
    stoploss?: number;
    traling_stoploss?: number;
    validity_ttl?: number;
    iceberg_legs?: number;
    iceberg_quantity?: number;
    auction_number?: number;
    tag?: string;
    variety?: string;
    order_id?: string | number;
};

export interface CancelOrderParams {
    parent_order_id?: string | number;
    variety?: string;
    order_id?: string | number;
};

export interface ExitOrderParams {
    parent_order_id?: string | number;
}

export interface ConvertPositionParams {
    exchange: string;
    tradingsymbol: string;
    transaction_type: TransactionTypes;
    position_type: PositionTypes;
    quantity: string | number;
    old_product: Products;
    new_product: Products;
}

export interface Order {
    transaction_type?: TransactionTypes;
    quantity?: string | number;
    product?: Products;
    order_type?: OrderTypes;
    exchange?: ExchangeTypes;
    tradingsymbol?: string;
    variety?: Varieties;
    price?: number | string;
    trigger_price?: number;
    position_type?: PositionTypes;
    old_product?: Products;
    new_product?: Products;
    amount?: string | number;
    tag?: string;
    instalments?: string | number;
    frequency?: string;
    initial_amount?: string | number;
    instalment_day?: string | number;
    status?: string | number;
    sip_id?: string | number;
    trigger_type?: GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE;
    trigger_values?: any[];
    last_price?: string | number;
    orders?: Order[];
    order_id?: string | number;
    parent_order_id?: string | number;
}

export interface ModifyOrderParams {
    trigger_type?: GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE;
    tradingsymbol?: string;
    exchange?: ExchangeTypes;
    trigger_values?: number[];
    last_price?: number;
    orders?: Order[];
    variety?: string;
    order_id?: string | number;
};

export interface getHistoricalDataParms {
    instrument_token: string;
    interval: string;
    from_date: string | Date;
    to_date: string | Date;
    continuous?: boolean;
};

export interface ModifyGTTParams {
    trigger_type: GTTStatusTypes.GTT_TYPE_SINGLE | GTTStatusTypes.GTT_TYPE_OCO;
    tradingsymbol: string;
    exchange: ExchangeTypes;
    trigger_values: Array<number>;
    last_price: number;
    orders: {
        transaction_type: string
        quantity: number;
        product: Products;
        order_type: OrderTypes;
        price: number;
    }[];
};

export interface ModifyMFSIPParams {
    instalments?: string;
    frequency?: string;
    instalment_day?: string;
    status?: string;
}

export interface ModifyOrderParams {
    quantity?: number;
    price?: number;
    order_type?: OrderTypes;
    validity?: Validities;
    disclosed_quantity?: number;
    trigger_price?: number;
    parent_order_id?: string | number;
};

export interface OrderMarginOrder {
    exchange: string;
    tradingsymbol: string;
    transaction_type: TransactionTypes;
    variety: Varieties;
    product: ProductTypes;
    order_type: OrderTypes;
    quantity: number;
    price: number;
    trigger_price: number;
};

export interface PlaceMFOrderParams {
    tradingsymbol: string
    transaction_type: TransactionTypes;
    quantity?: string | number;
    amount?: string | number;
    tag?: string;
}

export interface PlaceGTTParams {
    trigger_type: GTTStatusTypes.GTT_TYPE_OCO | GTTStatusTypes.GTT_TYPE_SINGLE;
    tradingsymbol: string;
    exchange: ExchangeTypes;
    trigger_values: Array<Number>;
    last_price: number;
    orders: {
        transaction_type: TransactionTypes;
        quantity: number;
        product: Products;
        order_type: OrderTypes;
        price: number
    }[];
};

export interface PlaceOrderParams {
    tradingsymbol: string;
    variety?: Varieties;
    exchange?: ExchangeTypes;
    transaction_type: TransactionTypes;
    order_type?: OrderTypes;
    product?: Products;
    quantity?: string | number;
    amount?: string | number;
    tag?: string;
};