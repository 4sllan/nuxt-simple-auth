// Type definition for cookie options
type CookieOption = {
    httpOnly?: boolean; // Ensures the cookie is only accessible via HTTP (not available to JavaScript in the browser)
    secure?: boolean; // Requires HTTPS for the cookie to be sent
    sameSite?: "lax" | "strict" | "none"; // Controls cross-site cookie sharing
    priority?: "low" | "medium" | "high"; // Defines the cookie's priority in the browser
    maxAge?: number; // Cookie lifespan in seconds
    domain?: string; // The domain for which the cookie is valid
    expires?: Date; // Expiration date of the cookie
}

// Authentication cookie configuration
type AuthOptionsCookie = {
    options: CookieOption;
    prefix: "__Secure-" | "__Host-" | "auth."; // Cookie prefix
    // "__Secure-" and "__Host-" are used in production for enhanced security.
    // "auth." is used only in development mode.
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
    user?: { property?: string } // Name of the object containing user data. (Optional)
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
