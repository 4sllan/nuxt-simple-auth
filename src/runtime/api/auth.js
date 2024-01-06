import {useRuntimeConfig} from '#imports'
import {defineEventHandler, readBody, setCookie, createError} from 'h3'

export default defineEventHandler(async (event) => {
    let {strategyName, value} = await readBody(event)

    const {
        'nuxt-simple-auth': config,
        public: {
            baseURL,
            apiBase
        },
        grant_type,
        client_id,
        client_secret
    } = useRuntimeConfig(event)

    const {cookie, strategies} = config
    const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'
    const {redirect: r, token: t, user: u, endpoints: e} = strategies[strategyName]


    const j = await getToken(e, value)

    if (j.status) {
        throw createError({
            statusCode: j.status,
            statusMessage: j.message,
        })
    }

    const {token, expires} = j


    if (token) {
        setCookie(event, `${prefix}_token.${strategyName}`, token, cookie.options)
        setCookie(event, `${prefix}strategy`, strategyName, cookie.options)
        setCookie(event, `${prefix}_token_expiration.${strategyName}`, expires, cookie.options)

        return {...await getProfile(e, token), strategyName, token, expires, prefix}
    }


    return false

    async function getToken(endpoints, value) {
        try {
            const data = await $fetch(endpoints.login.url, {
                baseURL: baseURL,
                method: endpoints.login.method,
                body: {...value, grant_type, client_id, client_secret},
            });

            const {token_type, expires_in, access_token, refresh_token} = data;
            const token = token_type + " " + access_token;
            const expires = expires_in + Date.now();

            return {token, expires}

        } catch (error) {
            return error
        }
    }

    async function getProfile(endpoints, token) {
        try {
            //console.log(getRequestHeaders(event, 'headers'))
            return await $fetch(endpoints.user.url, {
                baseURL: baseURL,
                method: endpoints.user.method,
                onRequest({request, options}) {
                    // Set the request headers
                    options.headers = options.headers || {}
                    options.headers.Authorization = token
                    //console.log(options)
                },
            });

        } catch (error) {
            console.log(error)
        }
    }
})
