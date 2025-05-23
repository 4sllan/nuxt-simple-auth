<div align="center">
<img src=".github/nuxt-simple-auth.svg" width="200">
</div>
<h1 align="center"> Auth Module Simple</h1>
    <p align="center">Authentication support for Nuxt 3</p>
<br>

## nuxt-simple-auth

<br>

[![npm version](https://img.shields.io/npm/v/nuxt-simple-auth/latest.svg?style=flat-square&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/nuxt-simple-auth)
![GitHub License][license]
[![npm downloads](https://img.shields.io/npm/dt/nuxt-simple-auth.svg?style=flat-square&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/nuxt-simple-auth)
[![Nuxt][nuxt-src]][nuxt-href]
[![Static Badge](https://img.shields.io/badge/-%E2%99%A5%20Sponsors-ec5cc6?style=flat-square)](https://github.com/sponsors/4sllan)



> **nuxt-simple-auth** is an authentication module for **Nuxt 3**, designed as an **open-source**, **robust**, and *
*feature-rich** package. It enables **cookie** validation and **CSRF** protection, seamlessly integrating with **Laravel
Passport**.\
> Additionally, it supports various cookie parameters for both **login** and **two-factor authentication (2FA)**.\
> It also includes **SSR authentication** support, ensuring that the user remains authenticated on both the **client**
> and the **server**.

> While the package is stable in terms of options and behavior, there are still improvements to be made, and some bugs
> may exist.


- [Release Notes](/CHANGELOG.md)

## Start

```sh
npx nuxi@latest module add nuxt-simple-auth
```

## Setup

### Installation

> **Add `nuxt-simple-auth` to the `modules` section in `nuxt.config.js`.**

### Configuration

The configuration must be done in the `nuxt.config.js` file by adding the library to the **modules** section.

In the `auth` property, defining **strategies** is **mandatory**, while **cookies** and **CSRF** settings are **optional
**.

For authentication, the `endpoints.login` property requires the use of **Laravel Passport**, which must expose
the `/oauth/token` route.  
[Laravel Passport Documentation - Client Credentials Grant Tokens](https://laravel.com/docs/12.x/passport#client-credentials-grant-tokens)

This route must return a JSON response containing the following attributes:

- `access_token`
- `refresh_token`
- `expires_in`

If you choose to use **2FA** authentication, the package requires the configuration of `endpoints.2fa`, which mandates
that **Laravel** exposes a specific route.  
This route should return a JSON response with the following attributes:

- `access_token`
- `expires_in`

`expires_in`: Must be the number of seconds until the **2FA** access token expires.

[//]: # (Example implementation in Laravel for the `TwoFactorAuthController` route controller:)

[//]: # ()

[//]: # (```php)

[//]: # (return response&#40;&#41;->json&#40;[)

[//]: # (    'access_token' => $twoFactorAuth->token,)

[//]: # (    'expires_in' => $twoFactorAuth->expire_at->timestamp - now&#40;&#41;->timestamp, // Number of seconds until expiration.)

[//]: # (]&#41;;)

[//]: # (```)

After **2FA** validation, the token will be automatically added to the **headers** of requests as a **Bearer Token**,
with the name `"2fa"`.  
This allows **Laravel APIs** to validate authentication on protected routes.

#### Example

```js
export default defineNuxtConfig({
    modules: [
        'nuxt-simple-auth'
    ],

    auth: {
        csrf: '/csrf-token',
        cookie: {
            options: {
                httpOnly: true,
                secure: true,
                sameSite: 'Lax',
                priority: 'high',
            },
            prefix: '__Secure-auth.'
        },
        strategies: {
            local: {
                redirect: {
                    logout: "/auth",
                    login: "/auth"
                },
                user: {
                    property: "profile",
                },
                endpoints: {
                    login: {url: "/oauth/token", method: "post", alias: "auth token"},
                    user: {url: "/api/profile", method: "get"},
                    "2fa": {url: "/api/send-token-2fa", method: "post"},
                },
            }
        }
    },
});
```

### Runtime Config

The **runtimeConfig** of Nuxt 3 must also be configured to include a `secret` object.  
This object should contain the names of your **strategies**, and within each strategy, the following keys are **required
**:

- [`client_id`](https://laravel.com/docs/12.x/passport#main-content)
- [`client_secret`](https://laravel.com/docs/12.x/passport#main-content)
- [`grant_type`](https://laravel.com/docs/12.x/passport#main-content)

#### Example Configuration:

```js
export default defineNuxtConfig({
    runtimeConfig: {
        secret: {
            local: {
                client_id: 'YOUR_CLIENT_ID',
                client_secret: 'YOUR_CLIENT_SECRET',
                grant_type: 'password',
            },
            client: {
                client_id: 'YOUR_CLIENT_ID',
                client_secret: 'YOUR_CLIENT_SECRET',
                grant_type: 'authorization_code',
            }
        }
    }
});
```

### Strategies

The **strategies** configuration follows the structure below, starting with a name of your choice to set up the
package.  
The available options are listed, indicating which are **required** and which are **optional**.

#### Configuration

- **`redirect`**: Defines the pages for redirection. _(Required)_
    - `login`: _(Optional)_
    - `logout`: _(Required)_
    - `callback`: _(Optional)_
    - `home`: _(Optional)_

- **`endpoints`**: Defines the API routes configured in Laravel. _(Required)_
    - `login`: _(Required)_
        - `url`: _(Required)_
        - `method`: _(Required)_
        - `alias`: _(Optional)_
    - `user`: Contains user data. _(Required)_
        - `url`: _(Required)_
        - `method`: _(Required)_
    - `"2fa"`: _(Optional)_
        - `url`: _(Required)_
        - `method`: _(Required)_
        - `alias`: _(Optional)_
    - `logout`: _(Optional)_
        - `alias`: _(Optional)_

- **`user`**: Name of the object containing user data. _(Optional)_

---

``` js
 strategies: {
            local: {
                redirect: {
                    logout: "/auth",
                    login: "/auth"
                },
                user: {
                    property: "profile",
                },
                endpoints: {
                    login: {url: "/oauth/token", method: "post", alias: "auth token"},
                    user: {url: "/api/profile", method: "get"},
                    "2fa": {url: "/api/send-token-2fa", method: "post"},
                },
            },
            client:{
                redirect: {
                    logout: "/auth",
                    login: "/auth"
                },
                endpoints: {
                    login: {url: "/oauth/token", method: "post"},
                    user: {url: "/api/profile", method: "get"},
                    "2fa": {url: "/api/send-token-2fa", method: "post"},
                    logout: {alias: 'logout client'}
                },
            }
        }
```

**2FA** is optional, but if included in one of the "strategies," it must have a URL and method to enable the "_2fa"
middleware. This middleware is not global and can be selectively used on Nuxt pages.

``` js
 definePageMeta({
      middleware: ['auth', '_2fa']
    });
```

### Cookie

| Option      | Description                                                                                                             |
|-------------|-------------------------------------------------------------------------------------------------------------------------|
| **prefix**  | Default token prefix used in constructing a key for token storage.                                                      |
| **options** | Additional cookie options, passed to [cookie](https://github.com/jshttp/cookie?tab=readme-ov-file).                     |
| **path**    | Path where the cookie is visible. Default is `/`.                                                                       |
| **expires** | Specifies the lifetime of the cookie in number of days or a specific date. Default is session-only.                     |
| **maxAge**  | Specifies the number (in seconds) that will be the Max-Age value (preferably expired).                                  |
| **domain**  | Domain (and by extension subdomains) where the cookie is visible. Default is the domain and all subdomains.             |
| **secure**  | Defines whether the cookie requires a secure protocol (HTTPS). Default is `false`, should be set to `true` if possible. |

### Notes:

- By default, the prefix on `localhost` is set to `"auth."`
- **`__Secure-` prefix:** Cookies with names starting with `__Secure-` (dash is part of the prefix) must be set with the
  secure flag from a secure page (HTTPS).
- **`__Host-` prefix:** Cookies with names starting with `__Host-` must be set with the secure flag, must originate from
  a secure page (HTTPS), must not have a domain specified (and therefore are not sent to subdomains), and the path must
  be `/`.

``` js
cookie: {
        options: {
            httpOnly: true,
                secure: true,
                sameSite: 'Lax',
                priority: 'high',
            //maxAge: 24 * 60 * 60 * 1000,
        },
        prefix: '__Secure-auth.',
    }
```

### Middlewares

The **nuxt-simple-auth** package provides two middlewares: **"auth"** and **"_2fa"**.  
They are **not global** and can be applied selectively to Nuxt pages.

- **auth**: Restricts access to protected pages, ensuring the user is authenticated via **Laravel Passport**, both on
  the client and server (**SSR**).
- **_2fa**: Enhances authentication by verifying values stored in **cookies** and **sessionStorage** to validate *
  *two-factor authentication (2FA)**, also working on both the client and server (**SSR**).

``` js
 definePageMeta({
      middleware: ['auth', '_2fa']
    });
```

### Methods

| Método / Method                    | Description                                                                             |
|------------------------------------|-----------------------------------------------------------------------------------------|
| `loginWith(strategyName, ...args)` | Sets the current strategy and attempts to log in. Returns a `Promise`.                  |
| `logout(strategyName)`             | Logs out, ensuring the destruction of cookies and state.                                |
| `_2fa(strategyName, ...args)`      | Attempts to validate the two-factor authentication (**2FA**) code. Returns a `Promise`. |
| `refreshToken(strategyName)`       |                                                                                         |
| `$auth.headers.set(name, value)`   | Sets an HTTP header manually.                                                           |
| `$auth.headers.get(name)`          | Retrieves the value of an HTTP header.                                                  |

---

### Usage Examples

#### `loginWith`

```js
const {$auth} = useNuxtApp()

$auth.loginWith('local', data)
    .then(response => {
        // Logic after login
    })

```

#### `logout`

```js
const {$auth} = useNuxtApp()

$auth.logout('local')

```

#### `_2fa`

```js
$auth._2fa('local', data).then(response => {
    // Logic after 2FA validation
})

```

#### `Headers and Requests`

```js
$auth.headers.set('name', 'value') // Sets a header  
$auth.headers.get('name') // Retrieves a header  

const {data, pending, error, refresh} = useFetch(url, {
    headers: $auth.headers,
})

```

## ⚖️ License

Released under [MIT](/LICENSE) by [@4slan](https://github.com/4sllan).


[license]: https://img.shields.io/github/license/4sllan/nuxt-simple-auth?style=flat-square&colorA=18181B&colorB=28CF8D

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js

[nuxt-href]: https://nuxt.com