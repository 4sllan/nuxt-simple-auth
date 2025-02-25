import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/lib/util/colors'

import {aliases, mdi} from "vuetify/lib/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";


const vuetify = defineNuxtPlugin((nuxtApp) => {
    const vuetify = createVuetify({
        ssr: false,
        components,
        directives,
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
                mdi,
            },
        },
        theme: {
            defaultTheme: 'myColors',
            themes: {
                myColors: {
                    dark: false,
                    colors: {
                        primary: '#6838c8',
                        secondary: '#A645C5',
                        tertiary: '#5DE55D',
                        accent: '#F6FAFF',
                        white: '#FFFFFF',
                        'black': '#222222',
                        'dark-gray': '#4b5f82',
                        'light-gray': '#fcfcfc',
                        'medium-gray': '#707070',
                        info: colors.teal.lighten1,
                        warning: colors.amber.base,
                        error: '#ed3434',
                        success: colors.green.accent3,
                    }
                }
            },
        }
    })
    nuxtApp.vueApp.use(vuetify);
})

export default vuetify