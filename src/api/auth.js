import {useRuntimeConfig} from '#imports'
import {useFetch} from '@vueuse/core'

export default defineEventHandler(async (event) => {
    let {type, el: data} = await readBody(event)

    const {'nuxt-simple-auth': config} = useRuntimeConfig(event)

    const {cookie, strategies} = config
    const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'
    const {endpoints: e, scheme: s, token: t, user: u} = strategies[type]

    const {token, expires} = await getToken(e, data)

    if (token) {
        setCookie(event, `${prefix}_token.${type}`, token, cookie.options)
        setCookie(event, `${prefix}strategy`, type, cookie.options)
        setCookie(event, `${prefix}_token_expiration.${type}`, expires, cookie.options)

        const k = {...await getProfile(e, token), type, token}

        return {k};
    }

    async function getToken(endpoints, data) {
        try {
            const {data, pending, error, refresh} = await useFetch(endpoints.login.url, {
                method: endpoints.login.method,
                body: data
            });


            const {token_type, expires_in, access_token, refresh_token} = data.value;
            const token = token_type + " " + access_token;
            const expires = expires_in + Date.now();

            return {token, expires}


        } catch (err) {
            console.log(err)
        }
    }

    async function getProfile(endpoints, token) {
        try {
            const {data, pending, error, refresh} = await useFetch(endpoints.user.url, {
                method: endpoints.user.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            });
            console.log(endpoints.user.method)
            return data

        } catch (err) {
            console.log(err)
        }
    }
})
