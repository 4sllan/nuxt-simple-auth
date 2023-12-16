import {useRuntimeConfig} from '#imports'

export default defineEventHandler(async (event) => {
    let {type} = await readBody(event)

    const {'nuxt-simple-auth': config} = useRuntimeConfig(event)

    const {cookie, strategies} = config
    const prefix = cookie.prefix && !import.meta.dev ? cookie.prefix : 'auth.'

    if (type) {

        setCookie(event, `${prefix}_token.${type}`, false, {maxAge: -1})
        setCookie(event, `${prefix}strategy`, false, {maxAge: -1})
        setCookie(event, `${prefix}_token_expiration.${type}`, false, {maxAge: -1})

        return 'Você foi desconectado com sucesso'
    }


})