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
    async setup(options, nuxt) {
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

        // Add server-plugin auth
        addServerHandler({
            route: '/api/auth',
            handler: resolve('./api/auth.js')
        })
        // Add server-plugin profile
        addServerHandler({
            route: '/api/profile',
            handler: resolve('./api/profile.js')
        })
        // Add server-plugin logout
        addServerHandler({
            route: '/api/logout',
            handler: resolve('./api/logout.js')
        })


        logger.success('`nuxt-simple-auth` setup done')
    }
})