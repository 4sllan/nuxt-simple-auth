import {
    useLogger,
    createResolver,
    defineNuxtModule,
    addServerHandler,
    addPlugin,
    addRouteMiddleware
} from 'nuxt/kit'


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
                path: resolve('./core/2fa.js'),
            })
            //add server-plugin 2fa
            addServerHandler({
                route: '/api/2fa',
                handler: resolve('./api/2fa.js')
            })
        }

        // Add middleware template
        addRouteMiddleware({
            name: 'auth',
            path: resolve('./core/auth.js'),
        })

        // Add plugin template
        addPlugin({
            src: resolve('plugin.js'),
            mode: 'all',
        })


        // Add server-plugin
        addServerHandler({
            route: '/api/auth',
            handler: resolve('./api/auth.js')
        })

        addServerHandler({
            route: '/api/profile',
            handler: resolve('./api/profile.js')
        })

        addServerHandler({
            route: '/api/logout',
            handler: resolve('./api/logout.js')
        })


        logger.success('`nuxt-simple-auth` setup done')
    }
})