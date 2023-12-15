import getURL from 'requrl'
import {defineStore, storeToRefs} from 'pinia';
import {defineNuxtPlugin, useRuntimeConfig, useFetch, useRequestEvent, useCookie} from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {

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


    // use runtimeConfig
    const {'nuxt-simple-auth': config} = useRuntimeConfig()
    const baseUrl = process.server ? getURL(useRequestEvent().req) : window.location.origin


    class Auth {
        constructor(strategy) {
            const profile = this._setProfile()

            profile.then(response => {
                if (response) {
                    this._state = {user: response.profile, loggedIn: true, strategy: response.type,}
                    this._user = this._state.user
                    this._strategy = this._state.strategy
                    this._loggedIn = this._state.loggedIn
                }
            }).catch(error => {
                console.log(error)
            })
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

        async loginWith(type, value) {
            try {
                const {data, pending, error, refresh} = await useFetch('/api/auth', {
                    baseUrl: baseUrl, method: 'POST', body: {type, value}
                });

                const property = 'profile'
                store.setUser(data.value[property])
                store.setStrategy(type)

                return new Promise((resolve) => {
                    resolve(data.value)
                })

            } catch (error) {
                console.log(error)
            }
        }

        async logout(type) {
            try {
                const {data, pending, error, refresh} = await useFetch('/api/logout', {
                    baseUrl: baseUrl, method: 'POST', body: {type}
                });
                store.$reset()

            } catch (error) {
                console.log(error)
            }
        }

        async _setProfile() {
            try {
                const {data, pending, error, refresh} = await useFetch('/api/profile', {
                    baseUrl: baseUrl, method: 'GET',
                })

                const property = 'profile'
                store.setUser(data.value[property])
                store.setStrategy(data.value.type)

                return new Promise((resolve, reject) => {
                    if (data.value.statusCode === 400) {
                        reject(data.value)
                    }
                    resolve(data.value)
                })

            } catch (error) {
                console.log(error)
            }
        }
    }


    const $auth = new Auth(() => {

        if (process.server) {
            const prefix = config.cookie.prefix && !import.meta.dev ? config.cookie.prefix : 'auth.'
            return useCookie(`${prefix}strategy`)
        }

    })

    $auth._Pinia = store.$state

    nuxtApp.provide('auth', $auth)

})
