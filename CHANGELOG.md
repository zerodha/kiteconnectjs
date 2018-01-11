New features
=============
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

API method name changes
=======================

| v2  						| v3 						|
| -------------------------	| -------------------------	|
| requestAccessToken		| getAccessToken			|
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

Params and other changes
========================
- `KiteConnect` takes all the params as object including `api_key`
- `placeOrder` method takes all the params as object including `variety`
- `modifyOrder` method takes all the params as object including `variety` and `order_id`
- `cancelOrder` method takes all the params as object
- `convertPosition` method takes all the params as object
- `getHistoricalData` method takes all the params as object
- All success response returns only `data` field in response instead with envelope
- All error thrown are in the format of `{"message": "Unknown error", "error_type": "GeneralException", "data": null}`
- Changes in `requestAccessToken` response structure
- Changes in `getPositions` response structure
- Changes in `getQuote` response structure
- Changes in `placeOrder` params
- Changes in `getHistoricalData` params

KiteTicker changes
==================
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


