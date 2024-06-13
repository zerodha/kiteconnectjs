import { KiteConnect } from 'kiteconnect';

const apiKey = 'your_api_key';
const apiSecret = 'your_api_secret';
const requestToken = 'your_request_token';

const kc = new KiteConnect({ api_key: apiKey });

async function init() {
    try {
        await generateSession();
        await getProfile();
        await getMargins();
        await getMargins("equity");
        await getPositions();
        await convertPosition();
        await getHoldings();
        await getOrderHistory(240611801793632);
        await getTrades();
        await getOrderTrades(240611801793632);
        await getInstruments();
        await getInstrumentsNFO("NFO");
        await getQuote(['NSE:RELIANCE', 'NSE:SBIN', 'BSE:ONGC']);
        await getOHLC(['NSE:RELIANCE', 'NSE:SBIN', 'BSE:ONGC']);
        await getLTP(['NSE:RELIANCE', 'NSE:SBIN', 'BSE:ONGC']);
        await getHistoricalData(16320514, "day", "2024-05-11 00:00:00", "2024-06-12 00:00:00", true, true);
        await placeRegularOrder();
        await placeIcebergOrder();
        await modifyRegularOrder(240611801793632);
        await cancelRegularOrder(240611801793632);
        await getGTTs();
        await getGTT(216313963);
        await placeGTT();
        await modifyGTT(219118727);
        await deleteGTT(219118727);
        await getOrderMargins();
        await getOrderBasketMargins();
        await getvirtualContractNote();
    } catch (err) {
        console.error(err);
    }
}

async function generateSession() {
    try {
        const response = await kc.generateSession(requestToken, apiSecret);
        kc.setAccessToken(response.access_token);
        console.log('Session generated:', response);
    } catch (err) {
        console.error('Error generating session:', err);
    }
}

async function getProfile() {
    try {
        const profile = await kc.getProfile();
        console.log('Profile:', profile);
    } catch (err) {
        console.error('Error getting profile:', err);
    }
}

async function getMargins(segment?: 'equity' | 'commodity') {
    try {
        const margins = await kc.getMargins(segment);
        console.log('Margins:', margins);
    } catch (err) {
        console.error('Error getting margins:', err);
    }
}

async function getPositions() {
    try {
        const positions = await kc.getPositions();
        console.log('Positions:', positions);
    } catch (err) {
        console.error('Error getting positions:', err);
    }
}

async function convertPosition() {
    try {
        const convertPosition = await kc.convertPosition({
            exchange: kc.EXCHANGE_NSE,
            tradingsymbol: "SBIN",
            transaction_type: "BUY",
            position_type: "day",
            quantity: 4,
            old_product: "MIS",
            new_product: "CNC"
        });
        console.log('Convert Position:', convertPosition);
    } catch (err) {
        console.error('Error converting position:', err);
    }
}

async function getHoldings() {
    try {
        const holdings = await kc.getHoldings();
        console.log('Holdings:', holdings);
    } catch (err) {
        console.error('Error getting holdings:', err);
    }
}

async function getOrderHistory(orderId: number | string) {
    try {
        const orderHistory = await kc.getOrderHistory(orderId);
        console.log('Order History:', orderHistory);
    } catch (err) {
        console.error('Error getting order history:', err);
    }
}

async function getTrades() {
    try {
        const trades = await kc.getTrades();
        console.log('Trades:', trades);
    } catch (err) {
        console.error('Error getting trades:', err);
    }
}

async function getOrderTrades(orderId: number | string) {
    try {
        const orderTrades = await kc.getOrderTrades(orderId);
        console.log('Order Trades:', orderTrades);
    } catch (err) {
        console.error('Error getting order trades:', err);
    }
}

async function getInstruments() {
    try {
        const instruments = await kc.getInstruments();
        console.log('Instruments:', instruments);
    } catch (err) {
        console.error('Error getting instruments:', err);
    }
}

