const expect = require('chai').expect;
// import kiteconnect file
var KiteConnect = require('../lib/connect.js');
var api_key = "your api_key";
var secret = "your secret_key"
var request_token = "request_token generated post successful login"

var options = {
	"api_key": api_key
};

// generate session
kc = new KiteConnect(options);
kc.generateSession(request_token, secret)
		.then(function(response) {
        })
		.catch(function(err) {
			console.log(err);
        })

// run testsuite
testSuite();

function testSuite(){
    // fetch instruments data
    describe('getInstruments', function() {
        it('Retrieve complete instruments data for exchange', (done) => {
            kc.getInstruments('NSE')
            .then(function(response) {
                expect(response).to.be.an('array');
                expect(response).to.have.nested.property('[0].instrument_token');
                expect(response).to.have.nested.property('[0].exchange_token');
                expect(response).to.have.nested.property('[0].tradingsymbol');
                expect(response).to.have.nested.property('[0].exchange');
                return done();
            }).catch(done); 
        })
    });

    // fetch user profile detail
    describe('getProfile', function() {
        it('fetch user profile detail', (done) => {
            kc.getProfile()
            .then(function(response) {
                expect(response).to.have.property('user_id');
                expect(response).to.have.property('user_name');
                return done();
            }).catch(done); 
        })
    });

    // fetch user fund detail
    describe('getMargins', function() {
        it('fetch all segment funds', (done) => {
            kc.getMargins()
            .then(function(response) {
                expect(response).to.have.property('equity');
                expect(response).to.have.nested.property('equity.enabled');
                return done();
            }).catch(done); 
        })
        it('fetch equity specific segment funds', (done) => {
            kc.getMargins("equity")
            .then(function(response) {
                expect(response).to.have.property('enabled');
                return done();
            }).catch(done); 
        })
    });

    // Market quotes and instruments
    // Retrieve full market quotes for instruments
    describe('getQuote', function() {
        it('Retrieve full market quotes for instruments', (done) => {
            kc.getQuote('NSE:SBIN')
            .then(function(response) {
                expect(response).to.have.property('NSE:SBIN');
                expect(response).to.have.nested.property('NSE:SBIN.last_price');
                expect(response).to.have.nested.property('NSE:SBIN.depth');
                expect(response).to.have.nested.property('NSE:SBIN.ohlc');
                return done();
            }).catch(done); 
        })
    });

    // Retrieve LTP quotes for instruments
    describe('getLTP', function() {
        it('Retrieve LTP quotes for instruments', (done) => {
            kc.getLTP('NSE:SBIN')
            .then(function(response) {
                // assign eq_ltp to be later used for placing limit order
                eq_ltp = response['NSE:SBIN'].last_price;
                expect(response).to.have.property('NSE:SBIN');
                expect(response).to.have.nested.property('NSE:SBIN.instrument_token');
                expect(response).to.have.nested.property('NSE:SBIN.last_price');
                return done();
            }).catch(done); 
        })
    });

    // Retrieve OHLC quotes for instruments
    describe('getOHLC', function() {
        it('Retrieve OHLC quotes for instruments', (done) => {
            kc.getOHLC('NSE:SBIN')
            .then(function(response) {
                expect(response).to.have.property('NSE:SBIN');
                expect(response).to.have.nested.property('NSE:SBIN.last_price');
                expect(response).to.have.nested.property('NSE:SBIN.ohlc');
                return done();
            }).catch(done); 
        })
    });

    // Portfolio APIs
    // Retrieve the list of equity holdings
    describe('getHoldings', function() {
        it('Retrieve the list of equity holdings', (done) => {
            kc.getHoldings()
            .then(function(response) {
                expect(response).to.be.an('array');
                expect(response).to.have.nested.property('[0].tradingsymbol');
                expect(response).to.have.nested.property('[0].average_price');
                expect(response).to.have.nested.property('[0].quantity');
                return done();
            }).catch(done); 
        })
    });

    // Retrieve the list of positions
    describe('getPositions', function() {
        it('Retrieve the list of positions', (done) => {
            kc.getPositions()
            .then(function(response) {
                open_position = response['day'][0]
                expect(response).to.have.property('net');
                expect(response).to.have.property('day');
                return done();
            }).catch(done); 
        })
    });

    // convert existing position
    describe('convertPosition', function() {
        it('convert existing position', (done) => {
            kc.convertPosition ({
                "tradingsymbol": open_position.tradingsymbol,
                "exchange":open_position.exchange,
                "transaction_type":"BUY",
                "position_type":"day",
                "quantity":open_position.quantity,
                "old_product":open_position.product,
                "new_product":"MIS"
            })
            .then(function(response) {
                expect(response).to.have.property('tradingsymbol');
                return done();
            }).catch(done); 
        })
    });

    // Historical candle APIs
    describe('getHistoricalData', function() {
        // for intraday candle
        it('Fetch historical data for minute(intraday) candle', (done) => {
            kc.getHistoricalData(779521, "minute", 
                "2021-02-15 09:15:00", "2021-02-15 17:17:37")
            .then(function(response) {
                expect(response).to.have.nested.property('[0].date');
                expect(response).to.have.nested.property('[0].open');
                expect(response).to.have.nested.property('[0].close');
                expect(response).to.have.nested.property('[0].volume');
                return done();
            }).catch(done); 
        })
        // for day candle
        it('Fetch historical data for day candle', (done) => {
            kc.getHistoricalData(779521, "day", 
                "2021-02-10 09:15:00", "2021-02-15 17:17:37")
            .then(function(response) {
                expect(response).to.have.nested.property('[0].date');
                expect(response).to.have.nested.property('[0].open');
                expect(response).to.have.nested.property('[0].close');
                expect(response).to.have.nested.property('[0].volume');
                return done();
            }).catch(done); 
        })
        // check continuous data
        it('Fetch historical data for continuous data', (done) => {
            kc.getHistoricalData(15495682, "day", 
                "2020-02-10", "2020-05-15", 1)
            .then(function(response) {
                expect(response).to.have.nested.property('[0].date');
                expect(response).to.have.nested.property('[0].open');
                expect(response).to.have.nested.property('[0].close');
                expect(response).to.have.nested.property('[0].volume');
                return done();
            }).catch(done); 
        })
        // check oi data
        it('Fetch oi data for F&O contract', (done) => {
            kc.getHistoricalData(15495682, "day", 
                "2020-02-10", "2020-05-15", 1, 1)
            .then(function(response) {
                expect(response).to.have.nested.property('[0].date');
                expect(response).to.have.nested.property('[0].open');
                expect(response).to.have.nested.property('[0].close');
                expect(response).to.have.nested.property('[0].volume');
                expect(response).to.have.nested.property('[0].oi');
                return done();
            }).catch(done); 
        })
    });

    // MF APIs
    // Retrieve the master list of all mutual funds available on the platform
    describe('getMFInstruments', function() {
        it('Retrieve the master list of all mutual funds', (done) => {
            kc.getMFInstruments()
            .then(function(response) {
                expect(response).to.be.an('array');
                expect(response).to.have.nested.property('[0].tradingsymbol');
                expect(response).to.have.nested.property('[0].amc');
                expect(response).to.have.nested.property('[0].name');
                expect(response).to.have.nested.property('[0].plan');
                return done();
            }).catch(done); 
        })
    });

    // Retrieve the list of all orders (open and executed) over the last 7 days 
    describe('getMFOrders', function() {
        it('Retrieve the list of all orders from orderbook', (done) => {
            kc.getMFOrders()
            .then(function(response) {
                expect(response).to.be.an('array')
                return done();
            }).catch(done); 
        })
    });

    // Order APIs 
    // Place market and limit order
    describe('placeOrder', function() {
        it('Place normal market order', (done) => {
            kc.placeOrder("regular", {
                "exchange": "NSE",
                "tradingsymbol": "SBIN",
                "transaction_type": "BUY",
                "quantity": 1,
                "product": "MIS",
                "order_type": "MARKET"})
            .then(function(response) {
                expect(response).to.have.property('order_id');
                return done();
            }).catch(done); 
        })
        it('Place limit pending order for NSE', (done) => {
            limit_price = Math.ceil((0.98*eq_ltp)/0.05)*0.05;
            kc.placeOrder("regular", {
                "exchange": "NSE",
                "tradingsymbol": "SBIN",
                "transaction_type": "BUY",
                "quantity": 1,
                "product": "CNC",
                // calculate limit_price to place limit pending order
                "price":limit_price,
                "order_type": "LIMIT"})
            .then(function(response) {
                pending_order_id = response.order_id;
                expect(response).to.have.property('order_id');
                return done();
            }).catch(done); 
        })
    });

    // modify open pending order
    describe('modifyOrder', function() {
        it('Modify an open order', (done) => {
            pending_price = Math.ceil((0.96*eq_ltp)/0.05)*0.05;
            kc.modifyOrder("regular", pending_order_id,{
                "price":pending_price})
            .then(function(response) {
                expect(response).to.have.property('order_id');
                return done();
            }).catch(done); 
        })
    });

    // cancel an open pending order
    describe('cancelOrder', function() {
        it('cancel an open pending order', (done) => {
            kc.cancelOrder("regular", pending_order_id)
            .then(function(response) {
                expect(response).to.have.property('order_id');
                return done();
            }).catch(done); 
        })
    });

    // Retrieve complete orderbook
    describe('getOrders', function() {
        it('Retrieve the list of all orders under orderbook', (done) => {
            kc.getOrders()
            .then(function(response) {
                expect(response).to.be.an('array');
                expect(response).to.have.nested.property('[0].order_id');
                expect(response).to.have.nested.property('[0].status');
                expect(response).to.have.nested.property('[0].tradingsymbol');
                expect(response).to.have.nested.property('[0].quantity');
                return done();
            }).catch(done); 
        })
    });

    // Retrieve the list of all executed trades
    describe('getTrades', function() {
        it('Retrieve the list of all executed trades for the day', (done) => {
            kc.getTrades()
            .then(function(response) {
                expect(response).to.be.an('array');
                expect(response).to.have.nested.property('[0].order_id');
                expect(response).to.have.nested.property('[0].exchange_timestamp');
                return done();
            }).catch(done); 
        })
    });

    // Retrieve the history of a given order
    describe('getOrderHistory', function() {
        it('Retrieve the history of a given order', (done) => {
            kc.getOrderHistory(pending_order_id)
            .then(function(response) {
                expect(response).to.have.nested.property('[0].order_id');
                expect(response).to.have.nested.property('[0].status');
                expect(response).to.have.nested.property('[0].order_timestamp');
                return done();
            }).catch(done); 
        })
    });

    // Retrieve all the trades generated by an order
    describe('getOrderTrades', function() {
        it('Retrieve all the trades generated by an order', (done) => {
            kc.getOrderTrades(pending_order_id)
            .then(function(response) {
                expect(response).to.be.an('array').that.is.empty;
                return done();
            }).catch(done); 
        })
    });

    // GTT APIs
    // Place a GTT
    describe('placeGTT', function() {
        it('Place an GTT OCO order', (done) => {
            kc.placeGTT({
                trigger_type: kc.GTT_TYPE_OCO,
                tradingsymbol: "SBIN",
                exchange: "NSE",
                trigger_values: [350, 450],
                last_price: 400,
                orders: [{
                    transaction_type: kc.TRANSACTION_TYPE_SELL,
                    quantity: 1,
                    product: kc.PRODUCT_CNC,
                    order_type: kc.ORDER_TYPE_LIMIT,
                    price: 350
                }, {
                    transaction_type: kc.TRANSACTION_TYPE_SELL,
                    quantity: 1,
                    product: kc.PRODUCT_CNC,
                    order_type: kc.ORDER_TYPE_LIMIT,
                    price: 450
                }]
            }
            )
            .then(function(response) {
                expect(response).to.have.property('trigger_id');
                return done();
            }).catch(done); 
        })
    });

    //Retrieve a list of all GTTs visible in GTT order book
    describe('getGTTs', function() {
        it('Fetch list of all GTTs visible in GTT order book', (done) => {
            kc.getGTTs()
            .then(function(response) {
                // assign gtt_id to be later use for modify and delete GTT order
                gtt_id = response[0].id;
                expect(response).to.have.nested.property('[0].id');
                expect(response).to.have.nested.property('[0].created_at');
                expect(response).to.have.nested.property('[0].user_id');
                expect(response).to.have.nested.property('[0].status');
                return done();
            }).catch(done); 
        })
    });

    // Retrieve an individual trigger
    describe('getGTT', function() {
        it('Fetch specific gtt order detail using trigger_id', (done) => {
            kc.getGTT(gtt_id)
            .then(function(response) {
                expect(response).to.have.property('id');
                expect(response).to.have.property('type');
                expect(response).to.have.property('status');
                expect(response).to.have.property('condition');
                return done();
            }).catch(done); 
        })
    });

    // Modify an active GTT
    describe('modifyGTT', function() {
        it('Modify an open GTT order using trigger_id', (done) => {
            kc.modifyGTT(gtt_id, {
                trigger_type: kc.GTT_TYPE_OCO,
                tradingsymbol: "SBIN",
                exchange: "NSE",
                trigger_values: [358, 458],
                last_price: 400,
                orders: [{
                    transaction_type: kc.TRANSACTION_TYPE_SELL,
                    quantity: 1,
                    product: kc.PRODUCT_CNC,
                    order_type: kc.ORDER_TYPE_LIMIT,
                    price: 358
                }, {
                    transaction_type: kc.TRANSACTION_TYPE_SELL,
                    quantity: 1,
                    product: kc.PRODUCT_CNC,
                    order_type: kc.ORDER_TYPE_LIMIT,
                    price: 458
                }]})
            .then(function(response) {
                expect(response).to.have.property('trigger_id');
                return done();
            }).catch(done); 
        })
    });

    // Delete an active GTT
    describe('deleteGTT', function() {
        it('Delete a GTT using trigger_id', (done) => {
            kc.deleteGTT(gtt_id)
            .then(function(response) {
                expect(response).to.have.property('trigger_id');
                return done();
            }).catch(done); 
        })
    });

    // fetch order Margin detail 
    describe('orderMargins', function() {
        it('Fetch order margin detail', (done) => {
            kc.orderMargins([
                {
                    "exchange": "NSE",
                    "tradingsymbol": "SBIN",
                    "transaction_type": "BUY",
                    "variety": "regular",
                    "product": "MIS",
                    "order_type": "MARKET",
                    "quantity": 1
                }
                ])
            .then(function(response) {
                expect(response).to.have.nested.property('[0].type');
                expect(response).to.have.nested.property('[0].var');
                expect(response).to.have.nested.property('[0].span');
                expect(response).to.have.nested.property('[0].exposure');
                return done();
            }).catch(done); 
        })
    });
} 