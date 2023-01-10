type KiteConnectParams = {
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
   * Defaults to "https://api.kite.trade"
   */
  root?: string;
  /**
   * Kite connect login url
   *
   * Defaults to "https://kite.trade/connect/login"
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

type Connect = {
  // Constants

  // Products
  PRODUCT_MIS: 'MIS';
  PRODUCT_CNC: 'CNC';
  PRODUCT_NRML: 'NRML';
  PRODUCT_CO: 'CO';
  PRODUCT_BO: 'BO';

  // Order types
  ORDER_TYPE_MARKET: 'MARKET';
  ORDER_TYPE_LIMIT: 'LIMIT';
  ORDER_TYPE_SLM: 'SL-M';
  ORDER_TYPE_SL: 'SL';

  // Varieties
  VARIETY_REGULAR: 'regular';
  VARIETY_BO: 'bo';
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
  cancelMFOrder: (order_id: string) => Promise<{
    status: string;
    data: {
      order_id: string;
    };
  }>;

  /**
   * Cancel a mutual fund SIP.
   * @param sip_id ID of the SIP.
   */
  cancelMFSIP: (sip_id: string) => Promise<{
    status: string;
    data: {
      sip_id: string;
    };
  }>;

  /**
   * Cancel an order
   * @param variety Order variety (ex. bo, co, amo)
   * @param order_id ID of the order.
   * @param params Order params. regular).
   * @returns
   */
  cancelOrder: (
    variety: 'regular' | 'bo' | 'co' | 'amo' | 'iceberg' | 'auction',
    order_id: string,
    params?: {
      /**
       * Parent order id incase of multilegged orders.
       */
      parent_order_id?: string;
    }
  ) => Promise<{
    status: string;
    data: {
      order_id: string;
    };
  }>;

  /**
   * Modify an open position's product type.
   * @param params params.
   */
  convertPosition: (params: {
    /**
     * Exchange in which instrument is listed (NSE, BSE, NFO, BFO, CDS, MCX).
     */
    exchange: 'NSE' | 'BSE' | 'NFO' | 'BFO' | 'CDS' | 'MCX';
    /**
     * Tradingsymbol of the instrument (ex. RELIANCE, INFY).
     */
    tradingsymbol: string;
    /**
     * Transaction type (BUY or SELL).
     */
    transaction_type: 'BUY' | 'SELL';
    /**
     * Position type (overnight, day).
     */
    position_type: 'overnight' | 'day';
    /**
     * Position quantity
     */
    quantity: string;
    /**
     * Current product code (NRML, MIS, CNC).
     */
    old_product: 'NRML' | 'MIS' | 'CNC';
    /**
     * New Product code (NRML, MIS, CNC).
     */
    new_product: 'NRML' | 'MIS' | 'CNC';
  }) => Promise<{
    status: string;
    data: boolean;
  }>;

  /**
   * Get list of order history.
   * @param trigger_id GTT ID
   */
  deleteGTT: (
    trigger_id: string
  ) => Promise<{ status: string; data: { trigger_id: number } }>;

  /**
   * Exit an order
   * @param variety Order variety (ex. bo, co, amo)
   * @param order_id ID of the order.
   * @param params Order params.
   * @returns
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
  ) => Promise<any>;

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
  ) => Promise<{
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
  }>;
};

type KiteConnect = {
  new (params: KiteConnectParams): Connect;
};
