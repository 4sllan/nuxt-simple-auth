import { useRuntimeConfig } from "#imports";
import {
    defineEventHandler,
    readBody,
    getCookie,
    setCookie,
    createError,
    setHeader
} from 'h3';
import type { ModuleOptions, StrategiesOptions } from '../types';

interface Get2FAResponse {
    _2fa: string;
    expiration: string;
}

interface RequestBody {
    strategyName: string;
    code: string;
}

export default defineEventHandler(async (event) => {
    try {
        const { strategyName, code } = await readBody<RequestBody>(event);

        if (!strategyName || !code) {
            throw createError({
                statusCode: 400,
                statusMessage: "Missing required parameters: strategyName or code",
            });
        }

        const {
            'nuxt-simple-auth': config,
            public: { baseURL },
        } = useRuntimeConfig();

        const {cookie, strategies} = config as ModuleOptions;
        const prefix = cookie?.prefix || 'auth.';

        const strategy: StrategiesOptions | undefined = strategies?.[strategyName];
        if (!strategy) {
            throw createError({
                statusCode: 400,
                statusMessage: `Strategy "${strategyName}" not found`,
            });
        }

        const { endpoints } = strategy;
        if (!endpoints?.['2fa']) {
            throw createError({
                statusCode: 400,
                statusMessage: `2FA endpoint not configured for strategy "${strategyName}"`,
            });
        }

        const token = getCookie(event, `${prefix}_token.${strategyName}`) || '';
        const response = await gethas2FA(endpoints['2fa'].url, baseURL, endpoints['2fa'].method, code, token, event);

        if (!response._2fa) {
            throw createError({
                statusCode: 500,
                statusMessage: "2FA token not received",
            });
        }

        const expiration = Number.isNaN(Number(response.expiration))
            ? new Date(response.expiration).getTime().toString()
            : response.expiration;

        setCookie(event, `${prefix}_2fa.${strategyName}`, response._2fa, <Partial<ModuleOptions['cookie']['options']>>cookie?.options);
        setCookie(event, `${prefix}_2fa_expiration.${strategyName}`, expiration, <Partial<ModuleOptions['cookie']['options']>>cookie?.options);

        return {
            _2fa: response._2fa,
            expiration,
            prefix,
            strategyName,
        };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || "Internal Server Error",
        });
    }
});
async function gethas2FA(
    url: string,
    baseURL: string,
    method: string,
    value: any,
    token: string,
    event: any
): Promise<Get2FAResponse> {
    try {
        const data = await $fetch<{ token_2fa: string; expiration: string }>(url, {
            baseURL,
            method,
            body: { value },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            onRequest({ options }) {
                options.headers = options.headers || {};
                setHeader(event, 'Authorization', token);
            },
        });

        if (!data.token_2fa || !data.expiration) {
            throw createError({
                statusCode: 500,
                statusMessage: "Invalid 2FA response structure",
            });
        }

        return {
            _2fa: data.token_2fa,
            expiration: data.expiration,
        };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || "Failed to fetch 2FA token",
        });
    }
}
