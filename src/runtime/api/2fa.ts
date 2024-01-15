import {useRuntimeConfig} from "#imports";
import {defineEventHandler, readBody, getCookie, setCookie, createError, setHeader} from 'h3'
import type {
    ModuleOptions
} from '../types'

export default defineEventHandler(async (event) => {
    let {strategyName, code} = await readBody(event)


    const {
        'nuxt-simple-auth': config,
        public: {
            baseURL,
        },
    } = useRuntimeConfig()

    const {cookie, strategies} = <ModuleOptions>config
    const prefix = cookie?.prefix && !import.meta.dev ? cookie?.prefix : 'auth.'
    const {endpoints: e, token: t, user: u} = strategies[strategyName]

    const getResponseToken: string = getCookie(event, `${prefix}_token.${strategyName}`) || ''

    console.log(getResponseToken)
    console.log('getResponseToken')

    const j: any = await get2fa(e, code, getResponseToken)

    if (j.status) {
        throw createError({
            statusCode: j.status,
            statusMessage: j.message,
        })
    }

    const {_2fa, expiration} = j as { _2fa: string, expiration: string }

    if (_2fa) {

        const expires: string =
            Number.isNaN(Number(expiration)) ? new Date(expiration).getTime().toString() : expiration;

        setCookie(event, `${prefix}_2fa.${strategyName}`, _2fa, <{}>cookie?.options)
        setCookie(event, `${prefix}_2fa_expiration.${strategyName}`, expires, <{}>cookie?.options)

        return {
            _2fa,
            expiration: expires,
            prefix,
            strategyName
        }
    }

    throw createError({
        statusCode: 500,
        statusMessage: j.message,
    })

    async function get2fa(endpoints: any, value: any, token: string) {
        try {
            const data = await $fetch(endpoints['2fa'].url, {
                baseURL: <string>baseURL,
                method: endpoints['2fa'].method,
                body: value,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                onRequest({request, options}) {
                    options.headers = options.headers || {}
                    setHeader(event, 'Authorization', token)
                },
            });

            const {token_2fa, expiration} = data;

            return {
                _2fa: token_2fa,
                expiration
            }

        } catch (error) {
            return error
        }
    }
})