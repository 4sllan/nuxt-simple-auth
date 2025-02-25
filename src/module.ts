import {
    useLogger,
    createResolver,
    defineNuxtModule,
    addServerHandler,
    addPlugin,
    addPluginTemplate,
    addRouteMiddleware,
    addImportsDir
} from '@nuxt/kit'
import {defu} from 'defu';
import kebabCase from 'lodash.kebabcase';
import type {
    ModuleOptions,
    ClientSecret,
    StrategiesOptions
} from './runtime/types'

interface Endpoint {
    url: string;
    method: string;
    alias?: string;
}

const PACKAGE_NAME: string = 'nuxt-simple-auth'
export default defineNuxtModule<ModuleOptions>({

    meta: {
        name: PACKAGE_NAME,
        configKey: 'auth'
    },

    async setup(options, nuxt) {
        const logger = useLogger(PACKAGE_NAME)
        const {resolve} = createResolver(import.meta.url)
        const isDev = nuxt.options.dev;

        options = defu(options, {
            cookie: {
                options: {
                    httpOnly: false,
                    secure: false,
                    sameSite: 'Lax',
                    priority: 'high',
                },
                prefix: 'auth.'
            }
        });

        if (isDev) {
            options.cookie.prefix = 'auth.';
            options.cookie.options.secure = false
        }

        addImportsDir(resolve('./runtime/composables'))

        // Add middleware template
        addRouteMiddleware({
            name: 'auth',
            path: resolve('./runtime/middleware/auth'),
        })

        // Add server-plugin logout
        addServerHandler({
            route: '/api/logout',
            handler: resolve('./runtime/api/logout')
        })

        Object.entries(options.strategies).forEach(([strategyName, strategy]: [string, StrategiesOptions]) => {
            strategy.handler = [];

            Object.entries(strategy.endpoints).forEach(([key, endpoint]: [string, Endpoint]) => {
                if (!endpoint.url) return;

                const route = `/api/${kebabCase(endpoint.alias) || endpoint.url.replace(/^\/(api|oauth)\//, '')}`;
                const handlerFile = resolve(`./runtime/api/${key}`);

                strategy.handler.push({[key]: route});

                addServerHandler({
                    route,
                    handler: handlerFile
                })
            })
        })

        // Add plugin template
        addPluginTemplate({
            src: resolve('./runtime/plugin.ts'),
            filename: 'plugin.ts',
            mode: 'all',
            options: {
                ...options,
            }
        })


        nuxt.options.runtimeConfig[PACKAGE_NAME] = options;

        logger.success('`nuxt-simple-auth` setup done')
    }
})

declare module 'nuxt/schema' {
    interface RuntimeConfig {
        secret: ClientSecret
    }
}