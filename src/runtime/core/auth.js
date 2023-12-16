import getURL from 'requrl'
import {useRuntimeConfig, useFetch, useRequestEvent} from '#imports'

export default defineNuxtRouteMiddleware(async (to, from) => {

    const nuxtApp = useNuxtApp()
    const {_s: store} = usePinia('auth')

    const {user, loggedIn, strategy, state, $reset,} = store.get('auth')

    const {'nuxt-simple-auth': config} = useRuntimeConfig(nuxtApp)
    const baseUrl = process.server ? getURL(useRequestEvent().req) : window.location.origin


    const {$auth} = useNuxtApp()

    //Todo <-- $auth -->
    class AuthClassMiddleware {
        async logout(type) {
            try {
                const {data, pending, error, refresh} = await useFetch('/api/logout', {
                    baseUrl: baseUrl, method: 'POST', body: {type}
                });

            } catch (error) {
                console.log(error)
            }
        }
    }

    const authClassMiddleware = new AuthClassMiddleware()


    if (process.server) {

        const {cookie} = config
        const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'

        const type = useCookie(`${prefix}strategy`);

        if (type.value) {

            const token = useCookie(`${prefix}_token.${type.value}`);
            const expires = useCookie(`${prefix}_token_expiration.${type.value}`);

            let i = ((expires.value - Date.now()) / 60000);

            if (!Boolean(i)) {
                await authClassMiddleware.logout(type)
                abortNavigation()
                return navigateTo('/');
            }

            if (token.value && type && !Boolean(i)) {
                await authClassMiddleware.logout(type)
                abortNavigation()
                return navigateTo('/');

            }

            if (typeof user !== 'object' || user === false) {
                await $auth.logout(type)
                return navigateTo('/');
            }

            if (typeof loggedIn !== 'boolean' || loggedIn === false) {
                await authClassMiddleware.logout(type)
                return navigateTo('/');
            }

            if (typeof strategy !== 'string' || !strategy) {
                await authClassMiddleware.logout(type)
                return navigateTo('/');
            }
        }

        if (!type.value) {
            abortNavigation()
            return navigateTo('/');
        }
    }

})