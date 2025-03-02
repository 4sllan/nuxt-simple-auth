<div align="center">
<img src=".github/nuxt-simple-auth.svg" width="200">
</div>
<h1 align="center"> Auth Module Simple</h1>
    <p align="center">Authentication support for Nuxt 3</p>
<br>

## nuxt-simple-auth

<br>

[![Static Badge](https://img.shields.io/badge/NPM:nuxt-simple-auth?style=flat-square&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/nuxt-simple-auth)
[![Static Badge](https://img.shields.io/badge/GITHUB:nuxt-simple-auth?style=flat-square&colorA=18181B&colorB=28CF8D)](https://github.com/4slanK/nuxt-simple-auth)
[![npm version](https://img.shields.io/npm/v/nuxt-simple-auth/latest.svg?style=flat-square&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/nuxt-simple-auth)
![GitHub License][license]
[![npm downloads](https://img.shields.io/npm/dt/nuxt-simple-auth.svg?style=flat-square&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/nuxt-simple-auth)
[![Nuxt][nuxt-src]][nuxt-href]
[![Static Badge](https://img.shields.io/badge/-%E2%99%A5%20Sponsors-ec5cc6?style=flat-square)](https://github.com/sponsors/4sllan)



> **nuxt-simple-auth** is an authentication module for Nuxt 3, designed to integrate with Laravel Passport for request
> authentication.  
> It is an open-source, robust, and feature-rich package that supports cookie validation with `httpOnly`, along with
> various cookie parameters for both login and 2FA.

> This package is stable in terms of options and behavior, but there are still many important improvements to be made,
> and it may contain some bugs.

---

> **nuxt-simple-auth** é um módulo de autenticação para Nuxt 3, desenvolvido para integrar com o Laravel Passport na
> autenticação de requisições.  
> É um pacote de código aberto, robusto e repleto de recursos, permitindo a validação de cookies com `httpOnly`, além de
> oferecer suporte a diversos parâmetros para cookies, tanto no login quanto no 2FA.

> Este pacote é estável em termos de opções e comportamento, porém ainda há muitas melhorias a serem feitas e a
> possibilidade de alguns bugs.

## Start

```sh
npx nuxi@latest module add nuxt-simple-auth
```

## Setup

### Installation

> **Add `nuxt-simple-auth` to the `modules` section in `nuxt.config.js`.**
> **Adicione `nuxt-simple-auth` à seção de módulos do `nuxt.config.js`.**

### Configuration

The configuration must be set in the `nuxt.config.js` file by adding the library to the modules section.

Within the `auth` property, defining **strategies** is **required**, while **cookie** settings are **optional**.

According to the package configuration, the `endpoints.login` property requires **Laravel Passport**, which must expose the `/oauth/token` route.  
This route should return a JSON response containing the following attributes:

- `access_token`
- `refresh_token`
- `expires_in`

Below is an example configuration:

A configuração deve ser feita no arquivo `nuxt.config.js`, adicionando a biblioteca na seção de módulos.

Dentro da propriedade `auth`, a definição das **strategies** é **obrigatória**, enquanto as configurações de **cookies** são **opcionais**.

Conforme a configuração do pacote, a propriedade `endpoints.login` exige o uso do **Laravel Passport**, que deve expor a rota `/oauth/token`.  
Essa rota precisa retornar uma resposta JSON contendo os seguintes atributos:

- `access_token`
- `refresh_token`
- `expires_in`

Abaixo, um exemplo de configuração:

```js
export default defineNuxtConfig({
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
            },
            prefix: '__Secure-auth.'
        },
        strategies: {
            local: {
                redirect: {
                    logout: "/auth",
                    login: "/auth"
                },
                token: {
                    property: "access_token",
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
            client: {
                redirect: {
                    logout: "/auth",
                    login: "/auth"
                },
                token: {
                    property: "access_token",
                },
                user: {
                    property: "profile",
                },
                endpoints: {
                    login: {url: "/oauth/token", method: "post"},
                    user: {url: "/api/profile", method: "get"},
                    "2fa": {url: "/api/send-token-2fa", method: "post"},
                    logout: {alias: "logout client"}
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

A configuração do **runtimeConfig** do Nuxt 3 também precisa ser ajustada para incluir um objeto `secret`.  
Este objeto deve conter os nomes das suas **strategies**, e dentro de cada uma delas, as seguintes chaves são *
*obrigatórias**:

- [`client_id`](https://laravel.com/docs/12.x/passport#main-content)
- [`client_secret`](https://laravel.com/docs/12.x/passport#main-content)
- [`grant_type`](https://laravel.com/docs/12.x/passport#main-content)

#### Exemplo de Configuração:

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

The **strategies** configuration follows the structure below, starting with a name of your choice to set up the package.  
The available options are listed, indicating which are **required** and which are **optional**.

As configurações das **strategies** seguem a estrutura abaixo, iniciando com um nome de sua escolha para configurar o pacote.  
As opções disponíveis estão listadas, indicando quais são **obrigatórias** e quais são **opcionais**.

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

- **`token`**: Name of the object returned from Laravel authentication. It is usually `"access_token"`. _(Required)_

- **`user`**: Name of the object containing user data. _(Required)_

---

``` js
 strategies: {
            local: {
                redirect: {
                    logout: "/auth",
                    login: "/auth"
                },
                token: {
                    property: "access_token",
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
                token: {
                    property: "access_token",
                },
                user: {
                    property: "profile",
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

O **2FA** é opcional, mas, se incluído em uma das "strategies", deve conter a URL e o método necessários para ativar o
middleware "_2fa". Esse middleware não é global e pode ser utilizado seletivamente nas páginas do Nuxt.

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

### Methods

| Método / Method                    | Descrição (PT)                                                                           | Description (EN)                                                                        |
|------------------------------------|------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| `loginWith(strategyName, ...args)` | Define a estratégia atual e tenta realizar o login. Retorna uma `Promise`.               | Sets the current strategy and attempts to log in. Returns a `Promise`.                  |
| `logout(strategyName)`             | Realiza o logout, garantindo a destruição dos cookies e do estado.                       | Logs out, ensuring the destruction of cookies and state.                                |
| `_2fa(strategyName, ...args)`      | Tenta validar o código de autenticação em dois fatores (**2FA**). Retorna uma `Promise`. | Attempts to validate the two-factor authentication (**2FA**) code. Returns a `Promise`. |
| `$auth.headers.set(name, value)`   | Define um cabeçalho HTTP manualmente.                                                    | Sets an HTTP header manually.                                                           |
| `$auth.headers.get(name)`          | Obtém o valor de um cabeçalho HTTP.                                                      | Retrieves the value of an HTTP header.                                                  |

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
