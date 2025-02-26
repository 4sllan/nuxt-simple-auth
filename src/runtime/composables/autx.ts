import { $fetch } from 'ofetch';
export function $autx<T = any>(request: string, options = {}): Promise<T> {
    const { $auth } = useNuxtApp();
    const { public: { baseURL } } = useRuntimeConfig();
    const url = new URL(request, baseURL).href;

    return $fetch(url, {
        ...options,
        headers: $auth.$headers,
        async onResponseError({ request, response }) {
            console.error(
                "[API Error]",
                {
                    request,
                    status: response.status,
                    body: response.body,
                    fullResponse: response
                }
            );

            if (response.status === 401) {
                reloadNuxtApp();
            } else {
                throw new Error(response.body);
            }
        },
    });
}