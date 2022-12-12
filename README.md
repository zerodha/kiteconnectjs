# The Kite Connect API Javascript client - v4

The official Javascript node client for communicating with the [Kite Connect API](https://kite.trade).

Kite Connect is a set of REST-like APIs that expose many capabilities required to build a complete investment and trading platform. Execute orders in real time, manage user portfolio, stream live market data (WebSockets), and more, with the simple HTTP API collection.

[Zerodha Technology](http://zerodha.com) (c) 2018. Licensed under the MIT License.

## Documentation

- [Javascript client documentation](https://kite.trade/docs/kiteconnectjs/v3)
- [Kite Connect HTTP API documentation](https://kite.trade/docs/connect/v3)

## Requirements

- NodeJS v8.0.0+

## Installation

Install via [npm](https://www.npmjs.com/package/kiteconnect)

    npm install kiteconnect@latest

Or via Yarn

    yarn add kiteconnect

## Breaking changes - v4

`v4` is a **breaking** major release with multiple internal modification to improve user experience.<br>

Below are the breaking changes:

- Upgrade deps and set minimum nodejs version to 8.0.0+
- Return promise instead of throwing error on generateSession and renewAccessToken
- Handle gtt payload validation and throw proper error
- Change ticker response attributes naming as per [kite connect doc](https://kite.trade/docs/connect/v3/websocket/#quote-packet-structure)

## Getting started with API

```javascript
var KiteConnect = require("kiteconnect").KiteConnect;

var kc = new KiteConnect({
  api_key: "your_api_key",
});

kc.generateSession("request_token", "api_secret")
  .then(function (response) {
    init();
  })
  .catch(function (err) {
    console.log(err);
  });

function init() {
  // Fetch equity margins.
  // You can have other api calls here.
  kc.getMargins()
    .then(function (response) {
      // You got user's margin details.
    })
    .catch(function (err) {
      // Something went wrong.
    });
}
```

## API promises

All API calls returns a promise which you can use to call methods like `.then(...)` and `.catch(...)`.

```javascript
kiteConnectApiCall
  .then(function (v) {
    // On success
  })
  .catch(function (e) {
    // On rejected
  });
```

## Getting started WebSocket client

```javascript
var KiteTicker = require("kiteconnect").KiteTicker;
var ticker = new KiteTicker({
  api_key: "api_key",
  access_token: "access_token",
});

ticker.connect();
ticker.on("ticks", onTicks);
ticker.on("connect", subscribe);

function onTicks(ticks) {
  console.log("Ticks", ticks);
}

function subscribe() {
  var items = [738561];
  ticker.subscribe(items);
  ticker.setMode(ticker.modeFull, items);
}
```

## Auto re-connect WebSocket client

Optionally you can enable client side auto re-connection to automatically reconnect if the connection is dropped.
It is very useful at times when client side network is unreliable and patchy.

All you need to do is enable auto re-connection with preferred interval and time. For example

```javascript
// Enable auto reconnect with 5 second interval and retry for maximum of 20 times.
ticker.autoReconnect(true, 20, 5);

// You can also set re-connection times to -1 for infinite re-connections
ticker.autoReconnect(true, -1, 5);
```

- Event `reconnecting` is called when auto re-connection is triggered and event callback carries two additional params `reconnection interval set` and `current re-connection count`.

- Event `noreconnect` is called when number of auto re-connections exceeds the maximum re-connection count set. For example if maximum re-connection count is set as `20` then after 20th re-connection this event will be triggered. Also note that the current process is exited when this event is triggered.

- Event `connect` will be triggered again when re-connection succeeds.

Here is an example demonstrating auto reconnection.

```javascript
var KiteTicker = require("kiteconnect").KiteTicker;
var ticker = new KiteTicker({
  api_key: "api_key",
  access_token: "access_token",
});

// set autoreconnect with 10 maximum reconnections and 5 second interval
ticker.autoReconnect(true, 10, 5);
ticker.connect();
ticker.on("ticks", onTicks);
ticker.on("connect", subscribe);

ticker.on("noreconnect", function () {
  console.log("noreconnect");
});

ticker.on("reconnecting", function (reconnect_interval, reconnections) {
  console.log(
    "Reconnecting: attempt - ",
    reconnections,
    " innterval - ",
    reconnect_interval
  );
});

function onTicks(ticks) {
  console.log("Ticks", ticks);
}

function subscribe() {
  var items = [738561];
  ticker.subscribe(items);
  ticker.setMode(ticker.modeFull, items);
}
```

## Run unit tests

```
npm run test
```

## Generate documentation

```
$ npm install -g jsdoc
$ jsdoc -r ./lib -d ./docs
```

## Changelog

[Check CHANGELOG.md](CHANGELOG.md)

## A typical web application

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
