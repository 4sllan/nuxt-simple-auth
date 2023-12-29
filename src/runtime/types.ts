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

type CookieOption = {
    httpOnly?: boolean
    secure?: boolean
    sameSite?: boolean | string
    priority?: string
    maxAge?: number
    domain?: string
    expire?: string
}

type AuthOptionsCookie = {
    options: CookieOption
    prefix: string
}

type fetchOption = {
    url: string
    method: string
}

type EndpointsOptions = {
    login: fetchOption
    user: fetchOption
    "2fa"?: fetchOption
    logout?: boolean,
}

type redirectOptions = {
    login?: string,
    logout: string,
    callback?: string,
    home?: string
}

type Property = {
    property: string
}

type StrategiesOptions = {
    token: Property
    user: Property
    endpoints: EndpointsOptions
    redirect: redirectOptions
}

type AuthOptionsStrategies = {
    [key: string]: StrategiesOptions
}

export interface ModuleAuthOptions {
    cookie?: AuthOptionsCookie
    "2fa"?: boolean
    strategies: AuthOptionsStrategies
}
