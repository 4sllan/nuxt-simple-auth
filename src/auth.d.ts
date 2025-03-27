declare module "#app" {
    interface NuxtApp {
        $auth: {
            /**
             * Retrieves the authenticated user's data.
             * Returns `null` if no user is authenticated.
             */
            get user(): any | null;

            /**
             * Retrieves the name of the currently active authentication strategy.
             * Returns `null` if no strategy is active.
             */
            get strategy(): string | null;

            /**
             * Checks if the user is authenticated.
             * Returns `true` if authenticated, otherwise `false`.
             */
            get loggedIn(): boolean;

            /**
             * Retrieves the HTTP headers used for authentication, such as authorization tokens.
             */
            get headers(): Headers;

            /**
             * Retrieves the authentication prefix (if any) used for token storage or request handling.
             * Returns `null` if no prefix is set.
             */
            get prefix(): string | null;

            /**
             * Updates the HTTP headers used for authentication.
             * This allows modifying headers dynamically after authentication.
             */
            set headers(headers: Headers);

            /**
             * Retrieves redirection URLs configured for a given authentication strategy.
             * Returns an object containing relevant redirection paths, or `null` if none are set.
             */
            getRedirect(strategyName: string): Record<string, string> | null;

            /**
             * Initiates the login process using the specified authentication strategy.
             * @param strategyName - The name of the authentication strategy (e.g., "local", "oauth").
             * @param value - Credentials or authentication payload required for login.
             * @returns A promise resolving with the authentication response.
             */
            loginWith(strategyName: string, value: any): Promise<any>;

            /**
             * Logs out the user from the specified authentication strategy.
             * @param strategyName - The name of the authentication strategy to log out from.
             * @returns A promise that resolves once the logout process is complete.
             */
            logout(strategyName: string): Promise<void>;

            /**
             * Sends a two-factor authentication (2FA) code for verification.
             * @param strategyName - The authentication strategy using 2FA.
             * @param code - The 2FA code to be validated.
             * @returns A promise resolving with an object indicating success or failure.
             */
            _2fa(strategyName: string, code: string): Promise<{ success: boolean }>;
        };
    }
}

declare module "vue" {
    interface ComponentCustomProperties {
        $auth: {
            /**
             * Retrieves the authenticated user's data.
             * Returns `null` if no user is authenticated.
             */
            get user(): any | null;

            /**
             * Retrieves the name of the currently active authentication strategy.
             * Returns `null` if no strategy is active.
             */
            get strategy(): string | null;

            /**
             * Checks if the user is authenticated.
             * Returns `true` if authenticated, otherwise `false`.
             */
            get loggedIn(): boolean;

            /**
             * Retrieves the HTTP headers used for authentication, such as authorization tokens.
             */
            get headers(): Headers;

            /**
             * Retrieves the authentication prefix (if any) used for token storage or request handling.
             * Returns `null` if no prefix is set.
             */
            get prefix(): string | null;

            /**
             * Updates the HTTP headers used for authentication.
             * This allows modifying headers dynamically after authentication.
             */
            set headers(headers: Headers);

            /**
             * Retrieves redirection URLs configured for a given authentication strategy.
             * Returns an object containing relevant redirection paths, or `null` if none are set.
             */
            getRedirect(strategyName: string): Record<string, string> | null;

            /**
             * Initiates the login process using the specified authentication strategy.
             * @param strategyName - The name of the authentication strategy (e.g., "local", "oauth").
             * @param value - Credentials or authentication payload required for login.
             * @returns A promise resolving with the authentication response.
             */
            loginWith(strategyName: string, value: any): Promise<any>;

            /**
             * Logs out the user from the specified authentication strategy.
             * @param strategyName - The name of the authentication strategy to log out from.
             * @returns A promise that resolves once the logout process is complete.
             */
            logout(strategyName: string): Promise<void>;

            /**
             * Sends a two-factor authentication (2FA) code for verification.
             * @param strategyName - The authentication strategy using 2FA.
             * @param code - The 2FA code to be validated.
             * @returns A promise resolving with an object indicating success or failure.
             */
            _2fa(strategyName: string, code: string): Promise<{ success: boolean }>;
        };
    }
}

declare module "#imports" {
    import type { AuthState } from "../types";

    /**
     * Provides access to the authentication store, managing user state and authentication strategy.
     * @returns A reactive authentication state.
     */
    export function useAuthStore(): Ref<AuthState>;
}

export {};
