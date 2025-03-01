import {
    defineNuxtPlugin,
    useRequestEvent,
    navigateTo,
    useAuthStore,
    useFetch,
    reloadNuxtApp,
    useRuntimeConfig
} from '#imports'
import {parseCookies} from 'h3';
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
        private $headers: Headers;
        private _state: AuthState = {user: null, loggedIn: false, strategy: null};
        private prefix: string;
        private readonly options: Record<string, any>;

        constructor(options: Record<string, any>) {
            this.$headers = new Headers();
            this.prefix = options.cookie.prefix;
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

        set headers(headers: Headers) {
            this.$headers = new Headers(headers);
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
                    strategy = cookies[this.prefix + `strategy`]
                    token = strategy ? cookies[this.prefix + `_token.` + strategy] : null;
                } else {
                    strategy = sessionStorage.getItem(this.prefix + `strategy`);
                    token = strategy ? sessionStorage.getItem(this.prefix + `_token.` + strategy) : null;
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

                if (import.meta.client) {

                    const {token, expires} = response;

                    if (!token) throw new Error("Token is missing in the response");

                    sessionStorage.setItem(this.prefix + `_token.` + strategyName, token);
                    sessionStorage.setItem(this.prefix + `strategy`, strategyName);
                    sessionStorage.setItem(this.prefix + `_token_expiration.` + strategyName, expires);
                }

                const property = this.getUserProperty(strategyName) as keyof AuthResponse;
                store.value = {
                    user: response[property],
                    strategy: strategyName,
                    loggedIn: true
                };

                this._state = store.value;

                return response ?? Promise.reject('No data returned');

            } catch (error) {
                console.error('Login failed:', error);
                return Promise.reject(error);
            }
        }

        async logout(strategyName: string): Promise<void> {
            try {
                const response = await $fetch<{ logout?: string }>('/api/logout', {
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

        private async _setProfile(): Promise<ProfileResponse | false> {
            try {
                const {public: {baseURL}} = useRuntimeConfig();

                const endpoint = this.getEndpointsUser(this._state.strategy!)
                if (!endpoint?.url || !endpoint?.method) return false;

                this.$headers.set('Content-Type', 'application/json');

                const data = await $fetch<ProfileResponse>(endpoint.url, {
                    baseURL,
                    method: endpoint.method,
                    headers: this.$headers
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

    const $auth: AuthInstance = new Auth(JSON.parse(`<%= JSON.stringify(options, null, 2) %>`));

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
        }
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

    nuxtApp.provide('auth', exposed)
})