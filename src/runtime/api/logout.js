import {useRuntimeConfig} from '#imports'
import {deleteCookie} from 'h3'

export default defineEventHandler(async (event) => {
    let {type} = await readBody(event)

    const {'nuxt-simple-auth': config} = useRuntimeConfig(event)

    const {cookie, strategies} = config
    const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'

    if (type) {

        deleteCookie(event, `${prefix}_token.${type}`, cookie.options)
        deleteCookie(event, `${prefix}strategy`, cookie.options)
        deleteCookie(event, `${prefix}_token_expiration.${type}`, cookie.options)

        return true
    }

    return false

})