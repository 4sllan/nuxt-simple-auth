import {defineStore, storeToRefs} from 'pinia';
import {defineNuxtPlugin, useRuntimeConfig, useFetch, useRequestEvent, navigateTo} from '#imports'
import type {
    IAuth,
    AuthState,
    PropertyProfile
} from './types'


export default defineNuxtPlugin(async (nuxtApp) => {
    /**
     * Pinia
     */
    const authState: AuthState = {
        user: false, loggedIn: false, strategy: "",
    }

    const useAuthStore = defineStore('auth', {
        state: () => authState, actions: {
            setUser(data: any): void {
                this.user = data;
                this.loggedIn = true;
            },
            setStrategy(data: string): void {
                this.strategy = data
            },
        },
    })


    const store = useAuthStore()

    const {
        user,
        loggedIn,
        strategy
    } = storeToRefs(store)

    /**
     * Auth
     */

    class Auth implements IAuth {
        $headers: any;
        private _state: any;
        private _user: any;
        private _strategy: any;
        private _loggedIn: any;

        constructor() {
            const profile = this._setProfile()

            profile.then(response => {

                if (response) {
                    this.$headers.set('authorization', response.token)
                    this._state = {user: response.profile, loggedIn: true, strategy: response.type}
                    this._user = this._state.user
                    this._strategy = this._state.strategy
                    this._loggedIn = this._state.loggedIn
                }
            })
        }

        set httpHeaders(headers: any) {
            this.$headers = headers
        }

        set _Pinia(val: AuthState) {
            this._state = val
            this._user = val.user
            this._strategy = val.strategy
            this._loggedIn = val.loggedIn
        }

        get state() {
            return this._state
        }

        get user() {
            return this._user
        }

        get strategy() {
            return this._strategy
        }

        get loggedIn() {
            return this._loggedIn
        }

        async loginWith(strategyName: string, value: any) {
            try {
                const {
                    data,
                    error
                } = await useFetch<any>('/api/auth', {
                    method: 'POST', body: {strategyName, value},

                    onResponse({request, response, options}) {
                        const {
                            strategyName,
                            token,
                            expires,
                            prefix
                        } = response._data;

                        sessionStorage.setItem(`${prefix}_token.${strategyName}`, token)
                        sessionStorage.setItem(`${prefix}strategy`, strategyName)
                        sessionStorage.setItem(`${prefix}_token_expiration.${strategyName}`, expires)
                    },
                });

                if (!error?.value) {
                    const property: string = 'profile'
                    store.setUser(data.value[property])
                    store.setStrategy(strategyName)

                    $auth._Pinia = store.$state

                    return new Promise((resolve, reject) => {
                        if (data.value) {
                            return resolve(data.value)
                        }

                        return reject()

                    })
                } else {
                    const e = error.value;
                    throw new Error(e.statusMessage, {
                        cause: {status: e.statusCode, message: e.statusMessage},
                    })
                }

            } catch (error) {
                if (error instanceof Error) return Promise.reject(error.cause)
                else reportError(error)
            }
        }

        async logout(strategyName: string) {
            try {
                const {
                    data, pending,
                    error, refresh
                } = await useFetch<any>('/api/logout', {
                    method: 'POST', body: {strategyName},

                    onResponse({request, response, options}) {
                        const {logout} = response._data
                        return navigateTo(logout ?? '/');
                    }
                });
                store.$reset()
                sessionStorage.clear()
                return data.value

            } catch (error) {
                reportError(error)
            }
        }

        async _2fa(strategyName: string, code: any) {
            try {
                const {
                    data,
                    error
                } = await useFetch<any>('/api/2fa', {
                    method: 'POST', body: {strategyName, code},

                    onResponse({request, response, options}) {
                        const {
                            _2fa,
                            expiration,
                            prefix,
                            strategyName
                        } = response._data;

                        sessionStorage.setItem(`${prefix}_2fa.${strategyName}`, _2fa)
                        sessionStorage.setItem(`${prefix}_2fa_expiration.${strategyName}`, expiration)
                    },
                })

                if (!error?.value) {
                    return new Promise((resolve, reject) => {
                        if (data.value) {
                            return resolve(data.value)
                        }
                        return reject()
                    })
                } else {
                    const e = error.value;
                    throw new Error(e.statusMessage, {
                        cause: {status: e.statusCode, message: e.statusMessage},
                    })
                }

            } catch (error) {
                if (error instanceof Error) return Promise.reject(error.cause)
                else reportError(error)
            }
        }

        async _setProfile() {
            try {
                const {data} = await useFetch<any>('/api/profile')

                if (data?.value) {
                    const property: string = 'profile'
                    store.setUser(data.value[property])
                    store.setStrategy(data.value.strategyName)

                    $auth._Pinia = store.$state

                    return data.value
                }

                return false

            } catch (error) {
                return error
            }
        }

    }

    const $auth = new Auth()

    $auth.httpHeaders = new Headers([])

    const t: any = await $auth._setProfile()

    if (t) {
        $auth.$headers.set('authorization', t?.token)
    }

    $auth._Pinia = store.$state

    nuxtApp.provide('auth', $auth)
})
