# The Kite Connect API Javascript client
The official Javascript node client for communicating with the [Kite Connect API](https://kite.trade).

Kite Connect is a set of REST-like APIs that expose many capabilities required to build a complete investment and trading platform. Execute orders in real time, manage user portfolio, stream live market data (WebSockets), and more, with the simple HTTP API collection

[Rainmatter](http://rainmatter.com) (c) 2016. Licensed under the MIT License.

## Documentation
- [Javascript client documentation](https://kite.trade/docs/kiteconnectjs)
- [Kite Connect HTTP API documentation](https://kite.trade/docs/connect/v1)

Installation
------------
This module is installed via npm:

	npm install --save kiteconnect

Getting started with API
------------------------
	var KiteConnect = require("kiteconnect").KiteConnect;

	var kc = new KiteConnect("your_api_key");

	kc.requestAccessToken("request_token", "api_secret")
		.then(function(response) {
			init();
		})
		.catch(function(err) {
			console.log(err.response);
		})

	function init() {
		// Fetch equity margins.
		// You can have other api calls here.

		kc.margins("equity")
			.then(function(response) {
				// You got user's margin details.
			}).catch(function(err) {
				// Something went wrong.
			});
	}

API promises
-------------
All API calls returns a promise which you can use to call methods like `.then(...)`, `.catch(...)`, and `.finally(...)`.

	kiteConnectApiCall
		.then(function(v) {
		    // On success
		})
		.catch(function(e) {
			// On rejected
		})
		.finally(function(e) {
			// On finish
		});

You can access the full list of [Bluebird Promises API](https://github.com/petkaantonov/bluebird/blob/master/API.md) here.

Getting started WebSocket client
--------------------------------
	var KiteTicker = require("kiteconnect").KiteTicker;
	var ticker = new KiteTicker(api_key, user_id, public_token);

	ticker.connect();
	ticker.on("tick", setTick);
	ticker.on("connect", subscribe);

	function setTick(ticks) {
		console.log("Ticks", ticks);
	}

	function subscribe() {
		var items = [738561];
		ticker.subscribe(items);
		ticker.setMode(ticker.modeFull, items);
	}

Auto re-connect WebSocket client
-------------------------------
```
Available from version 1.2
```
Optionally you can enable client side auto reconnection to automatically reconnect if the connection is dropped.
It is very useful at times when client side network is unreliable and patchy.

All you need to do is enable auto reconnection with preferred interval and time. For example

	// Enable auto reconnect with 5 second interval and retry for maximum of 20 times.
	ticker.autoReconnect(true, 20, 5)

	// You can also set reconnection times to -1 for inifinite reconnections
	ticker.autoReconnect(true, -1, 5)

- Event `reconnecting` is called when auto reconnection is triggered and event callback carries two additional params `reconnection interval set` and `current reconnection count`.

- Event `noreconnect` is called when number of auto reconnections exceeds the maximum reconnection count set. For example if maximum reconnection count is set as `20` then after 20th reconnection this event will be triggered. Also note that the current process is exited when this event is triggered.

- Event `connect` will be triggered again when reconnection succeeds.

Here is an example demonstrating auto reconnection.

	var KiteTicker = require("kiteconnect").KiteTicker;
	var ticker = new KiteTicker(api_key, user_id, public_token);

	// set autoreconnect with 10 maximum reconnections and 5 second interval
	ticker.autoReconnect(true, 10, 5)
	ticker.connect();
	ticker.on("tick", setTick);
	ticker.on("connect", subscribe);

	ticker.on("noreconnect", function() {
		console.log("noreconnect")
	});

	ticker.on("reconnecting", function(reconnect_interval, reconnections) {
		console.log("Reconnecting: attempet - ", reconnections, " innterval - ", reconnect_interval);
	});

	function setTick(ticks) {
		console.log("Ticks", ticks);
	}

	function subscribe() {
		var items = [738561];
		ticker.subscribe(items);
		ticker.setMode(ticker.modeFull, items);
	}

A typical web application
-------------------------
In a typical web application where a new instance of
views, controllers etc. are created per incoming HTTP
request, you will need to initialise a new instance of
Kite client per request as well. This is because each
individual instance represents a single user that's
authenticated, unlike an **admin** API where you may
use one instance to manage many users.

Hence, in your web application, typically:

- You will initialise an instance of the Kite client
- Redirect the user to the `login_url()`
- At the redirect url endpoint, obtain the
`request_token` from the query parameters
- Initialise a new instance of Kite client,
use `request_access_token()` to obtain the `access_token`
along with authenticated user data
- Store this response in a session and use the
stored `access_token` and initialise instances
of Kite client for subsequent API calls.
