<h1 align="center" >🔐 Auth Module Simple</h1>
<p align="center">Zero standard authentication support for Nuxt </p>

<p align="center">
<br>
<a href="https://www.npmjs.com/package/nuxt-simple-auth">
    <img alt="" src="https://img.shields.io/npm/v/nuxt-simple-auth/latest.svg?style=flat-square">
</a>
<a href="https://www.npmjs.com/package/nuxt-simple-auth">
    <img alt="" src="https://img.shields.io/npm/dt/nuxt-simple-auth.svg?style=flat-square">
</a>
</p>


## Installation

<!-- <a href="https://auth.nuxtjs.org">Read Documentation</a>

**🚧 please see [status page](http://auth.nuxtjs.org/status) in documentation.** -->


## Development

Running demo for development:

```bash
$ yarn install
$ yarn dev
```

Running tests for development:

```bash
$ yarn build
$ yarn nuxt build test/fixture
$ yarn jest
```

## Example

#### nuxt.config.ts

[//]: # (> **Note**: CommonJS usage  )

[//]: # (> In order to gain the TypeScript typings &#40;for intellisense / autocomplete&#41; while using CommonJS imports with `require&#40;&#41;`, use the following approach:)


```
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
                user: {url: '/api/admin/profile', method: 'get'},
                logout: false,
            },
        },
    }
},
```

## License

[MIT License](./LICENSE) - Copyright (c) Nuxt Community
