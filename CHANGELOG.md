# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2025-03-15

### Features

### Changed
- **`$headers` Handling**
  - Now initialized with `new Headers()` inside the `Auth` class constructor.
  - Prevents direct manipulation of non-standardized objects.
  - Converted to an object before being sent to ensure compatibility with `$fetch`.

- **Dynamic Header Updates**
  - `loginWith()`: Updates the `Authorization` header with the received token.
  - `_2fa()`: Adds the `2fa` header.
  - `initialize()`: Retrieves the token and adds it to `$headers`.

- **Security & Persistence**
  - `$headers` is no longer stored in `sessionStorage`, preventing credential exposure.
  - Reauthentication may be required after a page refresh.

### Fixed
- **Type Corrections**
  - `priority` now only accepts "low", "medium", or "high".
  - `expires` now accepts `Date` instead of `string`.

### Improved
- **Authentication Middleware**
  - Helper functions (`handleLogout`, `validateSession`, `getRedirectPath`) have been modularized and moved to `utils`.
  - `showError` replaced with `createError`, which is more suitable for middleware and API handlers.
  - Middleware now focuses solely on session validation.
  - Logout and redirection logic is now separated into `utils`.


## [1.1.0] - 2025-03-11

### Features

- **Structure & Configuration**
    - Defined the module using `defineNuxtModule`.
    - Stored OAuth credentials securely in `runtimeConfig.secret`.
    - Implemented a logger to track errors and important events.
    - Added support for configurable authentication strategies via `options.strategies`.

- **Security & Cookies**
    - Provided flexible cookie configuration (default prefix: `auth.`).
    - Supported advanced options: `httpOnly`, `secure`, `sameSite`, `priority`.
    - Enabled dynamic adjustment of cookie options in development mode (`secure = false`).

- **Middleware & Route Protection**
    - Introduced `auth` middleware to protect authenticated routes.
    - Added two-factor authentication middleware (`_2fa`).
    - Enabled automatic activation of `_2fa` if any strategy supports it.

- **Strategies & Endpoints**
    - Structured custom endpoints in authentication strategies.
    - Automated conversion of alias to kebab-case for endpoint names.
    - Facilitated dynamic registration of `serverHandlers`.
    - Validated `client_id`, `client_secret`, and `grant_type` in OAuth credentials.

- **Organization & Modularization**
    - Supported composables via `addImportsDir`.
    - Implemented automatic check for `plugin.ts` or `plugin.js` before loading.
    - Adopted a modular structure for easier future expansions.

- **Typing & Error Handling**
    - Improved typing for options using `defu` and ModuleOptions.
    - Enhanced error handling and logging mechanisms.
