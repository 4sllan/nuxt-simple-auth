# Changelog

All notable changes to this project will be documented in this file.

## 🚀 [1.1.2] - 2025-03-16

### ✨ Added
- **Centralized Session Management (`getAuthSession`)**
  - Introduced `getAuthSession` function in `server/utils/auth.ts`.
  - Eliminates code duplication and improves maintainability.

### 🔧 Changed
- **Stronger Typing (TypeScript)**
  - `expires` is now explicitly typed as `number` to prevent inconsistencies.
  - Introduced `AuthSession` interface for better session data organization.
  - `event` now correctly uses `H3Event` type.

- **Authentication Flow Improvements**
  - Extracts `strategyName`, `token`, and `expires` from cookies.
  - Returns `401 - Unauthorized` if no valid token is found.
  - Validates token expiration to ensure session activity.

### 🛠 Fixed
- **Improved Error Handling**
  - Errors are now handled using `unknown` instead of `any`, increasing security.
  - More appropriate HTTP responses for error cases.
  - Detailed error messages to facilitate debugging.

- **Enhanced Token Expiration Validation**
  - `expires` is now immediately converted to `number`.
  - Prevents invalid values that could lead to unexpected errors.

  
---

## 🛠️ [1.1.1] - 2025-03-15

### ✨ Features

### 🔄 Changed
- **`$headers` Handling**
  - Now initialized with `new Headers()` inside the `Auth` class constructor.
  - Prevents direct manipulation of non-standardized objects.
  - Converted to an object before being sent to ensure compatibility with `$fetch`.

- **🔄 Dynamic Header Updates**
  - `loginWith()`: Updates the `Authorization` header with the received token.
  - `_2fa()`: Adds the `2fa` header.
  - `initialize()`: Retrieves the token and adds it to `$headers`.

- **🔒 Security & Persistence**
  - `$headers` is no longer stored in `sessionStorage`, preventing credential exposure.
  - Reauthentication may be required after a page refresh.

### 🛠️ Fixed
- **🔍 Type Corrections**
  - `priority` now only accepts "low", "medium", or "high".
  - `expires` now accepts `Date` instead of `string`.

### 🚀 Improved
- **🔧 Authentication Middleware**
  - Helper functions (`handleLogout`, `validateSession`, `getRedirectPath`) have been modularized and moved to `utils`.
  - `showError` replaced with `createError`, which is more suitable for middleware and API handlers.
  - Middleware now focuses solely on session validation.
  - Logout and redirection logic is now separated into `utils`.

---
## 🚀 [1.1.0] - 2025-03-11

### 🎯 Features

- **⚙️ Structure & Configuration**
  - Defined the module using `defineNuxtModule`.
  - Stored OAuth credentials securely in `runtimeConfig.secret`.
  - Implemented a logger to track errors and important events.
  - Added support for configurable authentication strategies via `options.strategies`.

- **🔒 Security & Cookies**
  - Provided flexible cookie configuration (default prefix: `auth.`).
  - Supported advanced options: `httpOnly`, `secure`, `sameSite`, `priority`.
  - Enabled dynamic adjustment of cookie options in development mode (`secure = false`).

- **🛡️ Middleware & Route Protection**
  - Introduced `auth` middleware to protect authenticated routes.
  - Added two-factor authentication middleware (`_2fa`).
  - Enabled automatic activation of `_2fa` if any strategy supports it.

- **🔗 Strategies & Endpoints**
  - Structured custom endpoints in authentication strategies.
  - Automated conversion of alias to kebab-case for endpoint names.
  - Facilitated dynamic registration of `serverHandlers`.
  - Validated `client_id`, `client_secret`, and `grant_type` in OAuth credentials.

- **📦 Organization & Modularization**
  - Supported composables via `addImportsDir`.
  - Implemented automatic check for `plugin.ts` or `plugin.js` before loading.
  - Adopted a modular structure for easier future expansions.

- **📝 Typing & Error Handling**
  - Improved typing for options using `defu` and ModuleOptions.
  - Enhanced error handling and logging mechanisms.

---

## [1.0.9] - 2025-03-20

### Added
🔌 **Authentication Plugin Core**
- Implemented `Auth` class with support for multiple authentication strategies.
- Centralized state management including `user`, `loggedIn`, and `strategy`.
- Core authentication methods: `loginWith()`, `logout()`, and `_setProfile()`.

🔑 **Security & Data Protection**
- 🔒 **CSRF Protection**: Automatic retrieval and storage of CSRF tokens in headers.
- 🔒 **Secure Cookies**: Server-side authentication handling via `httpOnly` cookies.
- 🔒 **Token Storage**: Secure separation of login data (`sessionStorage` on client, cookies on server).

### Improved
📌 **Code Optimization & Maintainability**
- Refactored internal methods for better modularity (`getUserProperty()`, `getHandler()`).
- 📌 **Separation of Endpoint Logic**: Modularized methods like `getEndpointsUser()`.
- 📌 **Standardized Error Handling**: Unified logs with `console.warn()` and `console.error()` for easier debugging.

⚡ **Performance & Efficiency**
- ⚡ **Optimized Header Management**: Reusing `this.$headers` to reduce unnecessary recreations.
- ⚡ **Minimized API Calls**: `_setProfile()` runs only when a valid token is present.
- ⚡ **Efficient State Handling**: Storage in `store.value` prevents unnecessary re-renders.

### Added Features
🔑 **Two-Factor Authentication (2FA)**
- Secure 2FA flow with code submission and token validation.

🔄 **Improved Session Handling**
- `initialize()` ensures session retrieval on both server and client.

🚀 **Smart Redirection**
- Dynamic post-login/logout redirection based on strategy settings (`getRedirect()`).

### Nuxt 3 Integration
🔗 **Config-Driven Setup**
- `useRuntimeConfig()` dynamically sets the `baseURL`.

🍪 **Request Context Management**
- `useRequestEvent()` for server-side cookie handling.

🌍 **Global Auth Provider**
- `nuxtApp.provide('auth', exposed)` for centralized authentication access.
