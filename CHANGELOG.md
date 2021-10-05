# Kite v4

### Breaking changes
- Upgrade deps and set minimum nodejs version to 8.0.0+
- Return promise instead of throwing error on generateSession and renewAccessToken
- Handle gtt payload validation and throw proper error
- Change ticker response attributes naming as per [kite connect doc](https://kite.trade/docs/connect/v3/websocket/#quote-packet-structure)

### New features
- Order margin call : [orderMargins](https://github.com/zerodha/kiteconnectjs/blob/master/lib/connect.js#L704)
- Basket order margin call : [orderBasketMargins](https://github.com/zerodha/kiteconnectjs/blob/master/lib/connect.js#L727)
- Add OI param to `getHistoricalData`
- Add global constant for postion types `POSITION_TYPE_DAY`, `POSITION_TYPE_OVERNIGHT` and `EXCHANGE_BCD`

### Fixes
- Remove `order_id` param from complete tradebook fetch `getTrades`
- Fix `cancelMF` order_id param struct
- Handle price conversion for BCD segment in ticker
- Remove un-used `headers` param for `parseHistorical`
- Update comment block for `getQuote, getOHLC, getLTP, placeOrder and placeMFOrder`


# Kite v3

### New features
- method: `getProfile`
- method: `getOHLC`
- method: `getLTP`
- method: `getInstrumentsMargins`
- Added MF API calls
- method: `getMFOrders`
- method: `getMFHoldings`
- method: `placeMFOrder`
- method: `cancelMFOrder`
- method: `getMFSIPS`
- method: `placeMFSIP`
- method: `modifyMFSIP`
- method: `cancelMFSIP`
- method: `getMFInstruments`
- method: `exitOrder`
- method: `renewAccessToken`
- method: `invalidateRefreshToken`
- constants for products, order type, transaction type, variety, validity, exchanges and margin segments

### API method name changes

| v2  						| v3 						|
| -------------------------	| -------------------------	|
| requestAccessToken		| generateSession			|
| invalidateToken			| invalidateAccessToken		|
| setSessionHook 			| setSessionExpiryHook		|
| loginUrl					| getLoginURL				|
| margins					| getMargins				|
| orderPlace				| placeOrder				|
| orderModify				| modifyOrder				|
| orderCancel 				| cancelOrder				|
| orders 					| getOrders 				|
| orders(order_id) 			| getOrderHistory			|
| trades 					| getTrades 				|
| trades(order_id) 			| getOrderTrades 			|
| holdings					| getHoldings 				|
| positions					| getPositions 				|
| productModify 			| convertPosition 			|
| instruments				| getInstruments 			|
| historical				| getHistoricalData 		|
| triggerRange 				| getTriggerRange 			|

### Params and other changes
- `KiteConnect` takes all the params as object including `api_key`
- `convertPosition` method takes all the params as object
- All success response returns only `data` field in response instead with envelope
- All error thrown are in the format of `{"message": "Unknown error", "error_type": "GeneralException", "data": null}`
- [Changes in `generateSession` response structure](https://kite.trade/docs/connect/v3/user/#response-attributes)
- [Changes in `getPositions` response structure](https://kite.trade/docs/connect/v3/portfolio/#response-attributes_1)
- [Changes in `getQuote` response structure](https://kite.trade/docs/connect/v3/market-quotes/#retrieving-full-market-quotes)
- [Changes in `placeOrder` params](https://kite.trade/docs/connect/v3/orders/#bracket-order-bo-parameters)
- Changes in `getHistoricalData` params
- All datetime string fields has been converted to `Date` object.
	- `getOrders`, `getOrderHistory`, `getTrades`, `getOrderTrades`, `getMFOrders` responses fields `order_timestamp`, `exchange_timestamp`, `fill_timestamp`
	- `getMFSIPS` fields `created`, `last_instalment`
	- `generateSession` field `login_time`
	- `getQuote` fields `timestamp`, `last_trade_time`
	- `getInstruments` field `expiry`
	- `getMFInstruments` field `last_price_date`

### KiteTicker changes
- `KiteTicker` receives param `access_token` instead of `public_token`
- New params addedd to `KiteTicker` initializer
	- `reconnect` - Toggle auto reconnect on/off
	- `max_retry` - Max retry count for auto reconnect
	- `max_delay` - Max delay between subsequent retries
	- Auto reconnect is enabled by default
- Renamed callback `reconnecting` to `reconnect`
- Added new callbacks
	- `error` - when socket connection is closed with error. Error is received as a first param
	- `close` - when socket connection is closed cleanly
	- `order_update` - When order update (postback) is received for the connected user (Data object is received as first argument)


