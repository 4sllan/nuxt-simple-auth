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
    async setup(options, nuxt) {
        const logger = useLogger(PACKAGE_NAME)


        const {resolve} = createResolver(import.meta.url)
        console.log(nuxt.options.auth)

        if (nuxt.options.auth.strategies['2fa'].active) {
            addRouteMiddleware({
                name: '_2fa',
                path: resolve('./core/2fa.js'),
            })
        }

        addRouteMiddleware({
            name: 'auth',
            path: resolve('./core/auth.js'),
        })

        // Add plugin template
        addPlugin({
            src: resolve('plugin.js'),
            mode: 'all',
            options: nuxt.options.auth
        })


        // Add server-plugin
        addServerHandler(
            {
                route: '/api/auth',
                handler: resolve('./api/auth.js')
            },
            {
                route: '/api/logout',
                handler: resolve('./api/logout.js')
            },
            {
                route: '/api/profile',
                handler: resolve('./api/profile.js')
            }
        )

        // logger.success('`nuxt-simple-auth` setup done')
    }
})