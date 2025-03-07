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
import fs from 'fs'

import type {
    ModuleOptions,
    AuthSecretConfig,
    StrategiesOptions
} from './runtime/types'

interface Endpoint {
    url: string;
    method: string;
    alias?: string;
}

interface RuntimeConfig {
    secret: {
        [key: string]: AuthSecretConfig;
    };
}

const PACKAGE_NAME: string = 'nuxt-simple-auth'
export default defineNuxtModule<ModuleOptions & { twoFactorAuth: boolean }>({

    meta: {
        name: PACKAGE_NAME,
        configKey: 'auth'
    },

    async setup(options, nuxt) {
        const logger = useLogger(PACKAGE_NAME)
        const runtimeConfig = nuxt.options.runtimeConfig as RuntimeConfig;
        const {resolve} = createResolver(import.meta.url)
        const isDev = nuxt.options.dev;

        if (!runtimeConfig.secret || typeof runtimeConfig.secret !== 'object' || Object.keys(runtimeConfig.secret).length === 0) {
            logger.error(`Missing "runtimeConfig.secret" in nuxt.config.ts`);
            return;
        }

        Object.entries(runtimeConfig.secret).forEach(([key, config]) => {
            if (!options.strategies[key]) {
                logger.error(`[${PACKAGE_NAME}] Strategy "${key}" found in "runtimeConfig.secret" but not in "options.strategies". Skipping validation.`);
                return;
            }
            if (!config.client_id || !config.client_secret || !config.grant_type) {
                logger.error(`[${PACKAGE_NAME}] Invalid "secret.${key}" configuration. Required keys: client_id, client_secret, grant_type.`);
                return;
            }
        });

        options = defu(options, {
            cookie: {
                options: {
                    httpOnly: false,
                    secure: false,
                    sameSite: 'Lax',
                    priority: 'high',
                },
                prefix: 'auth.'
            },
            twoFactorAuth: false
        }) as ModuleOptions & { twoFactorAuth: boolean };

        options.cookie = options.cookie ?? {prefix: 'auth.', options: {}};
        options.cookie.options = options.cookie.options ?? {
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
            priority: 'high'
        };

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

        Object.entries(options.strategies).forEach(([strategyName, strategy]: [string, StrategiesOptions & {
            handler?: Record<string, string>[]
        }]) => {
            strategy.handler = strategy.handler ?? [];
            strategy.endpoints = strategy.endpoints || {};
            strategy.endpoints = defu(strategy.endpoints, {
                logout: {alias: 'logout'}
            });
            Object.entries(strategy.endpoints)
                .filter(([key, endpoint]) => key !== 'user' && (key === 'logout' || ((endpoint as Endpoint).url && (endpoint as Endpoint).method)))
                .forEach(([key, endpoint]) => {
                    const typedEndpoint = endpoint as Endpoint;
                    const route = `/api/${kebabCase(typedEndpoint.alias) || typedEndpoint.url.replace(/^\/(api|oauth)\//, '')}`;
                    const handlerFile = resolve(`./runtime/api/${key}`);

                    strategy.handler!.push({[key]: route});

                    addServerHandler({
                        route,
                        handler: handlerFile
                    });
                });
        });

        const has2FA = Object.values(options.strategies).some(strategy =>
            strategy.endpoints?.['2fa']?.url && strategy.endpoints?.['2fa']?.method
        );

        if (has2FA) {
            options.twoFactorAuth = true;

            addRouteMiddleware({
                name: '_2fa',
                path: resolve('./runtime/middleware/2fa'),
            });
            logger.success('Middleware `_2fa` enabled');
        }

        const hasTsPlugin = fs.existsSync(resolve('./runtime/plugin.ts'))

        // Add plugin template
        addPluginTemplate({
            src: resolve(`./runtime/plugin.${hasTsPlugin ? 'ts' : 'js'}`),
            filename: `plugin.${hasTsPlugin ? 'ts' : 'js'}`,
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
        secret: Record<string, AuthSecretConfig>;
    }
}