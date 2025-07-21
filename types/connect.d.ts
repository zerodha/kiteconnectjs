export type Exchanges =
  | Connect['EXCHANGE_NSE']
  | Connect['EXCHANGE_BSE']
  | Connect['EXCHANGE_NFO']
  | Connect['EXCHANGE_CDS']
  | Connect['EXCHANGE_BCD']
  | Connect['EXCHANGE_BFO']
  | Connect['EXCHANGE_MCX'];

export type TransactionType =
  | Connect['TRANSACTION_TYPE_BUY']
  | Connect['TRANSACTION_TYPE_SELL'];

export type PositionTypes =
  | Connect['POSITION_TYPE_DAY']
  | Connect['POSITION_TYPE_OVERNIGHT'];

export type Product =
  | Connect['PRODUCT_NRML']
  | Connect['PRODUCT_MIS']
  | Connect['PRODUCT_CNC'];

export type OrderType =
  | Connect['ORDER_TYPE_LIMIT']
  | Connect['ORDER_TYPE_MARKET']
  | Connect['ORDER_TYPE_SL']
  | Connect['ORDER_TYPE_SLM'];

export type Variety =
  | Connect['VARIETY_AMO']
  | Connect['VARIETY_AUCTION']
  | Connect['VARIETY_CO']
  | Connect['VARIETY_ICEBERG']
  | Connect['VARIETY_REGULAR'];

export type Validity =
  | Connect['VALIDITY_DAY']
  | Connect['VALIDITY_IOC']
  | Connect['VALIDITY_TTL'];

export type TriggerType = Connect['GTT_TYPE_OCO'] | Connect['GTT_TYPE_SINGLE'];

export type SessionData = {
  /**
   * The unique, permanent user id registered with the broker and the exchanges
   */
  user_id: string;
  /**
   * User's real name
   */
  user_name: string;
  /**
   * Shortened version of the user's real name
   */
  user_shortname: string;
  /**
   * User's email
   */
  email: string;
  /**
   * User's registered role at the broker. This will be `individual` for all retail users
   */
  user_type: string;
  /**
   * The broker ID
   */
  broker: string;
  /**
   * Exchanges enabled for trading on the user's account
   */
  exchanges: string[];
  /**
   * Margin product types enabled for the user
   */
  products: string[];
  /**
   * Order types enabled for the user
   */
  order_types: string[];
  /**
   * The API key for which the authentication was performed
   */
  api_key: string;
  /**
   * The authentication token that's used with every subsequent request
   * Unless this is invalidated using the API, or invalidated by a master-logout
   * from the Kite Web trading terminal, it'll expire at `6 AM` on the next day (regulatory requirement)
   */
  access_token: string;
  /**
   * A token for public session validation where requests may be exposed to the public
   */
  public_token: string;
  /**
   * A token for getting long standing read permissions.
   * This is only available to certain approved platforms
   */
  refresh_token: string;
  /**
   * User's last login time
   */
  login_time: string;
  /**
   * A token for public session validation where requests may be exposed to the public
   */
  meta: {
    /**
     * empty, consent or physical
     */
    demat_consent: string;
  };
  /**
   * Full URL to the user's avatar (PNG image) if there's one
   */
  avatar_url: string;
};

export type Trigger = {
  id: number;
  user_id: string;
  parent_trigger: any;
  type: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  status:
    | 'active'
    | 'triggered'
    | 'disabled'
    | 'expired'
    | 'cancelled'
    | 'rejected'
    | 'deleted';
  condition: {
    exchange: string;
    last_price: number;
    tradingsymbol: string;
    trigger_values: number[];
    instrument_token: number;
  };
  orders: {
    exchange: string;
    tradingsymbol: string;
    product: string;
    order_type: string;
    transaction_type: string;
    quantity: number;
    price: number;
    result: null | {
      account_id: string;
      exchange: string;
      tradingsymbol: string;
      validity: string;
      product: string;
      order_type: string;
      transaction_type: string;
      quantity: number;
      price: number;
      meta: string;
      timestamp: string;
      triggered_at: number;
      order_result: {
        status: string;
        order_id: string;
        rejection_reason: string;
      };
    };
  }[];
  meta: any;
};

export type PortfolioHolding = {
  /**
   * Exchange tradingsymbol of the instrument
   */
  tradingsymbol: string;
  /**
   * Exchange
   */
  exchange: string;
  /**
   * Unique instrument identifier (used for WebSocket subscriptions)
   */
  instrument_token: number;
  /**
   * The standard ISIN representing stocks listed on multiple exchanges
   */
  isin: string;
  /**
   * Margin product applied to the holding
   */
  product: string;
  price: number;
  /**
   * Net quantity (T+1 + realised)
   */
  quantity: number;
  /**
   * Quantity sold from the net holding quantity
   */
  used_quantity: number;
  /**
   * Quantity on T+1 day after order execution. Stocks are usually delivered into DEMAT accounts on T+2
   */
  t1_quantity: number;
  /**
   * Quantity delivered to Demat
   */
  realised_quantity: number;
  /**
   * Quantity authorised at the depository for sale
   */
  authorised_quantity: number;
  /**
   * Date on which user can sell required holding stock
   */
  authorised_date: string;
  /**
   * Quantity carried forward over night
   */
  opening_quantity: number;
  /**
   * Quantity used as collateral
   */
  collateral_quantity: number;
  /**
   * Type of collateral
   */
  collateral_type: string;
  /**
   * Indicates whether holding has any price discrepancy
   */
  discrepancy: boolean;
  /**
   * Average price at which the net holding quantity was acquired
   */
  average_price: number;
  /**
   * Last traded market price of the instrument
   */
  last_price: number;
  /**
   * Closing price of the instrument from the last trading day
   */
  close_price: number;
  /**
   * Net returns on the stock; Profit and loss
   */
  pnl: number;
  /**
   * Day's change in absolute value for the stock
   */
  day_change: number;
  /**
   * Day's change in percentage for the stock
   */
  day_change_percentage: number;
};

export type Instrument = {
  /**
   * Numerical identifier used for subscribing to live market quotes with the WebSocket API.
   */
  instrument_token: string;
  /**
   * The numerical identifier issued by the exchange representing the instrument.
   */
  exchange_token: string;
  /**
   * Exchange tradingsymbol of the instrument
   */
  tradingsymbol: string;
  /**
   * Name of the company (for equity instruments)
   */
  name: string;
  /**
   * Last traded market price
   */
  last_price: number;
  /**
   * Expiry date (for derivatives)
   */
  expiry: Date;
  /**
   * Strike (for options)
   */
  strike: number;
  /**
   * Value of a single price tick
   */
  tick_size: number;
  /**
   * Quantity of a single lot
   */
  lot_size: number;
  /**
   * EQ, FUT, CE, PE
   */
  instrument_type: 'EQ' | 'FUT' | 'CE' | 'PE';
  /**
   * Segment the instrument belongs to
   */
  segment: string;
  /**
   * Exchange
   */
  exchange: Exchanges;
};

