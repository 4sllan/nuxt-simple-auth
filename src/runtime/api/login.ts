import {useRuntimeConfig} from '#imports'
import {defineEventHandler, readBody, setCookie, createError, setHeader} from 'h3'
import {defu} from 'defu';
import type {ModuleOptions, StrategiesOptions} from '../types'

type TokenResponse = {
    token: string;
    expires: number;
} | {
    status: number;
    message: string;
};

export default defineEventHandler(async (event) => {
    const body = await readBody<{ strategyName: string; value: Record<string, any> }>(event);
    if (!body?.strategyName || !body?.value) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request body',
        });
    }

    const {
        'nuxt-simple-auth': config,
        public: {baseURL},
        secret,
    } = useRuntimeConfig();

    const {cookie, strategies} = config as ModuleOptions;
    const prefix = cookie?.prefix;
    const strategy: StrategiesOptions | undefined = strategies[body.strategyName];

    if (!strategy) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid authentication strategy',
        });
    }

    const {token, user, endpoints, redirect} = strategy;

    try {
        const response: TokenResponse = await getToken(endpoints, body.value, baseURL, secret[body.strategyName]);
        if (response.status) {
            throw createError({
                statusCode: response.status,
                statusMessage: response.message,
            });
        }

        const {token: accessToken, expires} = response;
        if (accessToken) {
            setCookie(event, prefix + `_token.` + body.strategyName, accessToken, cookie?.options || {});
            setCookie(event, prefix + `strategy`, body.strategyName, cookie?.options || {});
            setCookie(event, prefix + `_token_expiration.` + body.strategyName, expires.toString(), cookie?.options || {});

            return {
                ...await getProfile(endpoints, accessToken, baseURL, event),
                strategyName: body.strategyName,
                token: accessToken,
                expires
            };
        }
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Authentication failed',
        });
    }
});

async function getToken(endpoints: any, value: Record<string, any>, baseURL: string, secret: any): Promise<TokenResponse> {
    try {
        const data = await $fetch(endpoints.login.url, {
            baseURL,
            method: endpoints.login.method || 'POST',
            body: defu(value, secret),
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const {token_type, expires_in, access_token} = data;
        return {token: `${token_type} ${access_token}`, expires: Date.now() + expires_in * 1000};
    } catch (error: any) {
        if (error.status === 522) {
            return {status: 522, message: 'Error 522: Laravel server did not respond in time.'};
        } else if (error.name === 'FetchError' && error.code === 'ECONNABORTED') {
            return {status: 522, message: 'Request to Laravel timed out. Please check server availability.'};
        } else if (error.message.includes('Failed to fetch')) {
            return {status: 403, message: 'CORS Error: The server does not allow requests from this origin. Check Laravel CORS settings.'};
        } else {
            return {status: error.status || 500, message: error.message || 'Failed to retrieve token'};
        }
    }
}

async function getProfile(endpoints: any, token: string, baseURL: string, event: any): Promise<any> {
    try {
        return await $fetch(endpoints.user.url, {
            baseURL,
            method: endpoints.user.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            timeout: 10000,
            onRequest({request, options}) {
                setHeader(event, 'Authorization', token);
            },
        });
    } catch (error: any) {
        console.error('getProfile error:', error);

        if (error.status === 522) {
            return {status: 522, message: 'Error 522: Laravel server did not respond while fetching the profile.'};
        } else if (error.name === 'FetchError' && error.code === 'ECONNABORTED') {
            return {
                status: 522,
                message: 'Request to Laravel for profile data timed out. Please check server availability.'
            };
        } else if (error.message.includes('Failed to fetch')) {
            return {status: 403, message: 'CORS Error: The server blocked the request. Check backend permissions.'};
        } else if (error.status >= 500) {
            return {status: error.status, message: 'Server error occurred while fetching the profile.'};
        } else {
            return {status: error.status || 500, message: error.message || 'Failed to fetch profile'};
        }
    }
}
