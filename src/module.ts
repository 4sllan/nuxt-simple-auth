import {
    useLogger,
    createResolver,
    defineNuxtModule,
    addServerHandler,
    addPlugin,
    addRouteMiddleware
} from '@nuxt/kit'


const PACKAGE_NAME = 'nuxt-simple-auth'
export default defineNuxtModule({

    meta: {
        name: PACKAGE_NAME,
        configKey: 'auth'
    },
    async setup(options, nuxt: any) {
        const logger = useLogger(PACKAGE_NAME)

        // @ts-ignore
        const {resolve} = createResolver(import.meta.url)
        const runtimeConfig = nuxt.options?.auth;

        nuxt.options.runtimeConfig['nuxt-simple-auth'] = runtimeConfig;

        if (runtimeConfig.strategies['2fa'].active) {
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


        // Add server-plugin
        addServerHandler({
            route: '/api/auth',
            handler: resolve('./runtime/api/auth.js')
        })

        addServerHandler({
            route: '/api/profile',
            handler: resolve('./runtime/api/profile.js')
        })

        addServerHandler({
            route: '/api/logout',
            handler: resolve('./runtime/api/logout.js')
        })


        logger.success('`nuxt-simple-auth` setup done')
    }
})