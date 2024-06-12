import { KiteTicker } from "kiteconnect";

const apiKey = 'your_api_key';
const accessToken = 'generated_access_token';

const ticker = new KiteTicker({
    api_key: apiKey,
    access_token: accessToken
});

ticker.connect();
ticker.on('ticks', onTicks);
ticker.on('connect', subscribe);
ticker.on('disconnect', onDisconnect);
ticker.on('error', onError);
ticker.on('close', onClose);
ticker.on('order_update', onTrade);

function onTicks(ticks: any[]): void {
    console.log("Ticks", ticks);
}

function subscribe(): void {
    const tokens = [738561, 256265];
    ticker.subscribe(tokens);
    ticker.setMode(ticker.modeFull, tokens);
}

function onDisconnect(error: Error): void {
    console.log("Closed connection on disconnect", error);
}

function onError(error: Error): void {
    console.log("Closed connection on error", error);
}

function onClose(reason: string): void {
    console.log("Closed connection on close", reason);
}

function onTrade(order: any): void {
    console.log("Order update", order);
}
