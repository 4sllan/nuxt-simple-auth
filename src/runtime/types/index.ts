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
    proxy?: boolean; // If true (default), the request will be made through the Nuxt backend.
}

// Type definition for authentication-related API endpoints
type EndpointsOptions = {
    login: FetchOption // Endpoint for user login
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

// Response format for user profile retrieval
export interface ProfileResponse {
    profile: any; // User profile data (structure depends on the authentication strategy)
    strategyName: string; // Name of the authentication strategy used
    token: string; // Authentication token
}

// Response format for authentication actions (e.g., login, token refresh)
export interface AuthResponse {
    token: string; // Access token for authentication
    expires: string; // Token expiration timestamp
    refresh_token: string; // Refresh token for renewing authentication
}

// Interface for the authentication instance
export interface AuthInstance {
    $headers: Headers; // HTTP headers used for authentication
    readonly _prefix: string; // Default prefix for authentication cookies/tokens
    readonly options: ModuleOptions; // Authentication module configuration options
    readonly state: AuthState; // Current authentication state

    // Gets the authenticated user's data (or null if not authenticated)
    get user(): any | null;

    // Gets the name of the active authentication strategy (or null if none is active)
    get strategy(): string | null;

    // Checks if the user is authenticated
    get loggedIn(): boolean;

    // Gets the HTTP headers used for authentication
    get headers(): Headers;

    // Gets the authentication prefix (or null if none)
    get prefix(): string | null;

    // Sets new HTTP headers for authentication
    set headers(headers: Headers);

    // Gets the redirection URLs for a given authentication strategy
    getRedirect(strategyName: string): Record<string, string> | null;

    // Retrieves the CSRF token if required
    csrfToken(event?: any): Promise<boolean>;

    // Initializes the authentication instance (typically called on app load)
    initialize(): Promise<void>;

    // Logs in using a specific authentication strategy
    loginWith(strategyName: string, value: any): Promise<any>;

    // Logs out from the specified authentication strategy
    logout(strategyName: string): Promise<void>;

    // Sends the two-factor authentication (2FA) code for validation
    _2fa(strategyName: string, code: string): Promise<{ success: boolean }>;
}

