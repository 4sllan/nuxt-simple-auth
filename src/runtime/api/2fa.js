import {useRuntimeConfig} from "#imports";

export default defineEventHandler(async (event) => {
    let {strategyName, code} = await readBody(event)

    const {
        'nuxt-simple-auth': config,
        public: {
            baseURL,
            apiBase
        },
    } = useRuntimeConfig(event)

    const {cookie, strategies} = config
    const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'
    const {endpoints: e, scheme: s, token: t, user: u} = strategies[strategyName]

    const {token, expires} = await get2fa(e, code)

    if (token) {
        setCookie(event, `${prefix}_2fa.${type}`, token, cookie.options)
        setCookie(event, `${prefix}_2fa_expiration.${type}`, expires, cookie.options)

        return {token, expires}
    }

    async function get2fa(endpoints, value) {
        try {
            console.log(baseURL)
            const data = await $fetch(endpoints['2fa'].url, {
                baseURL: baseURL,
                method: endpoints['2fa'].method,
                body: value,
            });

            const {token_type, expires_in, access_token, refresh_token} = data;
            const token = token_type + " " + access_token;
            const expires = expires_in + Date.now();

            return {token, expires}


        } catch (err) {
            console.log(err)
        }
    }
})