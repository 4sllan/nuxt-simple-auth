<h1 align="center">🔐 Auth Module Simple</h1>
    <p align="center">
        <span>Authentication support for Nuxt 3</span>
    </p>
<br>

<div align="center">


[![Static Badge](https://img.shields.io/badge/NPM:nuxt-simple-auth)](https://www.npmjs.com/package/nuxt-simple-auth)
[![Static Badge](https://img.shields.io/badge/GITHUB:nuxt-simple-auth)](https://github.com/4slanK/nuxt-simple-auth)
[![npm version](https://img.shields.io/npm/v/nuxt-simple-auth/latest.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-simple-auth)
[![npm downloads](https://img.shields.io/npm/dt/nuxt-simple-auth.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-simple-auth)
[![Static Badge](https://img.shields.io/badge/-%E2%99%A5%20Sponsors-ec5cc6?style=flat-square)](https://github.com/sponsors/4sllan)

</div>

## Installation

> nuxt-simple-auth is a feature-rich open source authentication module for Nuxt3 applications.

## Quick Start

```sh
npm i nuxt-simple-auth
```

```sh
yarn add nuxt-simple-auth
```

## Setup

### Installation

Then, add nuxt-simple-auth to the modules section of nuxt.config.js:

### Config

***nuxt.config.js***

``` js
{
     modules: [
        'nuxt-simple-auth'
    ],
  
    auth: {
  
    }
},

```

### Strategies

``` js
 strategies: {
        local: {
            token: {
                property: 'access_token',
            },
            user: {
                property: 'profile',
            },
            endpoints: {
                login: {url: '/oauth/token', method: 'post'},
                user: {url: '/api/profile', method: 'get'},
                "2fa": {url: '/api/token_2fa', method: 'post'},
                logout: false,
            },
        },
    }
```

### Cookie

**prefix** - Default token prefix used in constructing a key for token storage.
<br/>
**options** - Additional cookie options, passed to <a href="https://github.com/jshttp/cookie?tab=readme-ov-file">
cookie</a>
<br/>
**path** - path where the cookie is visible. The default is '/'.
<br/>
**expires** - can be used to specify the lifetime of the cookie in Number of Days or Specific Date. The default is
session only.
<br/>
**maxAge** - Specifies the number (in seconds) that will be the Max-Age value (preferably expired)
</br>
**domain** - domain (and by extension subdomain(s)) where the cookie is visible. The default is domain and all
subdomains.
<br/>
**secure** - defines whether the cookie requires a secure protocol (https). Default is false, should be set to true if
possible.
<br/>

**Note:** By default, the prefix on localhost is set to "auth."
<br/>
**__Secure- prefix:** Cookies with names starting with **__Secure-** (dash is part of the prefix) must be set with the
secure flag from a secure page (HTTPS).
<br/>
**__Host- prefix:** Cookies with names starting with **__Host-** must be set with the secure flag, must be from a secure
page (HTTPS), must not have a domain specified (and therefore, are not sent to subdomains), and the path must be /.

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

### 2fa

**Two-factor identification** The 2fa token will have all settings already defined in the cookie
default: false

``` js
"2fa":  true,
```

### Pages

``` js
    definePageMeta({
      middleware: ['auth', '_2fa']
    });
```

### runtimeConfig

**nuxt.config.js**

``` js
 grant_type: 'password',
 client_id: 0,
 client_secret: '',
        
        
 public: {
     apiBase: '/api',
     siteURL: 'http://localhost:3000/' || URL,
     baseURL: process.env.baseURL,
 }
        
```

### Methods

```shell
loginWith(strategyName, ...args)
```

Return: Promise

Set the current strategy as strategyName and attempt to log in. The usage may vary based on the current strategy.

``` js
const {$auth} = useNuxtApp()

$auth.loginWith('local', data)
      .then(response => {
        
      })
```

```shell
logout(strategyName)
```

Set the current strategy as strategyName and logout, ensuring the destruction of Pinia's cookies and state.

``` js
const {$auth} = useNuxtApp()

$auth.logout(strategyName)
```

```shell
_2fa(strategyName, ...args)
```

Return: Promise

Set the current strategy as strategyName and attempt to validate the code with a simplified two-factor authentication (
2FA) and the creation of cookies with HttpOnly. The utilization of these features varies based on the current strategy.

``` js
$auth._2fa('local', data).then(response => {

})
```

``` js
 const {data, pending, error, refresh} = useFetch(url, {
    $fetch: useRequestFetch(),
    headers: $auth._headers,
  })
```

``` js
 $auth._headers.set('name', 'value ')
 $auth._headers.get('name', 'value ')
```

## ⚖️ License

Released under [MIT](/LICENSE) by [@4slan](https://github.com/4sllan).
