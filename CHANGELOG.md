# Changelog

All notable changes to this project will be documented in this file.

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
