import {useRuntimeConfig} from '#imports';
import {getCookie, createError, H3Event} from 'h3';
import type {ModuleOptions} from '../../types';

interface AuthSession {
    token?: string;
    expires?: string;
    strategyName?: string;
}

export function getAuthSession(event: H3Event): AuthSession {
    const runtimeConfig = useRuntimeConfig();
    const config = runtimeConfig['nuxt-simple-auth'] as ModuleOptions;

    if (!config?.cookie) {
        throw createError({statusCode: 500, statusMessage: 'Authentication module not configured'});
    }

    const prefix: string = config.cookie.prefix || 'auth.';
    const strategyName: string | undefined = getCookie(event, prefix + 'strategy') || undefined;
    const token: string | undefined = strategyName ? getCookie(event, prefix + '_token.' + strategyName) || undefined : undefined;
    const expires: string | undefined = strategyName ? getCookie(event, prefix + '_token_expiration.' + strategyName) || undefined : undefined;

    return {token, expires, strategyName};
}
