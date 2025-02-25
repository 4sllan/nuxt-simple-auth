export function useRequest<T = any>(request: string, options = {}): Promise<T> {
    const { $auth } = useNuxtApp();
    const { public: { baseURL } } = useRuntimeConfig();

    return $fetch(`${baseURL}${request}`, {
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
                $auth.logout("local");
                reloadNuxtApp();
            } else {
                throw new Error(response._data?.data || "Erro desconhecido na API");
            }
        },
    });
}