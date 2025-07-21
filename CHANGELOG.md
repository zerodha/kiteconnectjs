# Kite v5 - TypeScript

## [5.1.0] - 2025-07-21

### New Features

- **Enhanced Type Safety**: Improved TypeScript type definitions for ticker event callbacks
- **Comprehensive Type Exports**: All type definitions are now properly exported from main entry point with direct imports: `{ KiteConnect, Order, KiteTickerParams, Exchanges } from 'kiteconnect'`
- **Ticker Event Types**: Added proper exports for `Tick`, `LTPTick`, `QuoteTick`, and `FullTick` interfaces
- **Historical Data Types**: Added `HistoricalData` type with `Promise<HistoricalData[]>` for `getHistoricalData()` method
- **Order Interface Completeness**: Enhanced Order interface with all missing fields from orderbook API response
- **Enhanced Ticker Events**: Added `KiteTickerEvents` and `KiteTickerEventCallbacks` for type safety and discovery

### Bug Fixes

- **Security Vulnerabilities**: Fixed all npm audit vulnerabilities
  - Upgraded axios from vulnerable version to 1.10.0 with proper TypeScript typing
  - Applied security patches across all dependencies
- **Timezone Handling**: Fixed historical data timezone handling for Date objects [Issue #107](https://github.com/zerodha/kiteconnectjs/issues/107)
  - Date objects now correctly preserve local timezone instead of converting to UTC
- **Missing Order Fields**: Added missing fields to Order interface including `instrument_token`, `placed_by`, `exchange_order_id`, and 15+ other fields [Issue #113](https://github.com/zerodha/kiteconnectjs/issues/113)
- **Content-Type Detection**: Enhanced CSV and JSON content-type handling to support charset specifications using pattern matching instead of strict equality

### Breaking Changes

- **Date Object Timezone Handling**: If you were manually compensating for the timezone bug by adjusting Date objects, you'll need to update your code to use the actual intended time values

### Backward Compatibility

- String date inputs: No changes required
- Ticker event callbacks: Existing `any[]` callbacks continue to work

## [5.0.0] - 2024-06-13

### Breaking Changes

- **TypeScript Conversion**: The entire codebase has been converted to TypeScript. This means type definitions are now included, and any custom integrations may need to be updated to match the new type definitions.
- **Node.js Version Requirement**: The minimum required Node.js version is now 18.0.0. Please upgrade your Node.js installation if you are using an older version.
- **API Changes**: Updated various function signatures and added explicit types for better TypeScript support.

### New Features

- **TypeScript Support**: The library is now fully written in TypeScript, providing better type safety.
- **Documentation**: Added and updated documentation to reflect the new TypeScript codebase as per the [TSDOC standard](https://tsdoc.org/).
- **Examples**: Added new examples for both REST API and WebSocket client in TypeScript.

### Improvements

- **Code Quality**: Refactored codebase to improve readability, maintainability, and performance.
- **Error Handling**: Improved error handling and added more descriptive error messages.

### Migration Guide

If you are upgrading from a previous version, please review the following changes and adjust your code accordingly:

- **Node.js Version**: Ensure your Node.js version is 18.0.0 or higher.
- **TypeScript Integration**: Update your project to handle the new TypeScript types. This may involve adding or adjusting type definitions in your project.
- **Function Signatures**: Review the updated function signatures in the documentation and adjust your usage of the library accordingly.

### Bug Fixes

- Fixed various minor bugs and performance issues reported in the previous version.

### Notes

- This release marks a significant update with the transition to TypeScript. Please report any issues or bugs to the repository's issue tracker.

[5.1.0]: https://github.com/zerodha/kiteconnectjs/releases/tag/v5.1.0
[5.0.0]: https://github.com/zerodha/kiteconnectjs/releases/tag/v5.0.0
