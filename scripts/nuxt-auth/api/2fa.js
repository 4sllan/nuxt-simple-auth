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

    const getResponseToken = getCookie(event, `${prefix}_token.${strategyName}`)


    const {_2fa, expiration} = await get2fa(e, code, getResponseToken)


    if (_2fa) {

        setCookie(event, `${prefix}_2fa.${strategyName}`, _2fa, cookie.options)
        setCookie(event, `${prefix}_2fa_expiration.${strategyName}`, expiration, cookie.options)

        return {
            _2fa,
            expiration,
            prefix,
            strategyName
        }
    }

    return false

    async function get2fa(endpoints, value, token) {
        try {
            const data = await $fetch(endpoints['2fa'].url, {
                baseURL: baseURL,
                method: endpoints['2fa'].method,
                body: value,
                onRequest({request, options}) {
                    options.headers = options.headers || {}
                    options.headers.Authorization = token
                },
            });

            const {token_2fa, expiration} = data;

            return {
                _2fa: token_2fa,
                expiration
            }

        } catch (err) {
            console.log(err)
        }
    }
})