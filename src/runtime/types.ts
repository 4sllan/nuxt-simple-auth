export interface ModuleOptions {

}

export interface ModuleHooks {
    'my-module:init': any
}

export interface RuntimeModuleHooks {
    'my-module:runtime-hook': any
}

export interface ModulePublicRuntimeConfig {
    NAME: string
}

// type CookieOptions = {
//     httpOnly?: boolean,
//     secure?: boolean,
//     sameSite?: string,
//     priority?: string,
//     maxAge?: number
// }
//
// type Cookie = {
//     options: CookieOptions,
//     prefix: string,
// }
//
// type _2fa = {
//     active: boolean,
//     scheme: Array<string>,
// }
//
// type Token = {
//     property: string,
// }
//
// type User = {
//     property: string,
// }
//
// type EndpointsObject = { url: string , method: string }
//
// type Endpoints = {
//     login: EndpointsObject,
//     user: EndpointsObject,
//     "2fa": EndpointsObject,
//     logout: boolean,
// }
//
// type Strategies = {
//     token: Token
//     user: User
//     endpoints: Endpoints
// }
//
// export interface OptionsAuth extends Nuxt {
//     cookie: Cookie,
//     "2fa": _2fa,
//     strategies: Strategies,
// }