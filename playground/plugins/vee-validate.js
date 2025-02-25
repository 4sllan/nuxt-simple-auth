import {
    Form,
    Field,
    defineRule,
    configure
} from 'vee-validate';
import { all } from '@vee-validate/rules';

const veeValidate = defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('Form', Form)
    nuxtApp.vueApp.component('Field', Field)

    Object.entries(all).forEach(([name, rule]) => {
        defineRule(name, rule);
    });
})

export default veeValidate