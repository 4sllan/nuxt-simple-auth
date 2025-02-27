import { $fetch, type FetchOptions, type FetchResponse } from 'ofetch';
import { useNuxtApp, useRuntimeConfig, reloadNuxtApp } from '#imports';
import type {AuthInstance} from '../types'

export type AutxOptions<T = any> = FetchOptions<'json', T>;

export async function $autx<T = any>(request: string, options: AutxOptions<T> = {}): Promise<T> {
    const { $auth } = useNuxtApp<{ $auth: AuthInstance }>();
    const { public: { baseURL } } = useRuntimeConfig();

    if (!$auth || !$auth.$headers) {
        throw new Error("Auth instance is not available or missing headers.");
    }

    const authHeaders = $auth.$headers instanceof Headers
        ? Object.fromEntries($auth.$headers.entries())
        : $auth.$headers;

    const url = new URL(request, baseURL).href;

    return $fetch<T>(url, {
        ...options,
        headers: {
            ...authHeaders,
            ...options.headers,
        },
        async onResponseError({ request, response }: { request: Request, response: FetchResponse<T> }) {
            console.error("[API Error]", {
                request,
                status: response.status,
                body: await response._data,
                fullResponse: response,
            });

            if (response.status === 401) {
                reloadNuxtApp();
            } else {
                throw new Error(response._data || "Unknown error");
            }
        },
    });
}