export type HistoricalData = {
  /**
   * Timestamp of the candle
   */
  date: Date;
  /**
   * Opening price
   */
  open: number;
  /**
   * Highest price
   */
  high: number;
  /**
   * Lowest price
   */
  low: number;
  /**
   * Closing price
   */
  close: number;
  /**
   * Volume traded
   */
  volume: number;
  /**
   * Open Interest (only for F&O instruments)
   */
  oi?: number;
};

export type UserMargin = {
  /**
   * Indicates whether the segment is enabled for the user
   */
  enabled: boolean;
  /**
   * Net cash balance available for trading (`intraday_payin` + `adhoc_margin` + `collateral`)
   */
  net: number;
  available: {
    /**
     * Additional margin provided by the broker
     */
    adhoc_margin: number;
    /**
     * Raw cash balance in the account available for trading (also includes `intraday_payin`)
     */
    cash: number;
    /**
     * Opening balance at the day start
     */
    opening_balance: number;
    /**
     * Current available balance
     */
    live_balance: number;
    /**
     * Margin derived from pledged stocks
     */
    collateral: number;
    /**
     * Amount that was deposited during the day
     */
    intraday_payin: number;
  };
  utilised: {
    /**
     * Sum of all utilised margins (unrealised M2M + realised M2M + SPAN + Exposure + Premium + Holding sales)
     */
    debits: number;
    /**
     * Exposure margin blocked for all open F&O positions
     */
    exposure: number;
    /**
     * Booked intraday profits and losses
     */
    m2m_realised: number;
    /**
     * Un-booked (open) intraday profits and losses
     */
    m2m_unrealised: number;
    /**
     * Value of options premium received by shorting
     */
    option_premium: number;
    /**
     * Funds paid out or withdrawn to bank account during the day
     */
    payout: number;
    /**
     * SPAN margin blocked for all open F&O positions
     */
    span: number;
    /**
     * Value of holdings sold during the day
     */
    holding_sales: number;
    /**
     * Utilised portion of the maximum turnover limit (only applicable to certain clients)
     */
    turnover: number;
    /**
     * Margin utilised against pledged liquidbees ETFs and liquid mutual funds
     */
    liquid_collateral: number;
    /**
     * Margin utilised against pledged stocks/ETFs
     */
    stock_collateral: number;
    /**
     * Margin blocked when you sell securities (20% of the value of stocks sold) from your demat or T1 holdings
     */
    delivery: number;
  };
};

export type MFHolding = {
  /**
   * Folio number generated by AMC for the completed purchase order (null incase of SELL order)
   */
  folio: null | string;
  /**
   * Allotted NAV price for a completed BUY order; Selling NAV price for completed SELL order
   */
  average_price: number;
  /**
   * Last available NAV price of the fund
   */
  last_price: number;
  /**
   * Date for which last NAV is available
   */
  last_price_date: string;
  pledged_quantity: number;
  /**
   * Name of the fund
   */
  fund: string;
  /**
   * ISIN of the fund.
   */
  tradingsymbol: string;
  /**
   * Net returns of the holding. Based on the last available NAV price.
   */
  pnl: number;
  /**
   * Quantity available in the client's holding for this ISIN.
   */
  quantity: number;
};

export type MFInstrument = {
  /**
   * ISIN of the fund
   */
  tradingsymbol: string;
  /**
   * AMC code as per the exchange
   */
  amc: string;
  /**
   * Fund name
   */
  name: string;
  purchase_allowed: boolean;
  redemption_allowed: boolean;
  /**
   * Minimum purchase amount for the first BUY
   */
  minimum_purchase_amount: number;
  /**
   * Buy amount should be in multiple of this value
   */
  purchase_amount_multiplier: number;
  /**
   * Minimum additional BUY amount
   */
  minimum_additional_purchase_amount: number;
  /**
   * Minimum SELL quantity
   */
  minimum_redemption_quantity: number;
  /**
   * SELL quantity multiple
   */
  redemption_quantity_multiplier: number;
  /**
   * `growth` or `payout`
   */
  dividend_type: string;
  /**
   * `equity`, `debt`, `elss`
   */
  scheme_type: string;
  /**
   * `direct` or `regular`
   */
  plan: string;
  /**
   * Settlement type of the fund (`T1`, `T2` etc.)
   */
  settlement_type: string;
  /**
   * Last available NAV price of the fund
   */
  last_price: number;
  /**
   * Last available NAV's date
   */
  last_price_date: Date;
};

export type MFOrder = {
  /**
   * Unique order id
   */
  order_id: string;
  /**
   * Exchange generated order id
   */
  exchange_order_id: null | string;
  /**
   * ISIN of the fund
   */
  tradingsymbol: string;
  /**
   * Current status of the order.
   * Most common values or COMPLETE, REJECTED, CANCELLED, and OPEN. There may be other values as well
   */
  status: null | string;
  /**
   * Textual description of the order's status. Failed orders come with human readable explanation
   */
  status_message: null | string;
  /**
   * Folio number generated by AMC for the completed purchase order
   */
  folio: null | string;
  /**
   * FRESH or ADDITIONAL (null incase of SELL order)
   */
  /**
   * Name of the fund
   */
  fund: string;
  /**
   * Date at which the order was registered by the API
   */
  order_timestamp: Date;
  /**
   * Date on which the order was registered by the exchange. Orders that don't reach the exchange have null timestamps
   */
  exchange_timestamp: Date;
  /**
   * Exchange settlement ID
   */
  settlement_id: string;
  /**
   * BUY or SELL
   */
  transaction_type: string;
  /**
   * Amount placed for purchase of units
   */
  amount: number;
  /**
   * Order variety (regular, sip)
   */
  variety: string;
  /**
   * FRESH or ADDITIONAL (null incase of SELL order)
   */
  purchase_type: null | string;
  /**
   * Number of units allotted or sold
   */
  quantity: number;
  /**
   * Buy or sell price
   */
  price: number;
  /**
   * Last available NAV price of the fund
   */
  last_price: number;
  /**
   * Allotted or sold NAV price
   */
  average_price: number;
  /**
   * Id of the user that placed the order
   */
  placed_by: string;
  /**
   * Date for which last NAV is available
   */
  last_price_date: string;
  /**
   * Tag that was sent with an order to identify it (alphanumeric, max 8 chars)
   */
  tag: any;
};

