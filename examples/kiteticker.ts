import { KiteTicker } from "kiteconnect";
import { Tick, LTPTick, QuoteTick, FullTick } from "kiteconnect";

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
ticker.on('message', onMessage);

// OPTION 1: Backward compatible (existing code continues to work)
function onTicks(ticks: any[]): void {
    console.log("Ticks", ticks);
}

// OPTION 2: Type-safe approach (recommended)
function onTicks(ticks: Tick[]): void {
    console.log("Ticks", ticks);
    
    // With typed approach:
    ticks.forEach(tick => {
        console.log('Instrument:', tick.instrument_token);
        console.log('Last price:', tick.last_price);
        console.log('Mode:', tick.mode);
        
        if (tick.mode === 'full') {
            const fullTick = tick as FullTick;
            console.log('Volume:', fullTick.volume_traded);
            console.log('OI:', fullTick.oi);
        }
    });
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

function onMessage(binaryData: ArrayBuffer): void {
    console.log("Binary message received", binaryData);
}
