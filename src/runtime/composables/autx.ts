import { $fetch, type FetchOptions, type FetchResponse, type FetchContext } from 'ofetch';
import { useNuxtApp, useRuntimeConfig, reloadNuxtApp } from '#imports';
import type {AuthInstance} from '../types'

export type AutxOptions<T = any> = FetchOptions<'json', T>;

export async function $autx<T = any>(request: string, options: AutxOptions<T> = {}): Promise<T> {
    const { $auth } = useNuxtApp() as unknown as { $auth: AuthInstance };
    const baseURL = useRuntimeConfig().public.baseURL as string | undefined;


    if (!$auth || !$auth.$headers) {
        throw new Error("Auth instance is not available or missing headers.");
    }

    const authHeaders = $auth.headers instanceof Headers
        ? Object.fromEntries($auth.headers.entries())
        : $auth.headers;

    const url = new URL(request, baseURL).href;

    return $fetch<T>(url, {
        ...options,
        headers: {
            ...authHeaders,
            ...options.headers,
        },
        async onResponseError(context: FetchContext<T, 'json'> & { response: FetchResponse<T> }) {
            const { request, response } = context;
            let errorBody: any;
            try {
                errorBody = response._data ?? await response.text();
            } catch (e) {
                errorBody = "Unknown error";
            }

            console.error("[API Error]", {
                request,
                status: response.status,
                body: errorBody,
                fullResponse: response,
            });


            if (response.status === 401) {
                reloadNuxtApp();
            } else {
                throw new Error(errorBody);
            }
        },
    });
}