export type MFSIP = {
  /**
   * Unique SIP id
   */
  sip_id: string;
  /**
   * ISIN of the fund.
   */
  tradingsymbol: string;
  /**
   * Name of the fund
   */
  fund: string;
  /**
   * Dividend type (growth, payout)
   */
  dividend_type: string;
  /**
   * BUY or SELL
   */
  transaction_type: string;
  /**
   * ACTIVE, PAUSED or CANCELLED
   */
  status: string;
  /**
   * Date at which the SIP was registered by the API
   */
  created: Date;
  /**
   * Frequency at which order is triggered (monthly, weekly, or quarterly)
   */
  frequency: string;
  /**
   * Upcoming instalment date
   */
  next_instalment: string;
  /**
   * Amount worth of units to purchase in each instalment
   */
  instalment_amount: number;
  /**
   * Number of instalments (-1 in case of SIPs active until cancelled)
   */
  instalments: number;
  /**
   * Date at which the last instalment was triggered
   */
  last_instalment: Date;
  /**
   * Number of instalments pending (-1 in case of SIPs active until cancelled)
   */
  pending_instalments: number;
  /**
   * Calendar day in a month on which SIP order to be triggered (valid only incase of frequency monthly, else 0)
   */
  instalment_day: number;
  /**
   * Total number of completed instalments from the start
   */
  completed_instalments: number;
  /**
   * Tag that was sent with an order to identify it (alphanumeric, max 8 chars)
   */
  tag: string;
  sip_reg_num: null | string;
  trigger_price: number;
  step_up: Record<string, number>;
  sip_type: string;
};

export type Order = {
  /**
   * Unique order ID
   */
  order_id: string;
  /**
   * Order ID of the parent order (only applicable in case of multi-legged orders like CO)
   */
  parent_order_id: null | string;
  /**
   * Exchange generated order ID. Orders that don't reach the exchange have null IDs
   */
  exchange_order_id: null | string;
  /**
   * ID of the user that placed the order. This may different from the user's ID for orders placed outside of Kite, for instance, by dealers at the brokerage using dealer terminals
   */
  placed_by: string;
  /**
   * Order variety (regular, amo, co etc.)
   */
  variety: string;
  /**
   * Current status of the order. Most common values or COMPLETE, REJECTED, CANCELLED, and OPEN. There may be other values as well.
   */
  status: string;
  /**
   * Exchange tradingsymbol of the of the instrument
   */
  tradingsymbol: string;
  /**
   * Exchange
   */
  exchange: string;
  /**
   * The numerical identifier issued by the exchange representing the instrument. Used for subscribing to live market data over WebSocket
   */
  instrument_token: number;
  /**
   * BUY or SELL
   */
  transaction_type: string;
  /**
   * Order type (MARKET, LIMIT etc.)
   */
  order_type: string;
  /**
   * Margin product to use for the order (margins are blocked based on this) ?
   */
  product: string;
  /**
   * Order validity
   */
  validity: string;
  /**
   * Price at which the order was placed (LIMIT orders)
   */
  price: number;
  /**
   * Quantity ordered
   */
  quantity: number;
  /**
   * Trigger price (for SL, SL-M, CO orders)
   */
  trigger_price: number;
  /**
   * Average price at which the order was executed (only for COMPLETE orders)
   */
  average_price: number;
  /**
   * Pending quantity to be filled
   */
  pending_quantity: number;
  /**
   * Quantity that's been filled
   */
  filled_quantity: number;
  /**
   * Quantity to be disclosed (may be different from actual quantity) to the public exchange orderbook. Only for equities
   */
  disclosed_quantity: number;
  /**
   * Date at which the order was registered by the API
   */
  order_timestamp: Date;
  /**
   * Date at which the order was registered by the exchange. Orders that don't reach the exchange have null timestamps
   */
  exchange_timestamp: null | Date;
  /**
   * Timestamp at which an order's state changed at the exchange
   */
  exchange_update_timestamp: null | string;
  /**
   * Textual description of the order's status. Failed orders come with human readable explanation
   */
  status_message: null | string;
  /**
   * Raw textual description of the failed order's status, as received from the OMS
   */
  status_message_raw: null | string;
  /**
   * Quantity that's cancelled
   */
  cancelled_quantity: number;
  /**
   * Map of arbitrary fields that the system may attach to an order.
   */
  meta: object | string;
  /**
   * An optional tag to apply to an order to identify it (alphanumeric, max 20 chars)
   */
  tag: null | string;
  tags?: string[];
  /**
   * Unusable request id to avoid order duplication
   */
  guid: string;
  /**
   * 0 or 1
   */
  market_protection: number;
};

export type Trade = {
  /**
   * Exchange generated trade ID
   */
  trade_id: string;
  /**
   * Unique order ID
   */
  order_id: string;
  /**
   * Exchange generated order ID
   */
  exchange_order_id: null | string;
  /**
   * Exchange tradingsymbol of the of the instrument
   */
  tradingsymbol: string;
  /**
   * Exchange
   */
  exchange: string;
  /**
   * The numerical identifier issued by the exchange representing the instrument.
   * Used for subscribing to live market data over WebSocket
   */
  instrument_token: number;
  /**
   * BUY or SELL
   */
  transaction_type: string;
  /**
   * Margin product to use for the order (margins are blocked based on this) ?
   */
  product: string;
  /**
   * Price at which the quantity was filled
   */
  average_price: number;
  /**
   * Filled quantity
   */
  filled: number;
  quantity: number;
  /**
   * Date at which the trade was filled at the exchange
   */
  fill_timestamp: Date;
  /**
   * Date at which the order was registered by the API
   */
  order_timestamp: Date;
  /**
   * Date at which the order was registered by the exchange
   */
  exchange_timestamp: Date;
};