async function getInstrumentsNFO(segment: string) {
    try {
        const instruments = await kc.getInstruments(segment);
        console.log('Instruments:', instruments);
    } catch (err) {
        console.error('Error getting instruments:', err);
    }
}

async function getQuote(instruments: string[]) {
    try {
        const quotes = await kc.getQuote(instruments);
        console.log('Quotes:', quotes);
    } catch (err) {
        console.error('Error getting quotes:', err);
    }
}

async function getOHLC(instruments: string[]) {
    try {
        const ohlc = await kc.getOHLC(instruments);
        console.log('OHLC:', ohlc);
    } catch (err) {
        console.error('Error getting OHLC:', err);
    }
}

async function getLTP(instruments: string[]) {
    try {
        const ltp = await kc.getLTP(instruments);
        console.log('LTP:', ltp);
    } catch (err) {
        console.error('Error getting LTP:', err);
    }
}

async function getHistoricalData(instrumentToken: number, interval: string, from: string, to: string, continuous: boolean, oi: boolean) {
    try {
        const historicalData = await kc.getHistoricalData(instrumentToken, interval, from, to, continuous, oi);
        console.log('Historical Data:', historicalData);
    } catch (err) {
        console.error('Error getting historical data:', err);
    }
}

async function placeRegularOrder() {
    try {
        const order = await kc.placeOrder(kc.VARIETY_REGULAR, {
            exchange: kc.EXCHANGE_NSE,
            tradingsymbol: "SBIN",
            transaction_type: kc.TRANSACTION_TYPE_BUY,
            quantity: 1,
            product: kc.PRODUCT_CNC,
            order_type: kc.ORDER_TYPE_LIMIT,
            price: 830
        });
        console.log('Regular Order Placed:', order);
    } catch (err) {
        console.error('Error placing regular order:', err);
    }
}

async function placeIcebergOrder() {
    try {
        const order = await kc.placeOrder(kc.VARIETY_REGULAR, {
            exchange: kc.EXCHANGE_NSE,
            tradingsymbol: "SBIN",
            transaction_type: "BUY",
            quantity: 1000,
            product: "CNC",
            order_type: "LIMIT",
            validity: "TTL",
            price: 830,
            validity_ttl: 10,
            iceberg_legs: 5,
            iceberg_quantity: 200
        });
        console.log('Iceberg Order Placed:', order);
    } catch (err) {
        console.error('Error placing iceberg order:', err);
    }
}

async function modifyRegularOrder(orderId: number) {
    try {
        const order = await kc.modifyOrder(kc.VARIETY_REGULAR, orderId, {
            price: 818
        });
        console.log('Regular Order Modified:', order);
    } catch (err) {
        console.error('Error modifying regular order:', err);
    }
}

async function cancelRegularOrder(orderId: number) {
    try {
        const order = await kc.cancelOrder(kc.VARIETY_REGULAR, orderId);
        console.log('Regular Order Cancelled:', order);
    } catch (err) {
        console.error('Error cancelling regular order:', err);
    }
}

async function getGTTs() {
    try {
        const gtts = await kc.getGTTs();
        console.log('GTTs:', gtts);
    } catch (err) {
        console.error('Error getting GTTs:', err);
    }
}

async function getGTT(gttId: number) {
    try {
        const gtt = await kc.getGTT(gttId);
        console.log('GTT:', gtt);
    } catch (err) {
        console.error('Error getting GTT:', err);
    }
}

async function placeGTT() {
    try {
        const gtt = await kc.placeGTT({
            trigger_type: kc.GTT_TYPE_OCO,
            tradingsymbol: "SBIN",
            exchange: "NSE",
            trigger_values: [800, 840],
            last_price: 835,
            orders: [{
                transaction_type: kc.TRANSACTION_TYPE_SELL,
                quantity: 1,
                product: kc.PRODUCT_CNC,
                order_type: kc.ORDER_TYPE_LIMIT,
                price: 840
            }, {
                transaction_type: kc.TRANSACTION_TYPE_SELL,
                quantity: 1,
                product: kc.PRODUCT_CNC,
                order_type: kc.ORDER_TYPE_LIMIT,
                price: 800
            }]
        });
        console.log('GTT Placed:', gtt);
    } catch (err) {
        console.error('Error placing GTT:', err);
    }
}

