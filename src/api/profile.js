import {useRuntimeConfig} from '#imports'
export default defineEventHandler(async (event) => {
    const {'nuxt-simple-auth': config} = useRuntimeConfig(event)
    const {cookie, strategies} = config
    const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'

    const cookies = parseCookies(event)

    var type = cookies[`${prefix}strategy`]
    var token = cookies[`${prefix}_token.${type}`]

    if (token !== false && type) {
        const {endpoints: e, scheme: s, token: t, user: u} = strategies[type]

        console.log('text')

        const data = {...await getProfile(e, token), type, token}

        console.log(data)
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


    const profile = 'profile'

    return {profile}
})