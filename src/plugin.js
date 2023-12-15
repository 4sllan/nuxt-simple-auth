import getURL from 'requrl'
import {defineStore, storeToRefs} from 'pinia';
import {defineNuxtPlugin, useRuntimeConfig, useFetch, useRequestEvent} from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {

    const authState = {
        user: false,
        loggedIn: false,
        strategy: "",
    }

    const useAuthStore = defineStore('auth', {
        state: () => authState,
        actions: {
            setUser(data) {
                this.user = data;
                this.loggedIn = true;
            },
            setStrategy(data) {
                this.strategy = data
            },
            destroy(data) {
                this.state = authState
            }
        },
    })


    const store = useAuthStore()

    const {user, loggedIn, strategy} = storeToRefs(store)


    // use runtimeConfig
    const runtimeConfig = useRuntimeConfig()
    const baseUrl = process.server ? getURL(useRequestEvent().req) : window.location.origin


    class Auth {
        constructor() {
            const profile = this._setProfile()
            //console.log(profile)
            // profile.then(response => {
            //     if (response) {
            //         this._state = {
            //             user: response.profile,
            //             loggedIn: true,
            //             strategy: response.type,
            //         }
            //         this._user = this._state.user
            //         this._strategy = this._state.strategy
            //         this._loggedIn = this._state.loggedIn
            //     }
            // }).catch(error => {
            //
            // })
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

        async loginWith(type, el) {
            try {
                const {data, pending, error, refresh} = await useFetch('/api/auth', {
                    baseUrl: baseUrl,
                    method: 'POST',
                    body: {type, el}
                });

                console.log(data.value)


                // return await axios.post('/api/auth', {type, data: data.data})
                //     .then(response => {
                //         const module = 'auth/'
                //         store.dispatch(module + 'setUser', response.data.profile)
                //         store.dispatch(module + 'setStrategy', type)
                //         $axios.setToken(response.data.token)
                //     });
            } catch (err) {
                //console.log(red + err)
            }
        }

        async logout(type) {
            try {
                return await axios.post('/api/logout', {type})
                    .then(response => {
                        store.dispatch('auth/' + 'destroy')
                    })
            } catch (err) {
                //console.log(red + err)
            }
        }

        async _setProfile() {
            try {

                const {data, pending, error, refresh} = await useFetch('/api/profile', {
                    baseUrl: baseUrl
                })

                console.log(data.value)

                // if (data.value[profile]) {
                //
                // }
                //
                // return data

                // return baseUrl;
                // return await axios.get('/api/profile')
                //     .then((response) => {
                //         if (response.data.profile) {
                //             const module = 'auth/'
                //             store.dispatch(module + 'setUser', response.data.profile)
                //             store.dispatch(module + 'setStrategy', response.data.type)
                //             $axios.setToken(response.data.token)
                //             $axios.defaults.headers.common['Authorization'] = response.data.token
                //             return response.data;
                //         }
                //     })

            } catch (err) {
                //console.log(red + err)
            }
        }
    }

    const $auth = new Auth()

    $auth._Pinia = store.$state


    // const {data: response, pending, error, refresh} = await useFetch('/api/auth')
    //
    // console.log(response)

    nuxtApp.provide('auth', $auth)

})
