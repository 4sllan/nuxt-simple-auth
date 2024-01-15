import {useRuntimeConfig} from '#imports'
import {defineEventHandler, getCookie} from 'h3'
import type {
    ModuleOptions
} from '../types'

export default defineEventHandler(async (event) => {

    const {
        'nuxt-simple-auth': config,
        public: {
            baseURL
        },
    } = useRuntimeConfig()

    const {cookie, strategies} = <ModuleOptions>config
    const prefix: string = cookie?.prefix && !import.meta.dev ? cookie?.prefix : 'auth.'

    const strategyName: string = getCookie(event, `${prefix}strategy`) || ''
    const token: string = getCookie(event, `${prefix}_token.${strategyName}`) || ''


    if (token && strategyName) {

        const {endpoints: e, token: t, user: u} = strategies[strategyName]


        return {...await getProfile(e, token), strategyName, token}

    }

    return false;

    async function getProfile(endpoints: any, token: string): Promise<any> {
        try {
            return await $fetch(endpoints.user.url, {
                baseURL: <string>baseURL,
                method: endpoints.user.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            });

        } catch (error) {
            console.log(error)
        }
    }

})