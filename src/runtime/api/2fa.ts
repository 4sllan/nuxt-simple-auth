import {useRuntimeConfig} from "#imports";
import {
    defineEventHandler,
    readBody,
    getCookie,
    setCookie,
    createError,
    setHeader
} from "h3";
import {$fetch} from 'ofetch';
import type {ModuleOptions, StrategiesOptions} from "../types";

interface Get2FAResponse {
    access_token: string;
    expires_in: number;
}

interface RequestBody {
    strategyName: string;
    code: string;
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<RequestBody>(event);

        if (!body?.strategyName || !body?.code) {
            throw createError({
                statusCode: 400,
                statusMessage: "Missing required parameters: strategyName or code",
            });
        }

        const {
            'nuxt-simple-auth': config,
            public: {baseURL},
        } = useRuntimeConfig();

        if (!config) {
            throw createError({statusCode: 500, statusMessage: "Authentication module not configured"});
        }

        const {cookie, strategies} = config as ModuleOptions;
        const prefix = cookie?.prefix || "auth.";
        const strategy: StrategiesOptions | undefined = strategies?.[body.strategyName];

        if (!strategy) {
            throw createError({statusCode: 400, statusMessage: "Invalid authentication strategy"});
        }

        const {endpoints} = strategy;
        if (!endpoints?.["2fa"]) {
            throw createError({
                statusCode: 400,
                statusMessage: "2FA endpoint not configured for strategy " + body.strategyName,
            });
        }

        const token = getCookie(event, prefix + "_token." + body.strategyName) || "";

        const response: Get2FAResponse = await $fetch<Get2FAResponse>(endpoints["2fa"].url, {
            baseURL,
            method: endpoints["2fa"].method || "POST",
            body: {code: body.code},
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            onRequest({options}) {
                options.headers = options.headers || {};
                setHeader(event, "Authorization", token);
            },
        }).catch((error) => {
            console.error("[API Error]", error);
            throw createError({statusCode: 502, statusMessage: "Authentication service error"});
        });

        if (!response?.access_token || !response?.expires_in) {
            throw createError({
                statusCode: 500,
                statusMessage: "Invalid 2FA response structure",
            });
        }

        const expires = Date.now() + response.expires_in * 1000;

        setCookie(event, prefix + "_2fa." + body.strategyName, response.access_token, cookie?.options || {});
        setCookie(event, prefix + "_2fa_expiration." + body.strategyName, expires.toString(), cookie?.options || {});

        return {token: response.access_token, expires};
    } catch (error: any) {
        console.error('[Auth Error]', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to fetch 2FA token',
        });
    }
});
