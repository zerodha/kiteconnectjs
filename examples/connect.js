var KiteConnect = require("kiteconnect").KiteConnect;

var api_key = "api_key",
	secret = "api_secret",
	request_token = "request_token",
	access_token = "";

var options = {
	"api_key": api_key,
	"debug": false
};

let  kc = new KiteConnect(options);
kc.setSessionExpiryHook(sessionHook);

if(!access_token) {
	kc.generateSession(request_token, secret)
		.then(function(response) {
			console.log("Response", response);
			init();
		})
		.catch(function(err) {
			console.log(err);
		})
} else {
	kc.setAccessToken(access_token);
	init();
}

function init() {
	console.log(kc.getLoginURL())

	getProfile();
	getMargins();
	getMargins("equity");
	getPositions();
	convertPosition();
	getHoldings();
	getOrders();
	getOrderHistory();
	getTrades();
	getOrderTrades();
	getInstruments();
	getInstruments("NFO");
	getQuote(["NSE:RELIANCE"]);
	getOHLC(["NSE:RELIANCE"]);
	getLTP(["NSE:RELIANCE"]);
	getHistoricalData(779521, "day", new Date("2018-01-01 18:05:00"), new Date("2018-01-10 18:05:37"));
	getHistoricalData(779521, "day", "2018-01-01 18:05:00", "2018-01-10 18:05:37");
	getMFInstruments();
	getMFOrders();
	getMFSIPS();

	regularOrderPlace("regular");
	icebergTTLOrderPlace("iceberg");
	modifyOrder("regular");
	cancelOrder("regular");

	getGTT();
	getGTT("some_trigger_id");
	placeGTT();
	modifyGTT();
	deleteGTT("some_trigger_id");

	orderMargins();
	basketMargins();

	invalidateAccessToken()
}

function sessionHook() {
	console.log("User loggedout");
}

function getProfile() {
	kc.getProfile()
		.then(function(response) {
			console.log(response)
		}).catch(function(err) {
			console.log(err);
		});
}

function getMargins(segment) {
	kc.getMargins(segment)
		.then(function(response) {
			console.log(response);
		}).catch(function(err) {
			console.log(err);
		});
}

function getPositions() {
	kc.getPositions()
		.then(function(response) {
			console.log(response);
		}).catch(function(err) {
			console.log(err);
		});
}

function getHoldings() {
	kc.getHoldings()
		.then(function(response) {
			console.log(response);
		}).catch(function(err) {
			console.log(err.response);
		});
}

function getOrders() {
	kc.getOrders()
		.then(function(response) {
			console.log(response);
		}).catch(function(err) {
			console.log(err);
		});
}

function getOrderHistory() {
	kc.getOrders()
		.then(function(response) {
			if (response.length === 0) {
				console.log("No orders.")
				return
			}

			kc.getOrderHistory(response[0].order_id)
				.then(function(response) {
					console.log(response);
				}).catch(function(err) {
					console.log(err);
				});
		}).catch(function(err) {
			console.log(err);
		});
}

function getTrades() {
	kc.getTrades()
		.then(function(response) {
			console.log(response);
		}).catch(function(err) {
			console.log(err);
		});
}

function getOrderTrades() {
	kc.getOrders()
		.then(function(response) {
			var completedOrdersID;
			for (var order of response) {
				if (order.status === kc.STATUS_COMPLETE) {
					completedOrdersID = order.order_id;
					break;
				}
			}

			if (!completedOrdersID) {
				console.log("No completed orders.")
				return
			}

			kc.getOrderTrades(completedOrdersID)
				.then(function(response) {
					console.log(response);
				}).catch(function(err) {
					console.log(err);
				});
		}).catch(function(err) {
			console.log(err);
		});
}

function getInstruments(exchange) {
	kc.getInstruments(exchange).then(function(response) {
		console.log(response);
	}).catch(function(err) {
		console.log(err);
	})
}

function getQuote(instruments) {
	kc.getQuote(instruments).then(function(response) {
		console.log(response);
	}).catch(function(err) {
		console.log(err);
	})
}

