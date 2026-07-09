# Changelog

All notable changes to this project will be documented in this file.

## [1.1.8] - 2026-07-09

### ⚠️ Deprecated

- **nuxt-simple-auth** has been deprecated.
- This package is no longer under active development and will not receive new features.
- Please migrate to **nuxt-umbu**, which is the direct successor and will continue to receive improvements, bug fixes, and new features.

#### Migration

- 📦 npm: https://www.npmjs.com/package/nuxt-umbu
- 🐙 GitHub: https://github.com/4sllan/nuxt-umbu
- 📖 Documentation: https://4sllan.github.io/nuxt-umbu/

## [1.1.7] - 2025-04-23

### 🚨 Fix: Incorrect Status Code on Authentication Failure

#### 🧾 Summary
- Fixed the HTTP status code returned when authentication fails due to invalid credentials.

#### ❌ Previous Behavior
- When a user submitted incorrect credentials, the system responded with:
  - **HTTP Status Code:** `502 Bad Gateway`
  - **Message:** `Authentication service error`
- This was misleading, as 502 indicates a gateway/proxy failure, not a client-side error.

#### ✅ New Behavior
- The system now correctly returns:
  - **HTTP Status Code:** `401 Unauthorized`
  - This accurately reflects an authentication failure due to invalid client input.

#### 🛠 Impact
- ✔️ Improves clarity during debugging and API diagnostics.
- ✔️ Aligns with HTTP standards for client authentication errors.

---

## [1.1.6] - 2025-03-25

### 🔐 AuthOptionsCookie

- Defined a new structure for configuring authentication cookies.
- Now it is possible to specify a prefix for the cookies, which can be `__Secure-`, `__Host-`, or `auth.`, with the
  `auth.` prefix being used exclusively in development environments.

#### 📝 Detailed Comments

- Detailed comments have been added to all types and interfaces in the `types` file, ensuring better clarity and easier
  code maintenance.

---

## [1.1.5] - 2025-03-21

### 🔐 Authentication State Persistence

#### 1️⃣ Use of `localStorage` in `initialize()`

- `localStorage` is used to store and retrieve `token`, `strategy`, and `token_expiration`.
- Ensures authentication state persists across browser tabs.

#### 2️⃣ Persistence Confirmation in `loginWith()`

- The storage logic in `localStorage` remains intact.
- Credentials are correctly stored upon login, ensuring authentication continuity.

#### 3️⃣ Complete Credential Removal in `logout()`

- `localStorage.clear()` has been implemented to remove all stored credentials.
- This approach ensures a complete logout, preventing unauthorized access after the user logs out.

#### ✅ Benefits & Impacts

- ✔️ **Enhanced Persistence:** Maintains session across different browser tabs.
- ✔️ **Continuous Authentication:** Avoids repeated logins when reloading the page.
- ✔️ **Secure Logout:** Removes all credentials, preventing unintended reuse of stored data.

---

## [1.1.4] - 2025-03-17

### 🔧 Improvements in Utils

#### 🎯 Objectives

- ✅ Implement a storage system compatible with both client and server environments.
- ✅ Ensure compatibility with `unstorage` and support for different storage drivers.
- ✅ Guarantee correct processing of JSON values.
- ✅ Standardize key naming by removing dynamic prefixes and suffixes.

#### 🚀 Implemented Features

- **`set(key: string, value: T): Promise<void>`**
    - Stores a value associated with a key.
    - **Client-side:** Uses `sessionStorage`.
    - **Server-side:** Uses `unstorage`, automatically removing dynamic prefixes and suffixes from keys.
    - All values are stored in JSON format.

- **`get(key: string): Promise<T | null>`**
    - Retrieves a stored value.
    - First checks `sessionStorage`, and if not found, looks in `unstorage`.
    - Converts non-string values to string before applying `JSON.parse()`.

- **`remove(key: string): Promise<void>`**
    - Removes an item from storage.
    - Deletes the entry from both `sessionStorage` and `unstorage` using the processed key.

- **`clear(): Promise<void>`**
    - Clears all stored items.
    - Removes data from `sessionStorage` and `unstorage`.

#### 🔄 Improvements and Adjustments

- **Automatic Base Key Extraction**
    - Implemented `extractBaseKey(key: string)`, which automatically removes dynamic prefixes and suffixes.
    - Ensures more consistent data storage and retrieval.

- **Enhanced Type Handling in `get()`**
    - To prevent type errors, `unstorage.getItem(baseKey)` now always returns strings before being processed by
      `JSON.parse()`.

#### 🛠 Adjustments in `StrategiesOptions` Typing

- **Before:**
  ```ts
  user: { property: string } // Required
  ```
- **Now:**
  ```ts
  user?: { property?: string } // Optional
  ```

### ❤️ Contribution by Pamela ([Pull Request](https://github.com/4sllan/nuxt-simple-auth/pull/3))

#### 🔀 Authentication Improvements

##### **Redirect to Login URL**

- Implemented in the `loginWith()` function.
- Now, before continuing navigation, it checks if a redirect to login is configured:
  ```ts
  const redirectUrl = this.getRedirect(strategyName)?.login;

  if (redirectUrl) {
      await navigateTo(redirectUrl);
  }
  ```
- ✔️ Ensures the user is correctly redirected after login.
- ✔️ Prevents navigation to `undefined` or invalid URLs.

##### **Improved User Profile Property Verification**

- Enhanced security when accessing user profile properties.
- Now, before accessing any property, it verifies if it actually exists:
  ```ts
  property ? data[property as keyof ProfileResponse] : data ?? null
  ```
- ✔️ Prevents errors when accessing undefined properties.

---

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
    - Helper functions (`handleLogout`, `validateSession`, `getRedirectPath`) have been modularized and moved to
      `utils`.
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
