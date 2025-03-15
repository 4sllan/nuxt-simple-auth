import {useRuntimeConfig} from '#imports';
import {deleteCookie, defineEventHandler, readBody} from 'h3';
import type {ModuleOptions} from '../../types';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<{ strategyName?: string }>(event);
        const strategyName = body?.strategyName;

        if (!strategyName) {
            throw new Error('Strategy name is required.');
        }

        const runtimeConfig = useRuntimeConfig();
        const config = runtimeConfig['nuxt-simple-auth'] as ModuleOptions & { twoFactorAuth: boolean };

        if (!config) {
            throw new Error('Auth configuration is missing.');
        }

        const {cookie, strategies, twoFactorAuth} = config;
        const prefix = (cookie?.prefix && !import.meta.dev ? cookie.prefix : 'auth.') + '';
        const strategyConfig = strategies[strategyName];

        if (!strategyConfig) {
            throw new Error('Strategy ' + strategyName + ' is not defined in the configuration.');
        }

        const {redirect} = strategyConfig;

        const cookieOptions = cookie?.options ?? {};
        deleteCookie(event, prefix + '_token.' + strategyName, cookieOptions);
        deleteCookie(event, prefix + 'strategy', cookieOptions);
        deleteCookie(event, prefix + '_token_expiration.' + strategyName, cookieOptions);

        if (twoFactorAuth) {
            deleteCookie(event, prefix + '_2fa.' + strategyName, cookieOptions);
            deleteCookie(event, prefix + '_2fa_expiration.' + strategyName, cookieOptions);
        }

        return {success: true, redirect};
    } catch (error) {
        console.error('Error in logout handler:', error);
        return {success: false, error: (error as Error).message};
    }
});
