import {useRuntimeConfig, defineNuxtRouteMiddleware, useNuxtApp, useCookie} from '#imports'
import {getActivePinia} from 'pinia';

export default defineNuxtRouteMiddleware(async (to, from) => {

    const nuxtApp = useNuxtApp()
    const {_s: store} = getActivePinia('auth')

    const {user, loggedIn, strategy, state, $reset,} = store.get('auth')

    const {'nuxt-simple-auth': config} = useRuntimeConfig(nuxtApp)

    const {$auth} = useNuxtApp()


    if (process.server) {

        const {cookie} = config
        const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'

        const type = useCookie(`${prefix}strategy`);

        if (type.value) {
            const token = useCookie(`${prefix}_token.${type.value}`);
            const expires = useCookie(`${prefix}_token_expiration.${type.value}`);

            if (!token.value) {
                abortNavigation()
                return navigateTo('/');
            }

            const time = ((expires.value - Date.now()) / 60000)

            if (!time) {
                abortNavigation()
                return navigateTo('/');
            }


        }

    }
    if (process.client) {

        const {public: {prefix}} = useRuntimeConfig(nuxtApp)
        const usePrefix = prefix && !import.meta.dev ? prefix : 'auth.'

        const token = sessionStorage.getItem(`${usePrefix}_token.${strategy}`)
        const expires = sessionStorage.getItem(`${usePrefix}_token_expiration.${strategy}`)

        $auth._headers.set('authorization', token)

        if (!token) {
            await $auth.logout(strategy)
            sessionStorage.clear()
            return navigateTo('/');
        }

        const time = ((expires - Date.now()) / 60000)

        if (!time) {
            await $auth.logout(strategy)
            sessionStorage.clear()
            return navigateTo('/');
        }

        if (strategy) {
            if (typeof user !== 'object' || user === false) {
                await $auth.logout(strategy)
                return navigateTo('/');
            }

            if (typeof loggedIn !== 'boolean' || loggedIn === false) {
                await $auth.logout(strategy)
                return navigateTo('/');
            }
        }

        if (!strategy) {
            abortNavigation()
            return navigateTo('/');
        }
    }
})