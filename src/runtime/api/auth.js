import {useRuntimeConfig} from '#imports'


export default defineEventHandler(async (event) => {
    let {type, value} = await readBody(event)

    const {
        'nuxt-simple-auth': config,
        public: {
            siteUrl,
            apiBase
        },
        grant_type,
        client_id,
        client_secret
    } = useRuntimeConfig(event)

    const {cookie, strategies} = config
    const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'
    const {endpoints: e, scheme: s, token: t, user: u} = strategies[type]

    const {token, expires} = await getToken(e, value)

    if (token) {
        setCookie(event, `${prefix}_token.${type}`, token, cookie.options)
        setCookie(event, `${prefix}strategy`, type, cookie.options)
        setCookie(event, `${prefix}_token_expiration.${type}`, expires, cookie.options)

        return {...await getProfile(e, token), type, token}
    }

    async function getToken(endpoints, value) {
        try {
            const data = await $fetch(endpoints.login.url, {
                baseURL: siteUrl,
                method: endpoints.login.method,
                body: {...value, grant_type, client_id, client_secret},
            });

            const {token_type, expires_in, access_token, refresh_token} = data;
            const token = token_type + " " + access_token;
            const expires = expires_in + Date.now();

            return {token, expires}


        } catch (err) {
            console.log(err)
        }
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
