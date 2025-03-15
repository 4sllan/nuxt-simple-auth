import {
    defineNuxtPlugin,
    useRequestEvent,
    navigateTo,
    useAuthStore,
    useRuntimeConfig
} from '#imports'
import {parseCookies, setCookie} from 'h3';
import {$fetch} from 'ofetch';
import type {
    AuthState,
    ProfileResponse,
    AuthResponse,
    AuthInstance
} from './types'

export default defineNuxtPlugin(async (nuxtApp) => {
    const store = useAuthStore()

    class Auth implements AuthInstance {
        public $headers: Headers;
        private _state: AuthState = {user: null, loggedIn: false, strategy: ""};
        private _prefix: string;
        private readonly options: Record<string, any>;

        constructor(options: Record<string, any>) {
            this.$headers = new Headers();
            this._prefix = options.cookie.prefix;
            this.options = options;
        }

        get state(): AuthState {
            return this._state;
        }

        get user(): any | null {
            return this._state.user;
        }

        get strategy(): string | null {
            return this._state.strategy;
        }

        get loggedIn(): boolean {
            return this._state.loggedIn;
        }

        get headers(): Headers {
            return this.$headers;
        }

        get prefix(): string | null {
            return this._prefix;
        }

        set headers(headers: Headers) {
            this.$headers = headers;
        }

        set state(val: AuthState) {
            this._state = val;
        }

        public getRedirect(strategyName: string): Record<string, string> | null {
            return this.options.strategies?.[strategyName]?.redirect ?? null;
        }

        private getUserProperty(strategyName: string): string | null {
            return this.options.strategies?.[strategyName]?.user?.property ?? null;
        }

        private getEndpointsUser(strategyName: string): { url: string, method: string } | null {
            return this.options.strategies?.[strategyName]?.endpoints.user ?? null
        }

        private getHandler(strategyName: string, key: string): string | null {
            return (
                this.options.strategies?.[strategyName]?.handler?.find((value: any) => value[key])?.[key] ?? null
            );
        }

        async initialize(): Promise<void> {
            try {
                let strategy: string | null = null;
                let token: string | null = null;

                if (import.meta.server) {
                    const event = useRequestEvent();
                    if (!event) {
                        console.warn("No request event available. Skipping initialization.");
                        return;
                    }

                    const cookies = parseCookies(event);
                    strategy = cookies[this._prefix + `strategy`]
                    token = strategy ? cookies[this._prefix + `_token.` + strategy] : null;
                } else {
                    strategy = sessionStorage.getItem(this._prefix + `strategy`);
                    token = strategy ? sessionStorage.getItem(this._prefix + `_token.` + strategy) : null;
                }

                if (!strategy || !token) {
                    console.warn("No valid session found. Skipping profile fetch.");
                    return;
                }

                this._state.strategy = strategy ?? null;
                this.$headers.set('Authorization', token);

                const data = await this._setProfile();
                if (data) {
                    const property = this.getUserProperty(this._state.strategy);
                    this._state = {
                        user: data[property as keyof ProfileResponse] ?? null,
                        loggedIn: true,
                        strategy: strategy ?? null,
                    };
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
            }
        }

        async loginWith(strategyName: string, value: any): Promise<any> {
            try {
                const loginUrl = this.getHandler(strategyName, 'login');
                if (!loginUrl) throw new Error("Login endpoint not found");

                const response = await $fetch<AuthResponse>(loginUrl, {
                    method: 'POST',
                    body: {strategyName, value}
                });

                if (!response.token) throw new Error("Token is missing in the response")

                sessionStorage.setItem(this._prefix + `_token.` + strategyName, response.token)
                sessionStorage.setItem(this._prefix + `strategy`, strategyName)
                sessionStorage.setItem(this._prefix + `_token_expiration.` + strategyName, response.expires)

                this._state.strategy = strategyName ?? null;
                this.$headers.set('Authorization', response.token);

                const data = await this._setProfile();
                if (data) {
                    const property = this.getUserProperty(strategyName);
                    this._state = {
                        user: data[property as keyof ProfileResponse] ?? null,
                        loggedIn: true,
                        strategy: strategyName ?? null,
                    };

                    this._state = store.value;
                }

                return response ?? Promise.reject('No data returned');

            } catch (error) {
                console.error('Login failed:', error);
                return Promise.reject(error);
            }
        }

        async logout(strategyName: string): Promise<void> {
            try {
                const logoutUrl = this.getHandler(strategyName, 'logout');
                if (!logoutUrl) throw new Error("Logout endpoint not found");

                const response = await $fetch<{ logout?: string }>(logoutUrl, {
                    method: 'POST',
                    body: {strategyName},
                });

                this._state = {
                    user: null,
                    loggedIn: false,
                    strategy: "",
                };
                store.value = this._state

                sessionStorage.clear();

                const redirectUrl = this.getRedirect(strategyName)?.logout ?? '/';
                await navigateTo(redirectUrl);

            } catch (error) {
                console.error('Logout failed:', error);
            }
        }

        async _2fa(strategyName: string, code: string): Promise<{ success: boolean }> {
            try {
                if (!code) {
                    throw new Error("2FA code is required");
                }

                const twoFaUrl = this.getHandler(strategyName, '2fa');
                if (!twoFaUrl) {
                    throw new Error("2FA endpoint not found");
                }

                const response = await $fetch<{ token?: string, expires?: string }>(twoFaUrl, {
                    method: 'POST',
                    body: {strategyName, code}
                });

                if (!response?.token || !response?.expires) {
                    throw new Error("Invalid 2FA response");
                }

                if (import.meta.client) {
                    sessionStorage.setItem(this._prefix + "_2fa." + strategyName, response.token);
                    sessionStorage.setItem(this._prefix + "_2fa_expiration." + strategyName, response.expires);
                }

                this.$headers.set('2fa', response.token);

                return {success: true};

            } catch (error) {
                console.error("2FA failed:", error);
                return Promise.reject(error);
            }
        }

        async refreshToken(strategyName: string): Promise<any> {
            return new Promise((resolve, reject) => {
            })
        }

        async csrfToken(event?: any): Promise<boolean> {
            try {
                const baseURL = useRuntimeConfig().public.baseURL;
                const csrfEndpoint = this.options?.csrf;

                if (!csrfEndpoint) {
                    return false;
                }

                const data = await $fetch<{ csrf_token?: string }>(csrfEndpoint, {baseURL});

                if (!data?.csrf_token) {
                    throw new Error("Invalid CSRF response: Missing token.");
                }

                this.$headers.set('X-CSRF-TOKEN', data.csrf_token);

                if (import.meta.server && event) {
                    const cookies = parseCookies(event);
                    const csrfCookie = cookies["X-CSRF-TOKEN"];

                    if (!csrfCookie) {
                        setCookie(event, "X-CSRF-TOKEN", data.csrf_token, this.options.cookie.options || {
                            httpOnly: true,
                            secure: true,
                            sameSite: "strict",
                            path: "/"
                        });
                    }
                }

                return true;
            } catch (error) {
                console.error('Error fetching CSRF token:', error instanceof Error ? error.message : error);
                return false;
            }
        }

        private async _setProfile(): Promise<ProfileResponse | false> {
            try {
                const baseURL = useRuntimeConfig().public.baseURL;

                const endpoint = this.getEndpointsUser(this._state.strategy!)
                if (!endpoint?.url || !endpoint?.method) return false;

                const headers = this.$headers instanceof Headers ?
                    Object.fromEntries(this.$headers.entries()) : this.$headers;

                const data = await $fetch<ProfileResponse>(endpoint.url, {
                    baseURL,
                    method: endpoint.method,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    }
                });

                if (!data) return false;

                const property = this.getUserProperty(this._state.strategy);
                store.value = {
                    user: data[property as keyof ProfileResponse] ?? null,
                    strategy: this._state.strategy ?? null,
                    loggedIn: true
                }

                this._state = store.value
                return data;
            } catch (error) {
                console.error('Error fetching profile:', error);
                return false;
            }
        }
    }

    const $auth = new Auth(JSON.parse(`<%= JSON.stringify(options, null, 2) %>`));
    const event = import.meta.server ? useRequestEvent() : undefined;
    await $auth.csrfToken(event);
    await $auth.initialize();


    const exposed = Object.defineProperties({}, {
        state: {get: () => $auth.state},
        user: {get: () => $auth.user},
        strategy: {get: () => $auth.strategy},
        loggedIn: {get: () => $auth.loggedIn},
        headers: {
            get: () => $auth.headers,
            set: (headers: Headers) => {
                $auth.headers = headers;
            }
        },
        prefix: {get: () => $auth.prefix},
    });

    exposed.getRedirect = (strategyName: string) => {
        return $auth.getRedirect?.(strategyName) ?? null;
    };

    exposed.loginWith = async (strategyName: string, value: any) => {
        return await $auth.loginWith(strategyName, value);
    };

    exposed.logout = async (strategyName: string) => {
        return await $auth.logout(strategyName);
    };

    exposed._2fa = async (strategyName: string, code: string) => {
        return await $auth._2fa(strategyName, code);
    };

    nuxtApp.provide('auth', exposed)
})