function getOHLC(instruments) {
	kc.getOHLC(instruments).then(function(response) {
		console.log(response);
	}).catch(function(err) {
		console.log(err);
	})
}

function getLTP(instruments) {
	kc.getLTP(instruments).then(function(response) {
		console.log(response);
	}).catch(function(err) {
		console.log(err);
	})
}

function getHistoricalData(instrument_token, interval, from_date, to_date, continuous) {
	kc.getHistoricalData(instrument_token, interval, from_date, to_date, continuous)
		.then(function(response) {
			console.log(response);
		}).catch(function(err) {
			console.log(err);
		});
}

function getMFInstruments() {
	kc.getMFInstruments()
		.then(function(response) {
			console.log(response);
		}).catch(function(err) {
			console.log(err);
		});
}

function getMFOrders() {
	kc.getMFOrders()
		.then(function(response) {
			console.log(response);
		}).catch(function(err) {
			console.log(err);
		});
}

function getMFSIPS() {
	kc.getMFSIPS()
		.then(function(response) {
			console.log(response);
		}).catch(function(err) {
			console.log(err);
		});
}

function invalidateAccessToken(access_token) {
	kc.invalidateAccessToken(access_token)
		.then(function(response) {
			console.log(response);
			testOrders();
		}).catch(function(err) {
			console.log(err.response);
		});
}

function regularOrderPlace(variety) {
	kc.placeOrder(variety, {
			"exchange": "NSE",
			"tradingsymbol": "RELIANCE",
			"transaction_type": "BUY",
			"quantity": 1,
			"product": "MIS",
			"order_type": "MARKET"
		}).then(function(resp) {
			console.log(resp);
		}).catch(function(err) {
			console.log(err);
		});
}

function icebergTTLOrderPlace(variety) {
	kc.placeOrder(variety, {
        "exchange": "NSE",
        "tradingsymbol": "SBIN",
        "transaction_type": "BUY",
        "quantity": 1000,
        "product": "CNC",
        "order_type": "LIMIT",
        "validity":"TTL",
        "price":432, 
        "validity_ttl":10,
        "iceberg_legs":5, 
        "iceberg_quantity":200 
    }).then(function(resp) {
        console.log(resp);
    }).catch(function(err) {
        console.log(err);
    });
}

function modifyOrder(variety) {
	var tradingsymbol = "RELIANCE";
	var exchange = "NSE";
	var instrument = exchange + ":" + tradingsymbol;

	function modify(variety, order_id) {
		kc.modifyOrder(variety, order_id, {
			quantity: 2
		}).then(function(resp) {
			console.log(resp);
		}).catch(function(err) {
			console.log(err);
		});
	}

	kc.getLTP([instrument])
		.then(function(resp) {
			kc.placeOrder(variety, {
				"exchange": exchange,
				"tradingsymbol": tradingsymbol,
				"transaction_type": "BUY",
				"quantity": 1,
				"product": "MIS",
				"order_type": "LIMIT",
				"price": resp[instrument].last_price - 5
			}).then(function(resp) {
				modify(variety, resp.order_id);
			}).catch(function(err) {
				console.log("Order place error", err);
			});
		}).catch(function(err) {
			console.log(err);
		});
}

function cancelOrder(variety) {
	var tradingsymbol = "RELIANCE";
	var exchange = "NSE";
	var instrument = exchange + ":" + tradingsymbol;

	function cancel(variety, order_id) {
		kc.cancelOrder(variety, order_id)
			.then(function(resp) {
				console.log(resp);
			}).catch(function(err) {
				console.log(err);
			});
	}

	kc.getLTP([instrument])
		.then(function(resp) {
			kc.placeOrder(variety, {
				"exchange": exchange,
				"tradingsymbol": tradingsymbol,
				"transaction_type": "BUY",
				"quantity": 1,
				"product": "MIS",
				"order_type": "LIMIT",
				"price": resp[instrument].last_price - 5
			}).then(function(resp) {
				cancel(variety, resp.order_id);
			}).catch(function(err) {
				console.log("Order place error", err);
			});
		}).catch(function(err) {
			console.log(err);
		});
}