export type Position = {
  /**
   * Exchange tradingsymbol of the instrument
   */
  tradingsymbol: string;
  /**
   * Exchange
   */
  exchange: string;
  /**
   * The numerical identifier issued by the exchange representing the instrument. Used for subscribing to live market data over WebSocket
   */
  instrument_token: number;
  /**
   * Margin product applied to the position
   */
  product: string;
  /**
   * Quantity held
   */
  quantity: number;
  /**
   * Quantity held previously and carried forward over night
   */
  overnight_quantity: number;
  /**
   * The quantity/lot size multiplier used for calculating P&Ls.
   */
  multiplier: number;
  /**
   * Average price at which the net position quantity was acquired
   */
  average_price: number;
  /**
   * Closing price of the instrument from the last trading day
   */
  close_price: number;
  /**
   * Last traded market price of the instrument
   */
  last_price: number;
  /**
   * Net value of the position
   */
  value: number;
  /**
   * Net returns on the position; Profit and loss
   */
  pnl: number;
  /**
   * Mark to market returns (computed based on the last close and the last traded price)
   */
  m2m: number;
  /**
   * Unrealised intraday returns
   */
  unrealised: number;
  /**
   * Realised intraday returns
   */
  realised: number;
  /**
   * Quantity bought and added to the position
   */
  buy_quantity: number;
  /**
   * Average price at which quantities were bought
   */
  buy_price: number;
  /**
   * Net value of the bought quantities
   */
  buy_value: number;
  /**
   * Mark to market returns on the bought quantities
   */
  buy_m2m: number;
  /**
   * Quantity bought and added to the position during the day
   */
  day_buy_quantity: number;
  /**
   * Average price at which quantities were bought during the day
   */
  day_buy_price: number;
  /**
   * Net value of the quantities bought during the day
   */
  day_buy_value: number;
  /**
   * Quantity sold off from the position
   */
  sell_quantity: number;
  /**
   * Average price at which quantities were sold
   */
  sell_price: number;
  /**
   * Net value of the sold quantities
   */
  sell_value: number;
  /**
   * Mark to market returns on the sold quantities
   */
  sell_m2m: number;
  /**
   * Quantity sold off from the position during the day
   */
  day_sell_quantity: number;
  /**
   * Average price at which quantities were sold during the day
   */
  day_sell_price: number;
  /**
   * Net value of the quantities sold during the day
   */
  day_sell_value: number;
};

export type Margin = {
  /**
   * equity/commodity
   */
  type: string;
  /**
   * Trading symbol of the instrument
   */
  tradingsymbol: string;
  /**
   * Name of the exchange
   */
  exchange: string;
  /**
   * SPAN margins
   */
  span: number;
  /**
   * Exposure margins
   */
  exposure: number;
  /**
   * Option premium
   */
  option_premium: number;
  /**
   * Additional margins
   */
  additional: number;
  /**
   * BO margins
   */
  bo: number;
  /**
   * Cash credit
   */
  cash: number;
  /**
   * VAR
   */
  var: number;
  pnl: {
    /**
     * Realised profit and loss
     */
    realised: number;
    /**
     * Unrealised profit and loss
     */
    unrealised: number;
  };
  /**
   * Margin leverage allowed for the trade
   */
  leverage: number;
  /**
   * The breakdown of the various charges that will be applied to an order
   */
  charges: {
    /**
     * Total charges
     */
    total: number;
    /**
     * Tax levied for each transaction on the exchanges
     */
    transaction_tax: number;
    /**
     * Type of transaction tax
     */
    transaction_tax_type: string;
    /**
     * Charge levied by the exchange on the total turnover of the day
     */
    exchange_turnover_charge: number;
    /**
     * Charge levied by SEBI on the total turnover of the day
     */
    sebi_turnover_charge: number;
    /**
     * The brokerage charge for a particular trade
     */
    brokerage: number;
    /**
     * Duty levied on the transaction value by Government of India
     */
    stamp_duty: number;
    gst: {
      /**
       * Integrated Goods and Services Tax levied by the government
       */
      igst: number;
      /**
       * Central Goods and Services Tax levied by the government
       */
      cgst: number;
      /**
       * State Goods and Services Tax levied by the government
       */
      sgst: number;
      /**
       * Total GST
       */
      total: number;
    };
  };
  /**
   * Total margin block
   */
  total: number;
};

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
  transaction_type: TransactionType;
  /**
   * Order variety (regular, amo, bo, co etc.)
   */
  variety: Variety;
  /**
   * Margin product to use for the order
   */
  product: Product;
  /**
   * Order type (MARKET, LIMIT etc.)
   */
  order_type: OrderType;
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
  transaction_type: TransactionType;
  /**
   * Order variety (regular, amo, bo, co etc.)
   */
  variety: Variety;
  /**
   * Margin product to use for the order
   */
  product: Product;
  /**
   * Order type (MARKET, LIMIT etc.)
   */
  order_type: OrderType;
  /**
   * Quantity of the order
   */
  quantity: number;
  /**
   * Average price at which the order was executed (Note: Should be non-zero).
   */
  average_price: number;
};

export type VirtualContractResponse = {
  /**
   * Transaction type of the order (e.g., BUY, SELL)
   */
  transaction_type: string;
  /**
  * Symbol of the instrument
  */
  tradingsymbol: string;
  /**
  * Exchange on which the order was placed
  */
  exchange: string;
  /**
  * Type of order variety (e.g., regular)
  */
  variety: string;
  /**
  * Type of product (e.g., CNC)
  */
  product: string;
  /**
  * Type of order placed (e.g., MARKET)
  */
  order_type: string;
  /**
  * Quantity of the order
  */
  quantity: number;
  /**
  * Price at which the order was placed
  */
  price: number;
  /**
  * Details of charges incurred for the order
  */
  charges: {
      /**
      * Transaction tax amount
      */
      transaction_tax: number;
      /**
      * Type of transaction tax (e.g., STT)
      */
      transaction_tax_type: string;
      /**
      * Exchange turnover charge
      */
      exchange_turnover_charge: number;
      /**
      * SEBI turnover charge
      */
      sebi_turnover_charge: number;
      /**
      * Brokerage charge
      */
      brokerage: number;
      /**
      * Stamp duty charge
      */
      stamp_duty: number;
      /**
      * GST charges
      */
      gst: {
          /**
          * Integrated GST amount
          */
          igst: number;
          /**
          * Central GST amount
          */
          cgst: number;
          /**
          * State GST amount
          */
          sgst: number;
          /**
          * Total GST amount
          */
          total: number;
      };
      /**
      * Total charges incurred for the order
      */
      total: number;
   };
}

