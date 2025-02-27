import {
    defineNuxtPlugin,
    useRequestEvent,
    navigateTo,
    useAuthStore,
    useFetch,
    reloadNuxtApp
} from '#imports'
import {parseCookies} from 'h3';
import { $fetch } from 'ofetch';
import type {
    AuthState,
    ProfileResponse,
    AuthResponse,
    AuthInstance,
} from './types'

export default defineNuxtPlugin(async (nuxtApp) => {
    const store = useAuthStore()

    class Auth implements AuthInstance{
        private $headers: Headers;
        private _state: AuthState = {user: null, loggedIn: false, strategy: null};
        private prefix: string;
        private readonly options: Record<string, any>;
        constructor(options: Record<string, any>) {
            this.$headers = new Headers();
            this.prefix = options.cookie.prefix;
            this.options = options;

            this.initialize();
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

        set httpHeaders(headers: Headers) {
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
        private getHandler(strategyName: string, key: string): string | null {
            return (
                this.options.strategies?.[strategyName]?.handler?.find((value: any) => value[key])?.[key] ?? null
            );
        }

        private async initialize(): Promise<void> {
            try {

                if (import.meta.server) {

                    const event = useRequestEvent();

                    if (!event) {
                        console.warn("No request event available. Skipping initialization.");
                        return;
                    }

                    const cookies = parseCookies(event);

                    const strategy = cookies[this.prefix + `strategy`]
                    const token = strategy ? cookies[this.prefix + `_token.` + strategy] : null;

                    if (!strategy || !token) {
                        console.warn("No valid session found. Skipping profile fetch.");
                        return;
                    }

                    this._state.strategy = strategy
                }
                if (import.meta.client) {

                    const strategy = sessionStorage.getItem(this.prefix + `strategy`);
                    const token = strategy ? sessionStorage.getItem(this.prefix + `_token.` + strategy) : null;

                    if (!strategy || !token) {
                        console.warn("No valid session found. Skipping profile fetch.");
                        return;
                    }

                    this._state.strategy = strategy
                }

                const profile = await this._setProfile();
                if (profile) {
                    this.$headers.set('authorization', profile.token);
                    this._state = {
                        user: profile.profile,
                        loggedIn: true,
                        strategy: profile.strategyName,
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
                store.value.user = response[property];
                store.value.strategy = strategyName;
                store.value.loggedIn = true;

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
                const profileUrl = this.getHandler(this._state.strategy!, 'user');
                if (!profileUrl) return false;


                const {data, error} = await useFetch<ProfileResponse>(profileUrl);

                if (error.value || !data.value) return false;

                const property = this.getUserProperty(data.value.strategyName)as keyof ProfileResponse;
                store.value.user = data.value[property];
                store.value.strategy = data.value.strategyName;
                store.value.loggedIn = true;

                this._state = store.value;

                return data.value;

            } catch (error) {
                console.error('Error fetching profile:', error);
                return false;
            }
        }
    }

    const $auth = new Auth(JSON.parse(`<%= JSON.stringify(options, null, 2) %>`));

    nuxtApp.provide('auth', $auth)
})