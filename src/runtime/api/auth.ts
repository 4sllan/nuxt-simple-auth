import {useRuntimeConfig} from '#imports'
import {defineEventHandler, readBody, setCookie, createError, setHeader} from 'h3'
import type {
    ModuleOptions
} from '../types'

export default defineEventHandler(async (event) => {
    let {strategyName, value} = await readBody(event)

    const {
        'nuxt-simple-auth': config,
        public: {
            baseURL,
        },
        secret,
    } = useRuntimeConfig()

    const {cookie, strategies} = <ModuleOptions>config
    const prefix = cookie?.prefix && !import.meta.dev ? cookie?.prefix : 'auth.'
    const {redirect, token: t, user: u, endpoints: e} = strategies[strategyName]


    const j: any = await getToken(e, value)

    if (j.status) {
        throw createError({
            statusCode: j.status,
            statusMessage: j.message,
        })
    }

    const {token, expires} = j as { token: string, expires: string }

    if (token) {
        setCookie(event, `${prefix}_token.${strategyName}`, token, <{}>cookie?.options)
        setCookie(event, `${prefix}strategy`, strategyName, <{}>cookie?.options)
        setCookie(event, `${prefix}_token_expiration.${strategyName}`, expires, <{}>cookie?.options)

        return {...await getProfile(e, token), strategyName, token, expires, prefix}
    }


    throw createError({
        statusCode: 500,
        statusMessage: j.message,
    })

    async function getToken(endpoints: any, value: any): Promise<any> {
        try {
            const data = await $fetch(endpoints.login.url, {
                baseURL: <string>baseURL,
                method: endpoints.login.method || 'POST',
                body: {...value, ...secret[strategyName]},
            });

            const {token_type, expires_in, access_token, refresh_token} = data;
            const token = token_type + " " + access_token;
            const expires = expires_in + Date.now();

            return {token, expires}

        } catch (error) {
            return error
        }
    }

    async function getProfile(endpoints: any, token: string): Promise<any> {
        try {
            return await $fetch(endpoints.user.url, {
                baseURL: <string>baseURL,
                method: endpoints.user.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                onRequest({request, options}) {
                    setHeader(event, 'Authorization', token)
                },
            });

        } catch (error) {
            console.log(error)
        }
    }
})
