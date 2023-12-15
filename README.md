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
> nuxt-simple-auth is a feature-rich open source authentication module for Nuxt 2/3 applications. supports static Nuxt
> applications

> **Note**: CommonJS usage
> nuxt-simple-auth é um módulo de autenticação de código aberto repleto de recursos para aplicativos Nuxt 2/3. oferece
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

Then, add @nuxtjs/auth-next to the modules section of nuxt.config.js:

#### Config nuxt-simple-auth

``` js
{
 modules: [
    'nuxt-simple-auth'
  ],
  
  auth: {
    cookie: {
        options: {
            httpOnly: true,
                secure: true,
                sameSite: 'Lax',
                priority: 'high',
            //maxAge: 24 * 60 * 60 * 1000,
        },
        prefix: '__Secure-auth.',
    },
    strategies: {
        "2fa": {
            active: true,
                scheme: 'local',
        },
        local: {
            "2fa": {
                checker: {url: '/oauth/token', method: 'post'},
                generator: {url: '/oauth/token', method: 'post'},
            },
            token: {
                property: 'access_token',
            },
            user: {
                property: 'profile',
            },
            endpoints: {
                login: {url: '/oauth/token', method: 'post'},
                user: {url: '/api/profile', method: 'get'},
                logout: false,
            },
        },
    }
},

 runtimeConfig: {
        // The private keys which are only available server-side
        // Back-end Laravel Passport
        // Mandatory information
        
        grant_type: 'password',
        client_id: 0,
        client_secret: '',
        // Keys within public are also exposed client-side
        public: {
            apiBase: '/api',
            siteUrl: process.env.baseURL,
        }
    },
}
  
```

#### Pages

``` js
    definePageMeta({
      middleware: ['auth', '_2fa']
    });
```

## License

[MIT License](./LICENSE) - Copyright (c) Nuxt Community
