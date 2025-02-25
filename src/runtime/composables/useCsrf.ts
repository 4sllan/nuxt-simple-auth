import {useRuntimeConfig, useFetch} from '#imports'
import { ref, onMounted } from 'vue'

const { public: { baseURL } } = useRuntimeConfig();
export function useCsrf(request) {
    const csrfToken = ref<string | null>(null)

    onMounted(async () => {
        const { data } = await useFetch(`${baseURL}${request}`, {
            credentials: 'include'
        })
        csrfToken.value = data.value?.csrfToken
    })

    return { csrfToken }
}