import myModule from '../src/module'
import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    devtools: {
      enabled: true,

      timeline: {
        enabled: true,
      },
    },

    css: ['~/assets/css/tailwind.pcss'],

    // Modules:

    modules: [
        (_options, nuxt) => {
            nuxt.hooks.hook('vite:extendConfig', (config) => {
                // @ts-expect-error
                config.plugins.push(vuetify({autoImport: true}))
            })
        },
        myModule
    ],

    // Nuxt-simple-auth Configuration

    auth: {
        // csrf: '/csrf-token',
        cookie: {
            options: {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                priority: 'high',
            },
            prefix: '__Secure-'
        },
        strategies: {
            local: {
                redirect: {
                    logout: "/auth",
                    login: "/auth/verification"
                },
                user: {
                    property: "profile",
                },
                endpoints: {
                    login: {url: "/oauth/token", method: "post", alias: "auth token"},
                    user: {url: "/api/profile", method: "get"},
                    "2fa": {url: '/api/token_2fa', method: 'post'},
                },
            },
            client:{
                redirect: {
                    logout: "/auth",
                    login: "/auth"
                },
                user: {
                    property: "profile",
                },
                endpoints: {
                    login: {url: "/oauth/token", method: "post"},
                    user: {url: "/api/profile", method: "get"},
                    "2fa": {url: "/api/send-token-2fa", method: "post"},
                    logout: {alias: 'logout client'}
                },
            }
        }
    },

    // Postcss Configuration
    postcss: {
        plugins: {
            "@tailwindcss/postcss": {},
        }
    },

    runtimeConfig: {
        // The private keys which are only available server-side
        secret: {
            local: {
                client_id: 2,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: "password",
            },
        },


        // Keys within public are also exposed client-side
        public: {
            apiBase: '/api',
            baseURL: process.env.baseURL,
        }
    },

    build: {
        transpile: ['vuetify'],
    },

    vite: {
        vue: {
            template: {
                transformAssetUrls,
            },
        },
    },

    compatibilityDate: '2025-02-16',
})