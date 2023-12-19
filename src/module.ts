import {
    useLogger,
    createResolver,
    defineNuxtModule,
    addServerHandler,
    addPlugin,
    addRouteMiddleware
} from '@nuxt/kit'
import type {
    ModuleOptions,
} from './runtime/types'


const PACKAGE_NAME = 'nuxt-simple-auth'
export default defineNuxtModule<ModuleOptions>({

    meta: {
        name: PACKAGE_NAME,
        configKey: 'auth'
    },

    async setup(options, nuxt: any) {
        const logger = useLogger(PACKAGE_NAME)


        const {resolve} = createResolver(import.meta.url)
        const auth = nuxt.options?.auth;

        nuxt.options.runtimeConfig[PACKAGE_NAME] = auth;

        if(auth.cookie && auth.cookie.prefix){
            nuxt.options.runtimeConfig.public.prefix = auth.cookie.prefix;
        }

        if (auth['2fa']) {
            //add middleware 2fa
            addRouteMiddleware({
                name: '_2fa',
                path: resolve('./runtime/core/2fa.js'),
            })
            //add server-plugin 2fa
            addServerHandler({
                route: '/api/2fa',
                handler: resolve('./runtime/api/2fa.js')
            })
        }

        // Add middleware template
        addRouteMiddleware({
            name: 'auth',
            path: resolve('./runtime/core/auth.js'),
        })

        // Add plugin template
        addPlugin({
            src: resolve('./runtime/plugin.js'),
            mode: 'all',
        })

        // Add server-plugin auth
        addServerHandler({
            route: '/api/auth',
            handler: resolve('./runtime/api/auth.js')
        })
        // Add server-plugin profile
        addServerHandler({
            route: '/api/profile',
            handler: resolve('./runtime/api/profile.js')
        })
        // Add server-plugin logout
        addServerHandler({
            route: '/api/logout',
            handler: resolve('./runtime/api/logout.js')
        })


        logger.success('`nuxt-simple-auth` setup done')
    }
})