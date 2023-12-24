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
            const token = useCookie(`${prefix}_2fa.${type.value}`);
            const expires = useCookie(`${prefix}_2fa_expiration.${type.value}`);

            $auth._headers.set('2fa', token.value)


            // const time = ((expires - Date.now()) / 60000)


        }
    }
    if (process.client) {

        const {public: {prefix}} = useRuntimeConfig(nuxtApp)
        const usePrefix = prefix && !import.meta.dev ? prefix : 'auth.'

        const token = sessionStorage.getItem(`${usePrefix}_2fa.${strategy}`)
        const expiration = sessionStorage.getItem(`${usePrefix}_2fa_expiration.${strategy}`)

        $auth._headers.set('2fa', token)

        if (!token) {
            await $auth.logout(strategy)
            sessionStorage.clear()
            return navigateTo('/');
        }

        // const time = ((expires - Date.now()) / 60000)
        //
        // if (!time) {
        //     await $auth.logout(strategy)
        //     sessionStorage.clear()
        //     return navigateTo('/');
        // }
    }
})