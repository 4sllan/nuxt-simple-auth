import {useRuntimeConfig} from '#imports'
import {deleteCookie, defineEventHandler, readBody} from 'h3'
import type {
    ModuleOptions
} from '../types'

export default defineEventHandler(async (event) => {
    let {strategyName} = await readBody(event)

    const {'nuxt-simple-auth': config} = useRuntimeConfig()

    const {cookie, strategies, "2fa": _2fa} = <ModuleOptions>config
    const prefix = cookie?.prefix && !import.meta.dev ? cookie?.prefix : 'auth.'
    const {redirect, token: t, user: u, endpoints: e} = strategies[strategyName]

    if (strategyName) {

        deleteCookie(event, `${prefix}_token.${strategyName}`, <{}>cookie?.options)
        deleteCookie(event, `${prefix}strategy`, <{}>cookie?.options)
        deleteCookie(event, `${prefix}_token_expiration.${strategyName}`, <{}>cookie?.options)

        if (_2fa) {
            deleteCookie(event, `${prefix}_2fa.${strategyName}`, <{}>cookie?.options)
            deleteCookie(event, `${prefix}_2fa_expiration.${strategyName}`, <{}>cookie?.options)
        }

        return redirect
    }

    return false

})