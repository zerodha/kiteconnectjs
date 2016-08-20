Kite Connect API client for Javascript -- [https://kite.trade](kite.trade)

Rainmatter (c) 2016

License
-------
KiteConnect Javascript library is licensed under the MIT License

The library
-----------
Kite Connect is a set of REST-like APIs that expose
many capabilities required to build a complete
investment and trading platform. Execute orders in
real time, manage user portfolio, stream live market
data (WebSockets), and more, with the simple HTTP API collection

This module provides an easy to use abstraction over the HTTP APIs.
The HTTP calls have been converted to methods and their JSON responses.
See the **[Kite Connect API documentation](https://kite.trade/docs/connect/v1/)**
for the complete list of APIs, supported parameters and values, and response formats.

Installation
------------
This module is installed via npm:

	npm install --save kiteconnect

Getting started
---------------
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
