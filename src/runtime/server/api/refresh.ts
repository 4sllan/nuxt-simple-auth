import {useRuntimeConfig} from '#imports';
import {defineEventHandler, readBody, setCookie, createError, getCookie} from 'h3';
import {$fetch} from 'ofetch';
import protectedMiddleware from "../middleware/protected";
import type {ModuleOptions, StrategiesOptions} from '../../types';

interface AuthRequestBody {
    strategyName: string;
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
        await protectedMiddleware(event)
        const body = await readBody<AuthRequestBody>(event);
        if (!body?.strategyName) {
            throw createError({statusCode: 400, statusMessage: 'Invalid request body'});
        }

        const runtimeConfig = useRuntimeConfig();
        const baseURL = runtimeConfig.public.baseURL;
        const config = runtimeConfig['nuxt-simple-auth'] as ModuleOptions;

        if (!config) {
            throw createError({statusCode: 500, statusMessage: 'Authentication module not configured'});
        }

        const {cookie, strategies} = config;
        const prefix = cookie?.prefix || 'auth.';
        const strategy: StrategiesOptions | undefined = strategies?.[body.strategyName];

        if (!strategy) {
            throw createError({statusCode: 400, statusMessage: 'Invalid authentication strategy'});
        }

        const {endpoints} = strategy;
        if (!endpoints?.refresh?.url) {
            throw createError({statusCode: 500, statusMessage: 'Refresh endpoint not configured'});
        }

        const refreshToken = getCookie(event, prefix + `_refresh_token.` + body.strategyName);

        if (!refreshToken) {
            throw createError({
                statusCode: 401,
                statusMessage: 'No refresh token found. Please log in again.',
            });
        }

        const response: any = await $fetch<TokenSuccessResponse>(endpoints.refresh.url, {
            baseURL,
            method: endpoints.refresh.method || 'POST',
            body: {refresh_token: refreshToken},
            timeout: 10000,
            headers: {'Content-Type': 'application/json'},
        }).catch((error) => {
            console.error('[API Error]', error);
            throw createError({statusCode: 502, statusMessage: 'Authentication service error'});
        });

        if (!response?.access_token || !response?.refresh_token || !response?.expires_in) {
            throw createError({statusCode: 502, statusMessage: 'Invalid token response'});
        }

        const token = 'Bearer ' + response.access_token;
        const expires = Date.now() + response.expires_in * 1000;

        setCookie(event, prefix + '_token.' + body.strategyName, token, cookie?.options || {});
        setCookie(event, prefix + `_refresh_token.` + body.strategyName, response.refresh_token, cookie?.options || {});
        setCookie(event, prefix + 'strategy', body.strategyName, cookie?.options || {});
        setCookie(event, prefix + '_token_expiration.' + body.strategyName, expires.toString(), cookie?.options || {});

        return {token, refresh_token: response.refresh_token, expires};
    } catch (error: any) {
        console.error('[Auth Error]', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Authentication failed',
        });
    }
});
