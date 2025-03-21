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
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    priority?: "low" | "medium" | "high";
    maxAge?: number;
    domain?: string;
    expires?: Date;
}

type AuthOptionsCookie = {
    options: CookieOption
    prefix: string
}

type fetchOption = {
    url: string
    method: string
    alias?: string
}

type EndpointsOptions = {
    login: fetchOption
    user: { url: string, method: string }
    "2fa"?: fetchOption,
    refresh?: fetchOption,
    logout?: { alias?: string }
}

export type redirectOptions = {
    login?: string
    logout: string
    callback?: string
    home?: string
}


export type StrategiesOptions = {
    /**
     * Name of the object containing user data. (Optional)
     * @type string
     */
    user?: { property?: string }
    endpoints: EndpointsOptions
    redirect: redirectOptions
}

type AuthOptionsStrategies = {
    [key: string]: StrategiesOptions
}

export interface ModuleOptions {
    csrf?: string
    cookie?: AuthOptionsCookie
    strategies: AuthOptionsStrategies
}

export interface AuthSecretConfig {
    client_id: string;
    client_secret: string;
    grant_type: 'password' | 'authorization_code';
}

export type AuthState = {
    user: Record<string, any> | null;
    loggedIn: boolean;
    strategy: string;
};

export interface ProfileResponse {
    profile: any;
    strategyName: string;
    token: string;
}

export interface AuthResponse {
    token: string;
    expires: string;
    refresh_token: string;
}

export interface AuthInstance {
    $headers: Headers;
    readonly _prefix: string;
    readonly options: ModuleOptions;
    readonly state: AuthState;

    get user(): any | null;

    get strategy(): string | null;

    get loggedIn(): boolean;

    get headers(): Headers;

    get prefix(): string | null;

    set headers(headers: Headers)


    getRedirect(strategyName: string): Record<string, string> | null

    csrfToken(event?: any): Promise<boolean>

    initialize(): Promise<void>

    loginWith(strategyName: string, value: any): Promise<any>;

    logout(strategyName: string): Promise<void>;

    _2fa(strategyName: string, code: string): Promise<{ success: boolean }>;

}
