import {useRuntimeConfig} from '#imports'

export default defineEventHandler(async (event) => {

    const {'nuxt-simple-auth': config, public: {siteUrl, apiBase}} = useRuntimeConfig(event)
    const {cookie, strategies} = config
    const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'

    var type = getCookie(event, `${prefix}strategy`)
    var token = getCookie(event, `${prefix}_token.${type}`)

    if (token && type) {

        const {endpoints: e, scheme: s, token: t, user: u} = strategies[type]


        return {...await getProfile(e, token), type, token}

    }

    return {
        statusCode: 400,
        statusMessage: 'Acesso não autorizado',
    }

    async function getProfile(endpoints, token) {
        try {
            return await $fetch(endpoints.user.url, {
                baseURL: siteUrl,
                method: endpoints.user.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            });

        } catch (err) {
            console.log(err)
        }
    }

})