/**
 * 
 * @date 07/06/2023 - 21:38:22
 *
 * @export
 * @interface KiteTickerParams
 * @typedef {KiteTickerParams}
 */
export interface KiteTickerParams {
    /**
     * 
     * @date 07/06/2023 - 21:38:22
     *
     * @type {?string}
     */
    api_key?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:22
     *
     * @type {?string}
     */
    access_token?: string;
    /**
     * 
     * @date 07/06/2023 - 21:38:22
     *
     * @type {?boolean}
     */
    reconnect?: boolean;
    /**
     * 
     * @date 07/06/2023 - 21:38:22
     *
     * @type {?number}
     */
    max_retry?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:22
     *
     * @type {?number}
     */
    max_delay?: number;
    /**
     * 
     * @date 07/06/2023 - 21:38:22
     *
     * @type {string}
     */
    root: string;
}

/**
 * 
 * @date 07/06/2023 - 21:38:22
 *
 * @export
 * @interface KiteTickerInterface
 * @typedef {KiteTickerInterface}
 * @extends {KiteTickerParams}
 */
export interface KiteTickerInterface extends KiteTickerParams {
    
}