async function modifyGTT(gttId: number) {
    try {
        const gtt = await kc.modifyGTT(gttId, {
            trigger_type: kc.GTT_TYPE_OCO,
            tradingsymbol: "SBIN",
            exchange: "NSE",
            trigger_values: [800, 860],
            last_price: 837,
            orders: [{
                transaction_type: kc.TRANSACTION_TYPE_SELL,
                quantity: 1,
                product: kc.PRODUCT_CNC,
                order_type: kc.ORDER_TYPE_LIMIT,
                price: 860
            }, {
                transaction_type: kc.TRANSACTION_TYPE_SELL,
                quantity: 1,
                product: kc.PRODUCT_CNC,
                order_type: kc.ORDER_TYPE_LIMIT,
                price: 800
            }]
        });
        console.log('GTT Modified:', gtt);
    } catch (err) {
        console.error('Error modifying GTT:', err);
    }
}

async function deleteGTT(gttId: number) {
    try {
        const gtt = await kc.deleteGTT(gttId);
        console.log('GTT Deleted:', gtt);
    } catch (err) {
        console.error('Error deleting GTT:', err);
    }
}

async function getOrderMargins() {
    try {
        const margins = await kc.orderMargins([{
            exchange: "NFO",
            tradingsymbol: "NIFTY24JUL23000CE",
            transaction_type: "BUY",
            variety: "regular",
            product: "MIS",
            order_type: "MARKET",
            quantity: 75,
            price: 0,
            trigger_price: 0
        },
        {
            exchange: "NFO",
            tradingsymbol: "NIFTY24JUL25000CE",
            transaction_type: "SELL",
            variety: "regular",
            product: "MIS",
            order_type: "MARKET",
            quantity: 150,
            price: 0,
            trigger_price: 0
        }], "compact");
        console.log('Order Margins:', margins);
    } catch (err) {
        console.error('Error getting order margins:', err);
    }
}

async function getOrderBasketMargins() {
    try {
        const basketMargins = await kc.orderBasketMargins([{
            exchange: "NFO",
            tradingsymbol: "NIFTY24JUL23000CE",
            transaction_type: "BUY",
            variety: "regular",
            product: "MIS",
            order_type: "MARKET",
            quantity: 75,
            price: 0,
            trigger_price: 0
        },
        {
            exchange: "NFO",
            tradingsymbol: "NIFTY24JUL25000CE",
            transaction_type: "SELL",
            variety: "regular",
            product: "MIS",
            order_type: "MARKET",
            quantity: 150,
            price: 0,
            trigger_price: 0
        }], true, "compact");
        console.log('Order Basket Margins:', basketMargins);
    } catch (err) {
        console.error('Error getting order basket margins:', err);
    }
}

async function getvirtualContractNote() {
    try {
        const getvirtualContractNote = await kc.getvirtualContractNote([{
            order_id: '111111111',
            exchange: "NFO",
            tradingsymbol: "NIFTY24JUL23000CE",
            transaction_type: "BUY",
            variety: "regular",
            product: "MIS",
            order_type: "MARKET",
            quantity: 75,
            average_price: 560
        },
        {
            order_id: '22222222',
            exchange: "NFO",
            tradingsymbol: "NIFTY24JUL25000CE",
            transaction_type: "SELL",
            variety: "regular",
            product: "MIS",
            order_type: "MARKET",
            quantity: 150,
            average_price: 600
        }]);
        console.log('Virtual contract Note:', getvirtualContractNote);
    } catch (err) {
        console.error('Error getting virtual contract note:', err);
    }
}

// Initialize the API calls
init();
