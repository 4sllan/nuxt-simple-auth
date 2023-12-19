import getURL from 'requrl'
import {defineStore, storeToRefs} from 'pinia';
import {defineNuxtPlugin, useRuntimeConfig, useFetch, useRequestEvent, useCookie} from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {

    // pinia config
    const authState = {
        user: false, loggedIn: false, strategy: "",
    }

    const useAuthStore = defineStore('auth', {
        state: () => authState, actions: {
            setUser(data) {
                this.user = data;
                this.loggedIn = true;
            },
            setStrategy(data) {
                this.strategy = data
            },
        },
    })


    const store = useAuthStore()

    const {user, loggedIn, strategy} = storeToRefs(store)


    // $auth Config

    // use runtimeConfig
    const {
        'nuxt-simple-auth': config,
        public: {
            siteURL,
            apiBase,
        }
    } = useRuntimeConfig()


    const baseUrl = process.server ? getURL(useRequestEvent().req) : window.location.origin


    class Auth {
        constructor() {
            const profile = this._setProfile()

            profile.then(response => {

                if (response) {
                    this.httpHeaders = ['authorization', response.token]
                    this._state = {user: response.profile, loggedIn: true, strategy: response.type,}
                    this._user = this._state.user
                    this._strategy = this._state.strategy
                    this._loggedIn = this._state.loggedIn
                }
            })
        }

        set httpHeaders(headers) {
            return this._headers = new Headers([headers])
        }

        get httpHeaders() {
            return this._headers
        }

        set _Pinia(val) {
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

        async loginWith(strategyName, value) {
            try {
                const {data, pending, error, refresh} = await useFetch('/api/auth', {
                    baseUrl: siteURL || baseUrl, method: 'POST', body: {strategyName, value},

                    onResponse({request, response, options}) {
                        const {
                            strategyName,
                            token,
                            expires,
                            prefix
                        } = response._data;

                        sessionStorage.setItem(`${prefix}_token.${strategyName}`, token)
                        sessionStorage.setItem(`${prefix}strategy`, expires)
                        sessionStorage.setItem(`${prefix}_token_expiration.${strategyName}`, expires)
                    },
                });

                const property = 'profile'
                store.setUser(data.value[property])
                store.setStrategy(strategyName)

                return new Promise((resolve, reject) => {
                    if (data.value) {
                        return resolve(data.value)
                    }

                    return reject()

                })

            } catch (error) {
                console.log(error)
            }
        }

        async logout(strategyName) {
            try {
                const {data, pending, error, refresh} = await useFetch('/api/logout', {
                    baseUrl: siteURL || baseUrl, method: 'POST', body: {strategyName}
                });
                store.$reset()
                sessionStorage.clear()

                if (data.value) {
                    return navigateTo('/');
                }

            } catch (error) {
                console.log(error)
            }
        }

        async _2fa(strategyName, code) {
            const {data} = await useFetch('/api/2fa', {
                baseUrl: siteURL || baseUrl, method: 'POST', body: {strategyName, code},

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


            return new Promise((resolve, reject) => {
                if (data.value) {
                    return resolve(data.value)
                }
                return reject()
            })
        }

        async _setProfile() {
            try {
                const {data} = await useFetch('/api/profile', {
                    baseUrl: siteURL || baseUrl, method: 'GET',
                })

                if (data.value) {

                    const property = 'profile'
                    store.setUser(data.value[property])
                    store.setStrategy(data.value.type)


                    return data.value

                }

                return false


            } catch (error) {
                console.log(error)
            }
        }

    }

    const $auth = new Auth()

    const t = await $auth._setProfile()


    if (t) {

        $auth.httpHeaders = ['authorization', t?.token]
    }

    $auth._Pinia = store.$state

    nuxtApp.provide('auth', $auth)

})
