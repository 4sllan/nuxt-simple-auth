import {defineNuxtPlugin, useRuntimeConfig, useFetch, useRequestEvent, navigateTo} from '#imports'
import {useAuthStore} from './composables/useStates'

import type {
    AuthState,
    ProfileResponse,
    AuthResponse
} from './types'

class Auth {
    private $headers: Headers;
    private _state: AuthState = { user: null, loggedIn: false, strategy: null };

    constructor() {
        this.$headers = new Headers();
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

    private async initialize(): Promise<void> {
        try {
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
            const { data, error } = await useFetch<AuthResponse>('/api/auth', {
                method: 'POST',
                body: { strategyName, value },
                onResponse({ response }) {
                    const { strategyName, token, expires, prefix } = response._data;
                    sessionStorage.setItem(`${prefix}_token.${strategyName}`, token);
                    sessionStorage.setItem(`${prefix}strategy`, strategyName);
                    sessionStorage.setItem(`${prefix}_token_expiration.${strategyName}`, expires);
                },
            });

            if (error?.value) throw new Error(error.value.statusMessage);

            return data?.value ?? Promise.reject('No data returned');
        } catch (error) {
            console.error('Login failed:', error);
            return Promise.reject(error);
        }
    }

    async logout(strategyName: string): Promise<void> {
        try {
            const { data } = await useFetch<{ logout?: string }>('/api/logout', {
                method: 'POST',
                body: { strategyName },
                onResponse({ response }) {
                    navigateTo(response._data.logout ?? '/');
                },
            });

            this._state = { user: null, loggedIn: false, strategy: null };
            sessionStorage.clear();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    async _2fa(strategyName: string, code: any): Promise<any> {
        try {
            const { data, error } = await useFetch<{ _2fa: string; expiration: string; prefix: string }>('/api/2fa', {
                method: 'POST',
                body: { strategyName, code },
                onResponse({ response }) {
                    const { _2fa, expiration, prefix } = response._data;
                    sessionStorage.setItem(`${prefix}_2fa.${strategyName}`, _2fa);
                    sessionStorage.setItem(`${prefix}_2fa_expiration.${strategyName}`, expiration);
                },
            });

            if (error?.value) throw new Error(error.value.statusMessage);

            return data?.value ?? Promise.reject('2FA verification failed');
        } catch (error) {
            console.error('2FA failed:', error);
            return Promise.reject(error);
        }
    }

    private async _setProfile(): Promise<ProfileResponse | false> {
        try {
            const { data } = await useFetch<ProfileResponse>('/api/profile');

            if (!data?.value) return false;

            this._state = {
                user: data.value.profile,
                loggedIn: true,
                strategy: data.value.strategyName,
            };

            return data.value;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return false;
        }
    }
}

const $auth = new Auth();

export default defineNuxtPlugin(async (nuxtApp) => {
    nuxtApp.provide('auth', $auth)
})