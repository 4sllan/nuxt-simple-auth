import {useRuntimeConfig} from '#imports'
import {deleteCookie} from 'h3'

export default defineEventHandler(async (event) => {
    let {strategyName} = await readBody(event)

    const {'nuxt-simple-auth': config} = useRuntimeConfig(event)

    const {cookie, strategies, "2fa": s} = config
    const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'

    if (strategyName) {

        deleteCookie(event, `${prefix}_token.${strategyName}`, cookie.options)
        deleteCookie(event, `${prefix}strategy`, cookie.options)
        deleteCookie(event, `${prefix}_token_expiration.${strategyName}`, cookie.options)

        if (s) {
            deleteCookie(event, `${prefix}_2fa.${strategyName}`, cookie.options)
            deleteCookie(event, `${prefix}_2fa_expiration.${strategyName}`, cookie.options)
        }

        return true
    }

    return false

})