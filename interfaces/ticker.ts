export interface KiteTickerParams {
    api_key?: string;
    access_token?: string;
    reconnect?: boolean;
    max_retry?: number;
    max_delay?: number;
    root: string;
}

export interface KiteTickerInterface extends KiteTickerParams {
    
}