export type GTTParams = {
  /**
   * GTT type, its either self.GTT_TYPE_OCO or self.GTT_TYPE_SINGLE.
   */
  trigger_type: TriggerType;
  /**
   * Tradingsymbol of the instrument (ex. RELIANCE, INFY).
   */
  tradingsymbol: string;
  /**
   * Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
   */
  exchange: Exchanges;
  /**
   * List of trigger values, number of items depends on trigger type.
   */
  trigger_values: number[];
  /**
   * Price at which trigger is created. This is usually the last price of the instrument.
   */
  last_price: number;
  orders: {
    /**
     * Transaction type (BUY or SELL).
     */
    transaction_type: TransactionType;
    /**
     * Order quantity
     */
    quantity: number;
    /**
     * Product code (NRML, MIS, CNC).
     */
    product: Product;
    /**
     * Order type (LIMIT, SL, SL-M, MARKET).
     */
    order_type: OrderType;
    /**
     * Order price.
     */
    price: number;
  }[];
};

export type KiteConnectParams = {
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
  access_token?: string;
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
   * Defaults to 'https://kite.trade/connect/login'
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

export type Connect = {
  // Constants

  // Products
  PRODUCT_MIS: 'MIS';
  PRODUCT_CNC: 'CNC';
  PRODUCT_NRML: 'NRML';

  // Order types
  ORDER_TYPE_MARKET: 'MARKET';
  ORDER_TYPE_LIMIT: 'LIMIT';
  ORDER_TYPE_SLM: 'SL-M';
  ORDER_TYPE_SL: 'SL';

  // Varieties
  VARIETY_REGULAR: 'regular';
  VARIETY_CO: 'co';
  VARIETY_AMO: 'amo';
  VARIETY_ICEBERG: 'iceberg';
  VARIETY_AUCTION: 'auction';

  // Transaction types
  TRANSACTION_TYPE_BUY: 'BUY';
  TRANSACTION_TYPE_SELL: 'SELL';

  // Validities
  VALIDITY_DAY: 'DAY';
  VALIDITY_IOC: 'IOC';
  VALIDITY_TTL: 'TTL';

  // Exchanges
  EXCHANGE_NSE: 'NSE';
  EXCHANGE_BSE: 'BSE';
  EXCHANGE_NFO: 'NFO';
  EXCHANGE_CDS: 'CDS';
  EXCHANGE_BCD: 'BCD';
  EXCHANGE_BFO: 'BFO';
  EXCHANGE_MCX: 'MCX';

  // Margins segments
  MARGIN_EQUITY: 'equity';
  MARGIN_COMMODITY: 'commodity';

  // Statuses
  STATUS_CANCELLED: 'CANCELLED';
  STATUS_REJECTED: 'REJECTED';
  STATUS_COMPLETE: 'COMPLETE';

  // GTT types
  GTT_TYPE_OCO: 'two-leg';
  GTT_TYPE_SINGLE: 'single';

  // GTT statuses
  GTT_STATUS_ACTIVE: 'active';
  GTT_STATUS_TRIGGERED: 'triggered';
  GTT_STATUS_DISABLED: 'disabled';
  GTT_STATUS_EXPIRED: 'expired';
  GTT_STATUS_CANCELLED: 'cancelled';
  GTT_STATUS_REJECTED: 'rejected';
  GTT_STATUS_DELETED: 'deleted';

  // Position types
  POSITION_TYPE_DAY: 'day';
  POSITION_TYPE_OVERNIGHT: 'overnight';

  // Members

  /**
   * Cancel a mutual fund order.
   * @param order_id ID of the order.
   */
  cancelMFOrder: (order_id: string) => Promise<{ order_id: string }>;

  /**
   * Cancel a mutual fund SIP.
   * @param sip_id ID of the SIP.
   */
  cancelMFSIP: (sip_id: string) => Promise<{ sip_id: string }>;

  /**
   * Cancel an order
   * @param variety Order variety (ex. bo, co, amo)
   * @param order_id ID of the order.
   * @param params Order params. regular).
   */
  cancelOrder: (
    variety: 'regular' | 'bo' | 'co' | 'amo' | 'iceberg' | 'auction',
    order_id: number | string,
    params?: {
      /**
       * Parent order id incase of multilegged orders.
       */
      parent_order_id?: string;
    }
  ) => Promise<{ order_id: string }>;

  /**
   * Modify an open position's product type.
   * @param params params.
   */
  convertPosition: (params: {
    /**
     * Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
     */
    exchange: Exchanges;
    /**
     * Tradingsymbol of the instrument (ex. RELIANCE, INFY).
     */
    tradingsymbol: string;
    /**
     * Transaction type (BUY or SELL).
     */
    transaction_type: TransactionType;
    /**
     * Position type (overnight, day).
     */
    position_type: PositionTypes;
    /**
     * Position quantity
     */
    quantity: string | number;
    /**
     * Current product code (NRML, MIS, CNC).
     */
    old_product: Product;
    /**
     * New Product code (NRML, MIS, CNC).
     */
    new_product: Product;
  }) => Promise<boolean>;

  /**
   * Get list of order history.
   * @param trigger_id GTT ID
   */
  deleteGTT: (trigger_id: number | string) => Promise<{ trigger_id: number }>;

  /**
   * Exit an order
   * @param variety Order variety (ex. bo, co, amo)
   * @param order_id ID of the order.
   * @param params Order params.
   */
  exitOrder: (
    variety: 'regular' | 'bo' | 'co' | 'amo' | 'iceberg' | 'auction',
    order_id: string,
    params?: {
      /**
       * Parent order id incase of multilegged orders.
       */
      parent_order_id?: string;
    }
  ) => Promise<{ order_id: string }>;

  /**
   * Do the token exchange with the `request_token` obtained after the login flow,
   * and retrieve the `access_token` required for all subsequent requests. The response
   * contains not just the `access_token`, but metadata for the user who has authenticated.
   * @param request_token Token obtained from the GET parameters after a successful login redirect.
   * @param api_secret API secret issued with the API key.
   */
  generateSession: (
    request_token: string,
    api_secret: string
  ) => Promise<SessionData>;

  /**
   * Get list of order history.
   * @param trigger_id GTT trigger ID
   */
  getGTT: (trigger_id: number | string) => Promise<Trigger>;

  /**
   * Get GTTs list
   */
  getGTTs: () => Promise<Trigger[]>;

  /**
   * Retrieve historical data (candles) for an instrument.
   * Although the actual response JSON from the API does not have field
   * names such has 'open', 'high' etc., this functin call structures
   * the data into an array of objects with field names. For example:
   *
   * ~~~~
   * [{
   * 	date: '2015-02-10T00:00:00+0530',
   * 	open: 277.5,
   * 	high: 290.8,
   * 	low: 275.7,
   * 	close: 287.3,
   * 	volume: 22589681
   * }, ....]
   * ~~~~
   *
   * @param instrument_token Instrument identifier (retrieved from the instruments()) call.
   * @param interval candle interval (minute, day, 5 minute etc.)
   * @param from_date From date (String in format of 'yyyy-mm-dd HH:MM:SS' or Date object).
   * @param to_date To date (String in format of 'yyyy-mm-dd HH:MM:SS' or Date object).
   * @param continuous is a bool flag to get continuous data for futures and options instruments. Defaults to false.
   * @param oi is a bool flag to include OI data for futures and options instruments. Defaults to false.
   */
  getHistoricalData: (
    instrument_token: number | string,
    interval:
      | 'minute'
      | 'day'
      | '3minute'
      | '5minute'
      | '10minute'
      | '15minute'
      | '30minute'
      | '60minute',
    from_date: string | Date,
    to_date: string | Date,
    continuous?: boolean,
    oi?: boolean
  ) => Promise<HistoricalData[]>;

  /**
   * Retrieve the list of equity holdings.
   */
  getHoldings: () => Promise<PortfolioHolding[]>;

  /**
   * Retrieve the list of market instruments available to trade.
   * Note that the results could be large, several hundred KBs in size,
   * with tens of thousands of entries in the list.
   * Response is array for objects. For example
   * ~~~~
   * 	{
   * 		instrument_token: '131098372',
   *		exchange_token: '512103',
   *		tradingsymbol: 'NIDHGRN',
   *		name: 'NIDHI GRANITES',
   *		last_price: '0.0',
   *		expiry: '',
   *		strike: '0.0',
   *		tick_size: '0.05',
   *		lot_size: '1',
   *		instrument_type: 'EQ',
   *		segment: 'BSE',
   *		exchange: 'BSE' }, ...]
   * ~~~~
   *
   * @param exchange Filter instruments based on exchange (NSE, BSE, NFO, BFO, CDS, MCX). If no `segment` is specified, all instruments are returned.
   */
  getInstruments: (exchange?: Exchanges) => Promise<Instrument[]>;

  /**
   * Get the remote login url to which a user should be redirected to initiate the login flow.
   */
  getLoginURL: () => string;

  /**
   * Retrieve LTP for list of instruments.
   * @param instruments is a list of instruments, Instrument are in the format of `exchange:tradingsymbol`.
   * For example NSE:INFY and for list of instruments ['NSE:RELIANCE', 'NSE:SBIN', ..]
   */
  getLTP: (instruments: string | string[]) => Promise<
    Record<
      string,
      {
        /**
         * The numerical identifier issued by the exchange representing the instrument.
         */
        instrument_token: number;
        /**
         * Last traded market price
         */
        last_price: number;
      }
    >
  >;

  /**
   * Get account balance and cash margin details for a particular segment.
   * @param segment trading segment (eg: equity or commodity).
   */
  getMargins: (segment?: 'equity' | 'commodity') => Promise<{
    equity?: UserMargin;
    commodity?: UserMargin;
  }>;

  /**
   * Get list of mutual fund holdings.
   */
  getMFHoldings: () => Promise<MFHolding[]>;

  /**
   * Get list of mutual fund instruments.
   */
  getMFInstruments: () => Promise<MFInstrument[]>;

  /**
   * Get list of mutual fund orders.
   * If no `order_id` is specified, all orders for the day are returned.
   * @param order_id ID of the order (optional) whose order details are to be retrieved.
   */
  getMFOrders: (order_id?: string) => Promise<MFOrder | MFOrder[]>;

  /**
   * Get list of mutual fund SIPS.
   * If no `sip_id` is specified, all active and paused SIPs are returned.
   * @param sip_id ID of the SIP (optional) whose details are to be retrieved.
   */
  getMFSIPS: (sip_id?: string) => Promise<MFSIP | MFSIP[]>;

  /**
   * Retrieve OHLC for list of instruments.
   * @param instruments is a list of instruments, Instrument are in the format of `exchange:tradingsymbol`.
   * For example NSE:INFY and for list of instruments ['NSE:RELIANCE', 'NSE:SBIN', ..]
   */
  getOHLC: (instruments: string | string[]) => Promise<
    Record<
      string,
      {
        /**
         * The numerical identifier issued by the exchange representing the instrument.
         */
        instrument_token: number;
        /**
         * Last traded market price
         */
        last_price: number;
        ohlc: {
          /**
           * Price at market opening
           */
          open: number;
          /**
           * Highest price today
           */
          high: number;
          /**
           * Lowest price today
           */
          low: number;
          /**
           * Closing price of the instrument from the last trading day
           */
          close: number;
        };
      }
    >
  >;

  /**
   * Get list of order history.
   * @param order_id ID of the order whose order details to be retrieved.
   */
  getOrderHistory: (order_id: number | string) => Promise<Order[]>;

  /**
   * Get list of orders.
   */
  getOrders: () => Promise<Order[]>;

  /**
   * Retrieve the list of trades a particular order).
   * An order can be executed in tranches based on market conditions.
   * These trades are individually recorded under an order.
   * @param order_id ID of the order whose trades are to be retrieved.
   */
  getOrderTrades: (order_id: number | string) => Promise<Trade[]>;

  /**
   * Retrieve positions.
   */
  getPositions: () => Promise<{
    net: Position[];
    day: Position[];
  }>;

  /**
   * Get user profile details.
   */
  getProfile: () => Promise<{
    /**
     * The unique, permanent user id registered with the broker and the exchanges
     */
    user_id: string;
    /**
     * User's real name
     */
    user_name: string;
    /**
     * Shortened version of the user's real name
     */
    user_shortname: string;
    /**
     * User's email
     */
    email: string;
    /**
     * User's registered role at the broker. This will be individual for all retail users
     */
    user_type: string;
    /**
     * The broker ID
     */
    broker: string;
    /**
     * Exchanges enabled for trading on the user's account
     */
    exchanges: string[];
    /**
     * Margin product types enabled for the user
     */
    products: string[];
    /**
     * Order types enabled for the user
     */
    order_types: string[];
    meta: {
      /**
       * demat_consent: empty, consent or physical
       */
      demat_consent: string;
    };
    /**
     * Full URL to the user's avatar (PNG image) if there's one
     */
    avatar_url: null | string;
  }>;

  /**
   * Retrieve quote and market depth for list of instruments.
   * @param instruments is a list of instruments, Instrument are in the format of `exchange:tradingsymbol`.
   * For example NSE:INFY and for list of instruments ['NSE:RELIANCE', 'NSE:SBIN', ..]
   */
  getQuote: (instruments: string | string[]) => Promise<
    Record<
      string,
      {
        /**
         * The numerical identifier issued by the exchange representing the instrument.
         */
        instrument_token: number;
        /**
         * The exchange timestamp of the quote packet
         */
        timestamp: string;
        /**
         * Last trade timestamp
         */
        last_trade_time: null | string;
        /**
         * Last traded market price
         */
        last_price: number;
        /**
         * Volume traded today
         */
        volume: number;
        /**
         * The volume weighted average price of a stock at a given time during the day?
         */
        average_price: number;
        /**
         * Total quantity of buy orders pending at the exchange
         */
        buy_quantity: number;
        /**
         * Total quantity of sell orders pending at the exchange
         */
        sell_quantity: number;
        /**
         * Total number of outstanding contracts held by market participants exchange-wide (only F&O)
         */
        open_interest?: number;
        /**
         * Last traded quantity
         */
        last_quantity: number;
        ohlc: {
          /**
           * Price at market opening
           */
          open: number;
          /**
           * Highest price today
           */
          high: number;
          /**
           * Lowest price today
           */
          low: number;
          /**
           * Closing price of the instrument from the last trading day
           */
          close: number;
        };

        /**
         * The absolute change from yesterday's close to last traded price
         */
        net_change: number;
        /**
         * The current lower circuit limit
         */
        lower_circuit_limit: number;
        /**
         * The current upper circuit limit
         */
        upper_circuit_limit: number;
        /**
         * The Open Interest for a futures or options contract ?
         */
        oi: number;
        /**
         * The highest Open Interest recorded during the day
         */
        oi_day_high: number;
        /**
         * The lowest Open Interest recorded during the day
         */
        oi_day_low: number;
        depth: {
          buy: {
            /**
             * Price at which the depth stands
             */
            price: number;
            /**
             * Number of open BUY (bid) orders at the price
             */
            orders: number;
            /**
             * Net quantity from the pending orders
             */
            quantity: number;
          }[];
          sell: {
            /**
             * Price at which the depth stands
             */
            price: number;
            /**
             * Number of open SELL (ask) orders at the price
             */
            orders: number;
            /**
             * Net quantity from the pending orders
             */
            quantity: number;
          }[];
        };
      }
    >
  >;

  /**
   * Retrieve the list of trades executed.
   */
  getTrades: () => Promise<Trade[]>;

  /**
   * Retrieve the buy/sell trigger range for Cover Orders.
   * @param exchange Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
   * @param tradingsymbol Tranding symbol of the instrument (ex. RELIANCE, INFY).
   * @param transaction_type Transaction type (BUY or SELL).
   */
  getTriggerRange: (
    exchange: Exchanges,
    tradingsymbol: string,
    transaction_type: TransactionType
  ) => Promise<any>;

  /**
   * Kill the session by invalidating the access token.
   * If access_token is passed then it will be set as current access token and get in validated.
   * @param access_token Token to invalidate. Default is the active `access_token`.
   */
  invalidateAccessToken: (access_token?: string) => Promise<boolean>;

  /**
   * Invalidate the refresh token.
   * @param refresh_token Token to invalidate.
   */
  invalidateRefreshToken: (refresh_token: string) => Promise<boolean>;

  /**
   * Modify GTT.
   * @param trigger_id GTT trigger ID.
   * @param params Modify params
   */
  modifyGTT: (
    trigger_id: number | string,
    params: GTTParams
  ) => Promise<{ trigger_id: number }>;

  /**
   * Modify a mutual fund SIP.
   * @param sip_id ID of the SIP.
   * @param params Modify params.
   */
  modifyMFSIP: (
    sip_id: string,
    params: {
      /**
       * Number of instalments to trigger.
       * If set to -1, instalments are triggered at fixed intervals until the SIP is cancelled
       */
      instalments?: number;
      /**
       * Order frequency. weekly, monthly, or quarterly.
       */
      frequency?: 'weekly' | 'monthly' | 'quarterly';
      /**
       * If frequency is monthly, the day of the month (1, 5, 10, 15, 20, 25) to trigger the order on.
       */
      instalment_day?: string;
      /**
       * Pause or unpause an SIP (active or paused).
       */
      status?: 'active' | 'paused';
    }
  ) => Promise<{ sip_id: number }>;

  /**
   * Modify an order
   * @param variety Order variety (ex. bo, co, amo, regular).
   * @param order_id ID of the order.
   * @param params Order modify params.
   */
  modifyOrder: (
    variety: Variety,
    order_id: number | string,
    params: {
      /**
       * Order quantity
       */
      quantity?: number;
      /**
       * Order Price
       */
      price?: number;
      /**
       * Order type (NRML, SL, SL-M, MARKET).
       */
      order_type?: OrderType;
      /**
       * Order validity (DAY, IOC).
       */
      validity?: Validity;
      /**
       * Disclosed quantity
       */
      disclosed_quantity?: number;
      /**
       * Trigger price
       */
      trigger_price?: number;
      /**
       * Parent order id incase of multilegged orders.
       */
      parent_order_id?: string;
    }
  ) => Promise<{ order_id: string }>;

  /**
   * Fetch basket margin for list of orders
   * @param orders Margin fetch orders.
   * @param consider_positions Boolean to consider users positions while calculating margins. Defauls to true
   * @param mode (optional) Compact mode will only give the total margins
   */
  orderBasketMargins: (
    orders: MarginOrder[],
    consider_positions?: boolean,
    mode?: string
  ) => Promise<{
    initial: Margin;
    final: Margin;
    orders: Margin[];
  }>;

  /**
   * Fetch required margin for order/list of orders
   * @param MarginOrder Margin fetch orders.
   * @param mode (optional) Compact mode will only give the total margins
   */
  orderMargins: (orders: MarginOrder[], mode?:string) => Promise<Margin[]>;

  /**
   * Retrieves the virtual contract note for the specified orders.
   * 
   * @param {Order[]} VirtualContractParam - The array of orders for which to retrieve the virtual contract note.
   * @returns {Promise<any>} A Promise that resolves with the virtual contract note.
   */
   getvirtualContractNote: (orders: VirtualContractParam[]) => Promise<VirtualContractResponse[]>;

  /**
   * Place GTT.
   * @param params Place GTT params
   */
  placeGTT: (params: GTTParams) => Promise<{ trigger_id: number }>;

  /**
   * Place a mutual fund order.
   * @param params Order params.
   */
  placeMFOrder: (params: {
    /**
     * Tradingsymbol (ISIN) of the fund.
     */
    tradingsymbol: string;
    /**
     * Transaction type (BUY or SELL).
     */
    transaction_type: TransactionType;
    /**
     * Quantity to SELL. Not applicable on BUYs.
     */
    quantity?: number;
    /**
     * Amount worth of units to purchase. Not applicable on SELLs
     */
    amount?: number;
    /**
     * An optional tag to apply to an order to identify it (alphanumeric, max 20 chars)
     */
    tag?: string;
  }) => Promise<{ order_id: number }>;

  /**
   * Place a mutual fund SIP.
   * @param params SIP params.
   */
  placeMFSIP: (params: {
    /**
     * Tradingsymbol (ISIN) of the fund.
     */
    tradingsymbol: string;
    /**
     * Amount worth of units to purchase.
     */
    amount: number;
    /**
     * Number of instalments to trigger.
     * If set to -1, instalments are triggered at fixed intervals until the SIP is cancelled
     */
    instalments: number;
    /**
     * Order frequency. weekly, monthly, or quarterly.
     */
    frequency: 'weekly' | 'monthly' | 'quarterly';
    /**
     * Amount worth of units to purchase before the SIP starts.
     */
    initial_amount?: number;
    /**
     * If frequency is monthly, the day of the month (1, 5, 10, 15, 20, 25) to trigger the order on.
     */
    instalment_day?: string;
    /**
     * An optional tag to apply to an order to identify it (alphanumeric, max 20 chars)
     */
    tag?: string;
  }) => Promise<{ sip_id: number }>;

  /**
   * Place an order.
   * @param variety Order variety (ex. bo, co, amo, regular).
   * @param params Order params.
   */
  placeOrder: (
    variety: Variety,
    params: {
      /**
       * Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
       */
      exchange: Exchanges;
      /**
       * Tradingsymbol of the instrument (ex. RELIANCE, INFY).
       */
      tradingsymbol: string;
      /**
       * Transaction type (BUY or SELL).
       */
      transaction_type: TransactionType;
      /**
       * Order quantity
       */
      quantity: number;
      /**
       * Product code (NRML, MIS, CNC).
       */
      product: Product;
      /**
       * Order type (LIMIT, SL, SL-M, MARKET).
       */
      order_type: OrderType;
      /**
       * Order validity (DAY, IOC).
       */
      validity?: Validity;
      /**
       * Order Price
       */
      price?: number;
      /**
       * Disclosed quantity
       */
      disclosed_quantity?: number;
      /**
       * Trigger price
       */
      trigger_price?: number;
      /**
       * Square off value (only for bracket orders)
       */
      squareoff?: number;
      /**
       * Stoploss value (only for bracket orders)
       */
      stoploss?: number;
      /**
       * Trailing stoploss value (only for bracket orders)
       */
      trailing_stoploss?: number;
      /**
       * Order validity in minutes for TTL validity orders
       */
      validity_ttl?: number;
      /**
       * Total number of legs for iceberg order variety
       */
      iceberg_legs?: number;
      /**
       * Split quantity for each iceberg leg order
       */
      iceberg_quantity?: number;
      /**
       * A unique identifier for a particular auction
       */
      auction_number?: number;
      /**
       * An optional tag to apply to an order to identify it (alphanumeric, max 20 chars)
       */
      tag?: string;
    }
  ) => Promise<{ order_id: string }>;

  /**
   * Renew access token by active refresh token. Renewed access token is implicitly set.
   * @param refresh_token Token obtained from previous successful login.
   * @param api_secret API secret issued with the API key.
   */
  renewAccessToken: (
    refresh_token: string,
    api_secret: string
  ) => Promise<SessionData>;

  /**
   * Set access_token received after a successful authentication.
   * @param access_token Token obtained in exchange for `request_token`.
   * Once you have obtained `access_token`, you should persist it in a database or session to pass
   * to the Kite Connect class initialisation for subsequent requests.
   */
  setAccessToken: (access_token: string) => void;

  /**
   * Set a callback hook for session (`TokenException` -- timeout, expiry etc.) errors.
   * `access_token` (login session) can become invalid for a number of
   * reasons, but it doesn't make sense for the client to try and catch it during every API call.
   *
   * A callback method that handles session errors can be set here and when the client encounters
   * a token error at any point, it'll be called.
   *
   * This callback, for instance, can log the user out of the UI,
   * clear session cookies, or initiate a fresh login.
   * @param cb Callback
   */
  setSessionExpiryHook: (cb: Function) => void;

  /**
   * Validate postback data checksum
   * @param postback_data Postback data received. Must be an json object with required keys order_id, checksum and order_timestamp
   * @param api_secret Api secret of the app
   */
  validatePostback: (
    postback_data: {
      order_id: string;
      checksum: string;
      order_timestamp: string;
    },
    api_secret: string
  ) => boolean;
};

type KiteConnect = {
  /**
   * @classdesc API client class. In production, you may initialise a single instance of this class per `api_key`.
   * This module provides an easy to use abstraction over the HTTP APIs.
   * The HTTP calls have been converted to methods and their JSON responses.
   * See the **[Kite Connect API documentation](https://kite.trade/docs/connect/v3/)**
   * for the complete list of APIs, supported parameters and values, and response formats.
   *
   * Getting started with API
   * ------------------------
   * ~~~~
   *
   * import { KiteConnect } from 'kiteconnect';
   * 
   * const apiKey = 'your_api_key'
   * const apiSecret = 'your_api_secret'
   * const requestToken = 'your_request_token'
   * 
   * const kc = new KiteConnect({ api_key: apiKey })
   * 
   * async function init() {
   *     try {
   *         await generateSession()
   *         await getProfile()
   *     } catch (err) {
   *         console.error(err)
   *     }
   * }  
   * 
   * async function generateSession() {
   *     try {
   *         const response = await kc.generateSession(requestToken, apiSecret)
   *         kc.setAccessToken(response.access_token)
   *         console.log('Session generated:', response)
   *     } catch (err) {
   *         console.error('Error generating session:', err)
   *     }
   * }
   * 
   * async function getProfile() {
   *     try {
   *         const profile = await kc.getProfile()
   *         console.log('Profile:', profile)
   *     } catch (err) {
   *         console.error('Error getting profile:', err)
   *     }
   * }
   * // Initialize the API calls
   * init();
   * ~~~~
   *
   * @example <caption>Initialize KiteConnect object</caption>
   * const kc = new KiteConnect({ api_key: apiKey })})
   */
  new (params: KiteConnectParams): Connect;
};

declare const KiteConnect: KiteConnect;
export default KiteConnect;