# The Kite Connect API TypeScript/JavaScript Client

The official TypeScript/JavaScript for communicating with the [Kite Connect API](https://kite.trade).

Kite Connect is a set of REST-like APIs that expose many capabilities required to build a complete investment and trading platform. Execute orders in real time, manage user portfolio, stream live market data (WebSockets), and more, with the simple HTTP API collection.

[Zerodha Technology](http://zerodha.com) (c) 2024. Licensed under the MIT License.

## Documentation

- [Typescript client documentation](https://kite.trade/docs/kiteconnectjs/v3)
- [Kite Connect HTTP API documentation](https://kite.trade/docs/connect/v3)

## Requirements

- NodeJS v18.0.0+

## Installation

Install via [npm](https://www.npmjs.com/package/kiteconnect)

    npm install kiteconnect@latest

Or via [yarn](https://yarnpkg.com/package/kiteconnect)

    yarn add kiteconnect

## Getting started with API

```typescript
import { KiteConnect } from "kiteconnect";

const apiKey = "your_api_key";
const apiSecret = "your_api_secret";
const requestToken = "your_request_token";

const kc = new KiteConnect({ api_key: apiKey });

async function init() {
  try {
    await generateSession();
    await getProfile();
  } catch (err) {
    console.error(err);
  }
}

async function generateSession() {
  try {
    const response = await kc.generateSession(requestToken, apiSecret);
    kc.setAccessToken(response.access_token);
    console.log("Session generated:", response);
  } catch (err) {
    console.error("Error generating session:", err);
  }
}

async function getProfile() {
  try {
    const profile = await kc.getProfile();
    console.log("Profile:", profile);
  } catch (err) {
    console.error("Error getting profile:", err);
  }
}
// Initialize the API calls
init();
```

## Getting started WebSocket client

```typescript
import { KiteTicker } from "kiteconnect";

const apiKey = "your_api_key";
const accessToken = "generated_access_token";

const ticker = new KiteTicker({
  api_key: apiKey,
  access_token: accessToken,
});

ticker.connect();
ticker.on("ticks", onTicks);
ticker.on("connect", subscribe);
ticker.on("disconnect", onDisconnect);
ticker.on("error", onError);
ticker.on("close", onClose);
ticker.on("order_update", onTrade);
ticker.on("message", onMessage);

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

function onMessage(binaryData: ArrayBuffer): void {
  console.log("Binary message received", binaryData);
  // Process raw WebSocket binary data if needed
}
```

## Auto re-connect WebSocket client

Optionally, you can enable client-side auto re-connection to automatically reconnect if the connection is dropped. It is very useful when the client-side network is unreliable and patchy.

Enable auto re-connection with a preferred interval and time. For example:

```typescript
// Enable auto reconnect with 5 second interval and retry for maximum of 20 times.
ticker.autoReconnect(true, 20, 5);

// You can also set re-connection times to -1 for infinite re-connections
ticker.autoReconnect(true, -1, 5);
```

- Event `reconnecting` is called when auto re-connection is triggered and event callback carries two additional params `reconnection interval set` and `current re-connection count`.

- Event `noreconnect` is called when number of auto re-connections exceeds the maximum re-connection count set. For example if maximum re-connection count is set as `20` then after 20th re-connection this event will be triggered. Also note that the current process is exited when this event is triggered.

- Event `connect` will be triggered again when re-connection succeeds.

Here is an example demonstrating auto reconnection.

```typescript
import { KiteTicker } from "kiteconnect";

const apiKey = "your_api_key";
const accessToken = "generated_access_token";
const ticker = new KiteTicker({
  api_key: "api_key",
  access_token: "access_token",
});
ticker.autoReconnect(true, 10, 5);
ticker.connect();
ticker.on("ticks", onTicks);
ticker.on("connect", subscribe);
ticker.on("noreconnect", () => {
  console.log("noreconnect");
});
ticker.on("reconnect", (reconnect_count: any, reconnect_interval: any) => {
  console.log(
    "Reconnecting: attempt - ",
    reconnect_count,
    " interval - ",
    reconnect_interval
  );
});

function onTicks(ticks: any[]) {
  console.log("Ticks", ticks);
}

function subscribe() {
  const items = [738561];
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
$ npm install typedoc --save-dev
$ npx typedoc --out ./docs
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
