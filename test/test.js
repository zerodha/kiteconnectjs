"use strict";

const nock = require("nock");
const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");
const KiteConnect = require("../lib/connect.js");

const mockDir = "./kiteconnect-mocks";

// run testsuite
testSuite();

function parseJson(fileName){
    // read and parse mock json file
    var rawdata = fs.readFileSync(path.join(__dirname, mockDir, fileName));
    var mockData= JSON.parse(rawdata);
    return mockData;
}

function testSuite(){

    var kc = new KiteConnect({"api_key":"your api_key"});

    // Chaining the mock requests
    nock(kc.root)
      // getProfile
      .get("/user/profile")
      .reply(200, parseJson("profile.json"))

      // getMargins
      .get("/user/margins")
      .reply(200, parseJson("margins.json"))
      
      // getMargins(segment)
      .get("/user/margins/test")
      .query({ segment: "test" })
      .reply(200, parseJson("margins_equity.json"))

      // placeOrder
      .post("/orders/test")
      .reply(200, parseJson("order_response.json"))

      // modifyOrder
      .put("/orders/test/100")
      .reply(200, parseJson("order_modify.json"))

      // cancelOrder
      .delete("/orders/test/100")
      .query({ variety: "test", order_id: 100 })
      .reply(200, parseJson("order_cancel.json"))

      // getOrders
      .get("/orders")
      .reply(200, parseJson("orders.json"))

      // getOrderHistory
      .get("/orders/100")
      .query({ order_id: "100" })
      .reply(200, parseJson("order_info.json"))

      // getTrades
      .get("/trades")
      .reply(200, parseJson("trades.json"))

      // getOrderTrades
      .get("/orders/100/trades")
      .query({ order_id: 100 })
      .reply(200, parseJson("order_trades.json"))

      // getHoldings
      .get("/portfolio/holdings")
      .reply(200, parseJson("holdings.json"))

      // getHoldings
      .get("/portfolio/holdings/auctions")
      .reply(200, parseJson("auctions_list.json"))

      // getPositions
      .get("/portfolio/positions")
      .reply(200, parseJson("positions.json"))

      // convertPosition
      .put("/portfolio/positions")
      .reply(200, parseJson("convert_position.json"))

      // placeMFOrder
      .post("/mf/orders")
      .reply(200, parseJson("mf_order_response.json"))

      // cancelMFOrder
      .delete("/mf/orders/100")
      .query({ order_id: 100 })
      .reply(200, parseJson("mf_order_cancel.json"))

      // getMFOrders
      .get("/mf/orders")
      .reply(200, parseJson("mf_orders.json"))

      // getMFOrders(order_id)
      .get("/mf/orders/100")
      .query({ order_id: 100 })
      .reply(200, parseJson("mf_orders_info.json"))

      // placeMFSIP
      .post("/mf/sips")
      .reply(200, parseJson("mf_sip_place.json"))

      // modifyMFSIP
      .put("/mf/sips/100")
      .reply(200, parseJson("mf_sip_modify.json"))

      // cancelMFSIP
      .delete("/mf/sips/100")
      .query({ sip_id: 100 })
      .reply(200, parseJson("mf_sip_cancel.json"))

      // getMFSIPS
      .get("/mf/sips")
      .reply(200, parseJson("mf_sips.json"))

      // getMFSIPS(sip_id)
      .get("/mf/sips/100")
      .query({ sip_id: 100 })
      .reply(200, parseJson("mf_sip_info.json"))

      // getMFHoldings
      .get("/mf/holdings")
      .reply(200, parseJson("mf_holdings.json"))

      // getHistoricalData
      .get("/instruments/historical/100/minute")
      .query({ instrument_token: "100" , interval: "minute",
      from: "2022-06-01 09:15:00", to: "2022-06-01 15:30:00",
      continuous: 0, oi:0})
      .reply(200, parseJson("historical_minute.json"))

      // getQuote
      .get("/quote")
      .query({ i:"NSE:INFY"})
      .reply(200, parseJson("quote.json"))

      // getLTP
      .get("/quote/ltp")
      .query({ i: "NSE:INFY" })
      .reply(200, parseJson("ltp.json"))

      // getOHLC
      .get("/quote/ohlc")
      .query({ i:"NSE:INFY"})
      .reply(200, parseJson("quote.json"))

      // placeGTT
      .post("/gtt/triggers")
      .reply(200, parseJson("gtt_place_order.json"))

      // modifyGTT
      .put("/gtt/triggers/100")
      .reply(200, parseJson("gtt_modify_order.json"))

      // deleteGTT
      .delete("/gtt/triggers/100")
      .query({ trigger_id: 100 })
      .reply(200, parseJson("gtt_delete_order.json"))

      // getGTTs
      .get("/gtt/triggers")
      .reply(200, parseJson("gtt_get_orders.json"))

      // getGTT(trigger_id)
      .get("/gtt/triggers/100")
      .query({ trigger_id:100})
      .reply(200, parseJson("gtt_get_order.json"))

      // orderMargins
      .post("/margins/orders")
      .query({ mode: null })
      .reply(200, parseJson("order_margins.json"))


    // fetch user profile detail
    describe("getProfile", function() {
        it("fetch user profile detail", (done) => {
            kc.getProfile()
            .then(function(response) {
                expect(response).to.have.property("user_id");
                expect(response).to.have.property("user_name");
                return done();
            }).catch(done); 
        })
    });
    
    // fetch user fund detail
    describe("getMargins", function() {
        it("fetch equity and commodity segment funds", (done) => {
            kc.getMargins()
            .then(function(response) {
                expect(response).to.have.property("equity");
                expect(response).to.have.property("commodity");
                return done();
            }).catch(done); 
        })
        it("fetch equity specific segment funds", (done) => {
            kc.getMargins("test")
            .then(function(response) {
                expect(response).to.have.property("enabled");
                return done();
            }).catch(done); 
        })
    });

    // Order APIs 
    // Place market and limit order
    describe("placeOrder", function() {
        it("Place market order", (done) => {
            kc.placeOrder("test", {
                "exchange": "NSE",
                "tradingsymbol": "SBIN",
                "transaction_type": "BUY",
                "quantity": 1,
                "product": "MIS",
                "order_type": "MARKET"})
            .then(function(response) {
                expect(response).to.have.property("order_id");
                return done();
            }).catch(done); 
        })
    });

    // modify open pending order
    describe("modifyOrder", function() {
        it("Modify an open order", (done) => {
            kc.modifyOrder("test", 100,{
                "price":10})
            .then(function(response) {
                expect(response).to.have.property("order_id");
                return done();
            }).catch(done); 
        })
    });

    // cancel an open pending order
    describe("cancelOrder", function() {
        it("cancel an open pending order", (done) => {
            kc.cancelOrder("test", 100)
            .then(function(response) {
                expect(response).to.have.property("order_id");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve complete orderbook
    describe("getOrders", function() {
        it("Retrieve the list of all orders under orderbook", (done) => {
            kc.getOrders()
            .then(function(response) {
                expect(response).to.be.an("array");
                expect(response).to.have.nested.property("[0].order_id");
                expect(response).to.have.nested.property("[0].status");
                expect(response).to.have.nested.property("[0].tradingsymbol");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve the history of a given order
    describe("getOrderHistory", function() {
        it("Retrieve the history of a given order", (done) => {
            kc.getOrderHistory(100)
            .then(function(response) {
                expect(response).to.have.nested.property("[0].order_id");
                expect(response).to.have.nested.property("[0].status");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve the list of all executed trades
    describe("getTrades", function() {
        it("Retrieve the list of all executed trades for the day", (done) => {
            kc.getTrades()
            .then(function(response) {
                expect(response).to.be.an("array");
                expect(response).to.have.nested.property("[0].order_id");
                expect(response).to.have.nested.property("[0].exchange_timestamp");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve all the trades generated by an order
    describe("getOrderTrades", function() {
        it("Retrieve all the trades generated by an order", (done) => {
            kc.getOrderTrades(100)
            .then(function(response) {
                expect(response).to.be.an("array");
                return done();
            }).catch(done); 
        })
    });

    // Portfolio APIs
    // Retrieve the list of equity holdings
    describe("getHoldings", function() {
        it("Retrieve the list of equity holdings", (done) => {
            kc.getHoldings()
            .then(function(response) {
                expect(response).to.be.an("array");
                expect(response).to.have.nested.property("[0].tradingsymbol");
                expect(response).to.have.nested.property("[0].average_price");
                return done();
            }).catch(done); 
        })
    });

    // Retrieves list of available instruments for a auction session
    describe("getAuctionInstruments", function() {
        it("Retrieves list of available instruments for a auction session", (done) => {
            kc.getAuctionInstruments()
            .then(function(response) {
                expect(response).to.be.an("array");
                expect(response).to.have.nested.property("[0].auction_number");
                expect(response).to.have.nested.property("[0].instrument_token");
                expect(response).to.have.nested.property("[0].tradingsymbol");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve the list of positions
    describe("getPositions", function() {
        it("Retrieve the list of positions", (done) => {
            kc.getPositions()
            .then(function(response) {
                expect(response).to.have.property("net");
                expect(response).to.have.property("day");
                return done();
            }).catch(done); 
        })
    });

    // convert existing position
    describe("convertPosition", function() {
        it("convert existing position", (done) => {
            kc.convertPosition ({
                "tradingsymbol": "SBIN",
                "exchange":"NSE",
                "transaction_type":"BUY",
                "position_type":"day",
                "quantity":1,
                "old_product":"CNC",
                "new_product":"MIS"
            })
            .then(function(response) {
                expect(response).to.equal(true);
                return done();
            }).catch(done); 
        })
    });

    // MF APIs
    // Place MF Order
    describe("placeMFOrder", function() {
        it("Place MF order", (done) => {
            kc.placeMFOrder({
                "tradingsymbol": "INF174K01LS2",
                "transaction_type": "BUY",
                "amount" : 1000})
            .then(function(response) {
                expect(response).to.have.property("order_id");
                return done();
            }).catch(done); 
        })
    });

    // cancel an open pending MF order
    describe("cancelMFOrder", function() {
        it("cancel an open pending MF order", (done) => {
            kc.cancelMFOrder(100)
            .then(function(response) {
                expect(response).to.have.property("order_id");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve the list of all MF orders (open and executed) over the last 7 days 
    describe("getMFOrders", function() {
        it("Retrieve the list of all MF orders from orderbook", (done) => {
            kc.getMFOrders()
            .then(function(response) {
                expect(response).to.be.an("array")
                return done();
            }).catch(done); 
        })
    });

    // Retrieve the detail of a given MF order
    describe("getMFOrders", function() {
        it("Retrieve the detail of a given MF order", (done) => {
            kc.getMFOrders(100)
            .then(function(response) {
                expect(response).to.have.property("order_timestamp");
                expect(response).to.have.property("status");
                return done();
            }).catch(done); 
        })
    });

    // Place MF SIP Order
    describe("placeMFSIP", function() {
        it("Place MF SIP Order", (done) => {
            kc.placeMFSIP({
                "tradingsymbol": "INF174K01LS2",
                "frequency" : "monthly",
                "instalment_day": 1,
                "instalments" : -1,
                "initial_amount" : 5000,
                "amount" : 1000
            })
            .then(function(response) {
                expect(response).to.have.property("sip_id");
                return done();
            }).catch(done); 
        })
    });

    // modify open pending MF SIP order
    describe("modifyMFSIP", function() {
        it("modify open pending NF SIP order", (done) => {
            kc.modifyMFSIP(100,{
                "instalments":12})
            .then(function(response) {
                expect(response).to.have.property("sip_id");
                return done();
            }).catch(done); 
        })
    });

    // cancel an open pending MF SIP order
    describe("cancelMFSIP", function() {
        it("cancel an open pending MF SIP order", (done) => {
            kc.cancelMFSIP(100)
            .then(function(response) {
                expect(response).to.have.property("sip_id");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve complete SIP orderbook
    describe("getMFSIPS", function() {
        it("Retrieve complete SIP orderbook", (done) => {
            kc.getMFSIPS()
            .then(function(response) {
                expect(response).to.be.an("array");
                expect(response).to.have.nested.property("[0].status");
                expect(response).to.have.nested.property("[0].created");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve the detail of a given SIP order
    describe("getMFSIPS", function() {
        it("Retrieve the detail of a given SIP order", (done) => {
            kc.getMFSIPS(100)
            .then(function(response) {
                expect(response).to.have.property("status");
                expect(response).to.have.property("created");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve complete MF holdings
    describe("getMFHoldings", function() {
        it("Retrieve complete MF holdings", (done) => {
            kc.getMFHoldings()
            .then(function(response) {
                expect(response).to.be.an("array");
                expect(response).to.have.nested.property("[0].folio");
                expect(response).to.have.nested.property("[0].fund");
                return done();
            }).catch(done); 
        })
    });

    // Historical candle APIs
    describe("getHistoricalData", function() {
        // for intraday candle
        it("Fetch historical data for minute(intraday) candle", (done) => {
            kc.getHistoricalData(100, "minute", 
                "2022-06-01 09:15:00", "2022-06-01 15:30:00")
            .then(function(response) {
                expect(response).to.have.nested.property("[0].date");
                expect(response).to.have.nested.property("[0].open");
                expect(response).to.have.nested.property("[0].close");
                expect(response).to.have.nested.property("[0].volume");
                return done();
            }).catch(done); 
        })
    });

    // Market quotes and instruments
    // Retrieve full market quotes for instruments
    describe("getQuote", function() {
        it("Retrieve full market quotes for instruments", (done) => {
            kc.getQuote("NSE:INFY")
            .then(function(response) {
                expect(response).to.have.property("NSE:INFY");
                expect(response).to.have.nested.property("NSE:INFY.last_price");
                expect(response).to.have.nested.property("NSE:INFY.depth");
                expect(response).to.have.nested.property("NSE:INFY.ohlc");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve LTP quotes for instruments
    describe("getLTP", function() {
        it("Retrieve LTP quotes for instruments", (done) => {
            kc.getLTP("NSE:INFY")
            .then(function(response) {
                expect(response).to.have.property("NSE:INFY");
                expect(response).to.have.nested.property("NSE:INFY.instrument_token");
                expect(response).to.have.nested.property("NSE:INFY.last_price");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve OHLC quotes for instruments
    describe("getOHLC", function() {
        it("Retrieve OHLC quotes for instruments", (done) => {
            kc.getOHLC("NSE:INFY")
            .then(function(response) {
                expect(response).to.have.property("NSE:INFY");
                expect(response).to.have.nested.property("NSE:INFY.last_price");
                expect(response).to.have.nested.property("NSE:INFY.ohlc");
                return done();
            }).catch(done); 
        })
    });

    // GTT APIs
    // Place a GTT
    describe("placeGTT", function() {
        it("Place an GTT OCO order", (done) => {
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
                expect(response).to.have.property("trigger_id");
                return done();
            }).catch(done); 
        })
    });

    //Retrieve a list of all GTTs visible in GTT order book
    describe("getGTTs", function() {
        it("Fetch list of all GTTs visible in GTT order book", (done) => {
            kc.getGTTs()
            .then(function(response) {
                expect(response).to.have.nested.property("[0].id");
                expect(response).to.have.nested.property("[0].created_at");
                expect(response).to.have.nested.property("[0].user_id");
                expect(response).to.have.nested.property("[0].status");
                return done();
            }).catch(done); 
        })
    });

    // Retrieve an individual trigger
    describe("getGTT", function() {
        it("Fetch specific gtt order detail using trigger_id", (done) => {
            kc.getGTT(100)
            .then(function(response) {
                expect(response).to.have.property("id");
                expect(response).to.have.property("type");
                expect(response).to.have.property("status");
                expect(response).to.have.property("condition");
                return done();
            }).catch(done); 
        })
    });

    // Modify an active GTT
    describe("modifyGTT", function() {
        it("Modify an open GTT order using trigger_id", (done) => {
            kc.modifyGTT(100, {
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
                expect(response).to.have.property("trigger_id");
                return done();
            }).catch(done); 
        })
    });

    // Delete an active GTT
    describe("deleteGTT", function() {
        it("Delete a GTT using trigger_id", (done) => {
            kc.deleteGTT(100)
            .then(function(response) {
                expect(response).to.have.property("trigger_id");
                return done();
            }).catch(done); 
        })
    });

    // Margin APIs
    // fetch order Margin detail 
    describe("orderMargins", function() {
        it("Fetch order margin detail", (done) => {
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
                expect(response).to.have.nested.property("[0].type");
                expect(response).to.have.nested.property("[0].var");
                expect(response).to.have.nested.property("[0].span");
                expect(response).to.have.nested.property("[0].exposure");
                // Order charges
                expect(response).to.have.nested.property("[0].charges.total");
                expect(response).to.have.nested.property("[0].charges.transaction_tax");
                expect(response).to.have.nested.property("[0].charges.gst.total");
                return done();
            }).catch(done); 
        })
    });
}
