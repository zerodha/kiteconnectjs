# Kite v5 - TypeScript

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

[5.0.0]: https://github.com/your-repo/kiteconnect-ts/releases/tag/v5.0.0
