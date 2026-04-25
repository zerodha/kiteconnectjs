# kiteconnectjs

[![npm version](https://img.shields.io/npm/v/kiteconnect.svg)](https://www.npmjs.com/package/kiteconnect)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/node/v/kiteconnect.svg)](https://nodejs.org)

The official TypeScript/JavaScript client for communicating with the [Kite Connect API](https://kite.trade).

Kite Connect is a set of REST-like APIs that expose many capabilities required to build a complete investment and trading platform. Execute orders in real time, manage user portfolio, stream live market data (WebSockets), and more, with a simple HTTP API collection.

[Zerodha Technology](http://zerodha.com) (c) 2026. Licensed under the MIT License.

## Table of Contents

- [Documentation](#documentation)
- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started — REST API](#getting-started--rest-api)
- [Getting started — WebSocket](#getting-started--websocket)
- [Auto re-connect](#auto-re-connect)
- [Run tests](#run-tests)
- [Generate documentation](#generate-documentation)
- [A typical web application](#a-typical-web-application)
- [Changelog](#changelog)
- [Contributing](#contributing)

## Documentation

- [TypeScript client documentation](https://kite.trade/docs/kiteconnectjs/v3)
- [Kite Connect HTTP API documentation](https://kite.trade/docs/connect/v3)

## Requirements

- Node.js v18.0.0+

## Installation

Via [npm](https://www.npmjs.com/package/kiteconnect):

```sh
npm install kiteconnect
```

Via [yarn](https://yarnpkg.com/package/kiteconnect):

```sh
yarn add kiteconnect
```

## Getting started — REST API

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
  const response = await kc.generateSession(requestToken, apiSecret);
  kc.setAccessToken(response.access_token);
  console.log("Session generated:", response);
}

async function getProfile() {
  const profile = await kc.getProfile();
  console.log("Profile:", profile);
}

init();
```

## Getting started — WebSocket

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
}
```

## Auto re-connect

Enable client-side auto re-connection to automatically reconnect if the connection is dropped. Useful when the client-side network is unreliable.

```typescript
// Reconnect with a 5-second interval, up to 20 attempts.
ticker.autoReconnect(true, 20, 5);

// Pass -1 for unlimited re-connection attempts.
ticker.autoReconnect(true, -1, 5);
```

**Events:**

| Event         | When it fires                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `reconnect`   | Triggered on each re-connection attempt; callback receives `(reconnect_count, reconnect_interval)`. |
| `noreconnect` | Triggered when the maximum re-connection count is exceeded. The process exits after this event.     |
| `connect`     | Triggered again when re-connection succeeds.                                                        |

```typescript
import { KiteTicker } from "kiteconnect";

const ticker = new KiteTicker({
  api_key: "your_api_key",
  access_token: "your_access_token",
});

ticker.autoReconnect(true, 10, 5);
ticker.connect();

ticker.on("ticks", (ticks: any[]) => console.log("Ticks", ticks));
ticker.on("connect", () => {
  ticker.subscribe([738561]);
  ticker.setMode(ticker.modeFull, [738561]);
});
ticker.on("noreconnect", () =>
  console.log("Max reconnection attempts reached"),
);
ticker.on(
  "reconnect",
  (reconnect_count: number, reconnect_interval: number) => {
    console.log(
      `Reconnecting: attempt ${reconnect_count}, next in ${reconnect_interval}s`,
    );
  },
);
```

## Run tests

```sh
npm run test
```

## Generate documentation

```sh
npm install typedoc --save-dev
npx typedoc --out ./docs
```

## A typical web application

In a typical web application, a new instance of views, controllers, etc. is created per incoming HTTP request. Similarly, you will need to initialise a new instance of the Kite client per request, because each instance represents a single authenticated user, unlike an **admin** API where one instance manages many users.

The typical auth flow:

1. Initialise an instance of the Kite client.
2. Redirect the user to `loginUrl()`.
3. At the redirect URL endpoint, extract `request_token` from the query parameters.
4. Call `generateSession(request_token, api_secret)` to obtain the `access_token` and authenticated user data.
5. Store the `access_token` in a session and use it to initialise fresh Kite client instances for subsequent API calls.

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

- Fork the repository and create your branch from `master`.
- Run `npm run test` to ensure existing tests pass.
- Add or update tests as appropriate.
- Submit a pull request.

Bugs and feature requests should be filed on the [GitHub issue tracker](https://github.com/zerodha/kiteconnectjs/issues).
