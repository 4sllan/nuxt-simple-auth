import {useRuntimeConfig} from '#imports'

export default defineNuxtRouteMiddleware(async (to, from) => {

    const nuxtApp = useNuxtApp()
    const {_s: store} = usePinia('auth')

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
            const time = ((expires.value - Date.now()) / 60000)

            if (!time) {
                abortNavigation()
                return navigateTo('/');
            }

            if (!token.value && !time) {
                abortNavigation()
                return navigateTo('/');
            }


        }

        if (!type.value) {
            abortNavigation()
            return navigateTo('/');
        }
    }
    if (process.client) {

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