function getGTT(trigger_id) {
	if (trigger_id) {
		kc.getGTTs().then(function (resp) {
			console.log(resp)
		}).catch(function (error) {
			console.log(error)
		})
	} else {
		kc.getGTT(trigger_id).then(function (resp) {
			console.log(resp)
		}).catch(function (error) {
			console.log(error)
		})
	}
}

function placeGTT() {
	kc.placeGTT({
		trigger_type: kc.GTT_TYPE_OCO,
		tradingsymbol: "SBIN",
		exchange: "NSE",
		trigger_values: [300, 400],
		last_price: 318,
		orders: [{
			transaction_type: kc.TRANSACTION_TYPE_SELL,
			quantity: 1,
			product: kc.PRODUCT_CNC,
			order_type: kc.ORDER_TYPE_LIMIT,
			price: 300
		}, {
			transaction_type: kc.TRANSACTION_TYPE_SELL,
			quantity: 1,
			product: kc.PRODUCT_CNC,
			order_type: kc.ORDER_TYPE_LIMIT,
			price: 400
		}]
	}).then(function (resp) {
		console.log(resp)
	}).catch(function (error) {
		console.log(error)
	})
}

function modifyGTT(trigger_id) {
	kc.modifyGTT(trigger_id, {
		trigger_type: kc.GTT_TYPE_OCO,
		tradingsymbol: "SBIN",
		exchange: "NSE",
		trigger_values: [301, 401],
		last_price: 318,
		orders: [{
			transaction_type: kc.TRANSACTION_TYPE_SELL,
			quantity: 1,
			product: kc.PRODUCT_CNC,
			order_type: kc.ORDER_TYPE_LIMIT,
			price: 300
		}, {
			transaction_type: kc.TRANSACTION_TYPE_SELL,
			quantity: 1,
			product: kc.PRODUCT_CNC,
			order_type: kc.ORDER_TYPE_LIMIT,
			price: 400
		}]
	}).then(function (resp) {
		console.log(resp)
	}).catch(function (error) {
		console.log(error)
	})
}

function deleteGTT(trigger_id) {
	kc.deleteGTT(trigger_id).then(function (resp) {
		console.log(resp)
	}).catch(function (error) {
		console.log(error)
	})
}

function convertPosition() {
	kc.convertPosition({
        exchange:"MCX",
        tradingsymbol:"GOLDPETAL21JUNFUT",
        transaction_type:"BUY",
        position_type:"day",
        quantity:4,
        old_product:"MIS",
        new_product:"NRML"
    }).then(function (resp) {
		console.log(resp)
	}).catch(function (error) {
		console.log(error)
	})
}

function orderMargins() {
	kc.orderMargins([{
        "exchange": "NFO",
        "tradingsymbol": "NIFTY21JUN15400PE",
        "transaction_type": "BUY",
        "variety": "regular",
        "product": "MIS",
        "order_type": "MARKET",
        "quantity": 75
    },
	{
        "exchange": "NFO",
        "tradingsymbol": "NIFTY21JUN14450PE",
        "transaction_type": "SELL",
        "variety": "regular",
        "product": "MIS",
        "order_type": "MARKET",
        "quantity": 150
    }], "compact").then(function(resp) {
			console.log(resp);
		}).catch(function(err) {
            console.log(err); });
}

function basketMargins() {
	kc.orderBasketMargins([{
		"exchange": "NFO",
		"tradingsymbol": "NIFTY21JUN15400PE",
		"transaction_type": "BUY",
		"variety": "regular",
		"product": "MIS",
		"order_type": "MARKET",
		"quantity": 75
	},
	{
		"exchange": "NFO",
		"tradingsymbol": "NIFTY21JUN14450PE",
		"transaction_type": "SELL",
		"variety": "regular",
		"product": "MIS",
		"order_type": "MARKET",
		"quantity": 150
	}], true, "compact").then(function (resp) {
			console.log(resp);
		}).catch(function(err) {
			console.log(err); });
}