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

// Type definition for fetch options
type FetchOption = {
    url: string; // API endpoint URL
    method: string; // HTTP method (e.g., GET, POST, PUT, DELETE)
    alias?: string; // Optional alias for easier reference
}

// Type definition for authentication-related API endpoints
type EndpointsOptions = {
    login: FetchOption; // Endpoint for user login
    user: { url: string; method: string }; // Endpoint to fetch user data
    "2fa"?: FetchOption; // Optional endpoint for two-factor authentication (2FA)
    refresh?: FetchOption; // Optional endpoint to refresh authentication tokens
    logout?: { alias?: string }; // Optional alias for the logout function
}

// Redirection options after authentication actions
export type RedirectOptions = {
    login?: string; // URL to redirect after login (optional)
    logout: string; // URL to redirect after logout (required)
    callback?: string; // URL for callback after external authentication (optional)
    home?: string; // URL to redirect after successful login (optional)
}

// Options for different authentication strategies
export type StrategiesOptions = {
    user?: { property?: string }; // Name of the object containing user data (optional)
    endpoints: EndpointsOptions; // Endpoints for the authentication strategy
    redirect: RedirectOptions; // Redirection configuration
}

// Type definition for multiple authentication strategies
type AuthOptionsStrategies = {
    [key: string]: StrategiesOptions; // Dynamic key for different authentication strategies
}

// Configurações do módulo de autenticação
export interface ModuleOptions {
    csrf?: string; // Token CSRF para proteção de requisições (opcional)
    cookie?: AuthOptionsCookie; // Configuração de cookies para autenticação (opcional)
    strategies: AuthOptionsStrategies; // Configuração das estratégias de autenticação (obrigatório)
}

// Configuração de credenciais secretas para autenticação (baseada em OAuth)
export interface AuthSecretConfig {
    client_id: string; // ID do cliente OAuth
    client_secret: string; // Segredo do cliente OAuth
    grant_type: 'password' | 'authorization_code'; // Tipo de concessão para autenticação
}

// Authentication state
export type AuthState = {
    user: Record<string, any> | null; // User data (null if not authenticated)
    loggedIn: boolean; // Authentication status (true if logged in)
    strategy: string; // Name of the active strategy (must match a key in StrategiesOptions)
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
