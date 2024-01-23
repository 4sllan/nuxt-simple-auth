export default defineNuxtConfig({
    devtools: {
      enabled: true,

      timeline: {
        enabled: true
      }
    },

    // Modules:

    modules: [

    ],

    // Nuxt-simple-auth Configuration

    auth:{
        cookie: {
            options: {
                httpOnly: true,
                secure: true,
                sameSite: 'Lax',
                priority: 'high',
                //maxAge: 24 * 60 * 60 * 1000,
            },
            prefix: '__Secure-auth.',
        },
        strategies: {
            local: {
                redirect: {
                    logout: "/app/auth"
                },
                token: {
                    property: 'access_token',
                },
                user: {
                    property: 'profile',
                },
                endpoints: {
                    login: {url: '/oauth/token', method: 'post'},
                    user: {url: '/api/profile', method: 'get'},
                    "2fa": {url: '/api/token_2fa', method: 'post'},
                },
            },
        }
    },

    // Configuration

    runtimeConfig: {
        // The private keys which are only available server-side
        grant_type: 'password',
        client_id: 2,
        client_secret: 'UL2yaCLcSQIxjyi2PRkLaZrDzcsCHlGwNgSIN788',
        // Keys within public are also exposed client-side
        public: {
            apiBase: '/api',
            siteURL: 'http://localhost:3000/',
            baseURL: process.env.baseURL,
        }
    },
})