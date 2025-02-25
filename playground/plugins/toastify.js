import Vue3Toastify, {toast} from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const toastify = defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(Vue3Toastify, {autoClose: 3000, theme: "colored"});
    return {
        provide: {
            toast,
        },
    };
});

export default toastify