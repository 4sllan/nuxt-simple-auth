<h1 align="center">🔐 Auth Module Simple</h1>
    <p align="center">
        <span>Authentication support for Nuxt</span>
            <br>
        <span>Suporte de autenticação para Nuxt</span>
    </p>
<br>

<div align="center">


[![Static Badge](https://img.shields.io/badge/NPM:nuxt-simple-auth)](https://www.npmjs.com/package/nuxt-simple-auth)
[![Static Badge](https://img.shields.io/badge/GITHUB:nuxt-simple-auth)](https://github.com/4slanK/nuxt-simple-auth)
[![npm version](https://img.shields.io/npm/v/nuxt-simple-auth/latest.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-simple-auth)
[![npm downloads](https://img.shields.io/npm/dt/nuxt-simple-auth.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-simple-auth)


</div>

## Installation

> **Note**: CommonJS usage
> nuxt-simple-auth is a feature-rich open source authentication module for Nuxt3 applications. supports static Nuxt
> applications

> **Note**: CommonJS usage
> nuxt-simple-auth é um módulo de autenticação de código aberto repleto de recursos para aplicativos Nuxt 3. oferece
> suporte a aplicativos Nuxt estáticos

## Quick Start

```sh
npm i nuxt-simple-auth
```

```sh
yarn add nuxt-simple-auth
```

<!-- <a href="https://auth.nuxtjs.org">Read Documentation</a>

**🚧 please see [status page](http://auth.nuxtjs.org/status) in documentation.** -->

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

``` js
"2fa": {
    active: true,
    scheme: ['local'],
 },
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
    siteUrl: process.env.baseURL,
 },
        
```

### Methods

```shell
loginWith(strategyName, ...args)
```
Returns: Promise

Set current strategy to strategyName and attempt login. Usage varies by current strategy.

``` js
const {$auth} = useNuxtApp()

$auth.loginWith('local', data)
      .then(response => {
        
      })
```

```shell
logout(strategyName)
```
``` js
const {$auth} = useNuxtApp()

$auth.logout(strategyName)
```

## License

[MIT License](./LICENSE) - Copyright (c) Nuxt Community
