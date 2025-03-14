import { useRuntimeConfig } from '#imports';
import { defineEventHandler, readBody, setCookie, createError } from 'h3';
import { defu } from 'defu';
import { $fetch } from 'ofetch';
import type { ModuleOptions, StrategiesOptions } from '../../types';

interface AuthRequestBody {
    strategyName: string;
    value: Record<string, any>;
}

interface TokenSuccessResponse {
    token: string;
    refresh_token: string;
    expires: number;
}

interface TokenErrorResponse {
    status: number;
    message: string;
}

type TokenResponse = TokenSuccessResponse | TokenErrorResponse;

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<AuthRequestBody>(event);
        if (!body?.strategyName || !body?.value) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid request body' });
        }

        const runtimeConfig = useRuntimeConfig();
        const baseURL = runtimeConfig.public.baseURL;
        const config = runtimeConfig['nuxt-simple-auth'] as ModuleOptions;
        const secret = runtimeConfig.secret;

        if (!config) {
            throw createError({ statusCode: 500, statusMessage: 'Authentication module not configured' });
        }

        const { cookie, strategies } = config;
        const prefix = cookie?.prefix || 'auth.';
        const strategy: StrategiesOptions | undefined = strategies?.[body.strategyName];

        if (!strategy) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid authentication strategy' });
        }

        const { endpoints } = strategy;
        if (!endpoints?.login?.url) {
            throw createError({ statusCode: 500, statusMessage: 'Login endpoint not configured' });
        }

        const credentials = defu(body.value, secret?.[body.strategyName]);

        const response: any = await $fetch(endpoints.login.url, {
            baseURL,
            method: endpoints.login.method || 'POST',
            body: credentials,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        }).catch((error) => {
            console.error('[API Error]', error);
            throw createError({ statusCode: 502, statusMessage: 'Authentication service error' });
        });

        if (!response?.access_token || !response?.refresh_token || !response?.expires_in) {
            throw createError({ statusCode: 502, statusMessage: 'Invalid token response' });
        }

        const token = 'Bearer ' + response.access_token;
        const expires = Date.now() + response.expires_in * 1000;

        setCookie(event, prefix + '_token.' + body.strategyName, token, cookie?.options || {});
        setCookie(event, prefix + 'strategy', body.strategyName, cookie?.options || {});
        setCookie(event, prefix + '_token_expiration.' + body.strategyName, expires.toString(), cookie?.options || {});

        return { token, refresh_token: response.refresh_token, expires };
    } catch (error: any) {
        console.error('[Auth Error]', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Authentication failed',
        });
    }
});
