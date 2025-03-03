import {useRuntimeConfig} from '#imports';
import {defineEventHandler, getCookie, createError} from 'h3';
import { $fetch } from 'ofetch';
import type {ModuleOptions, StrategiesOptions} from '../types';

export default defineEventHandler(async (event) => {
    const {
        'nuxt-simple-auth': config,
        public: {baseURL},
    } = useRuntimeConfig();

    const {cookie, strategies} = config as ModuleOptions;
    const prefix: string | undefined = cookie?.prefix;
    const strategyName: string | undefined = getCookie(event, prefix + `strategy`) || '';
    const token: string | undefined = getCookie(event, prefix + `_token.` + strategyName) || '';

    if (!strategyName || !token) {
        throw createError({statusCode: 401, statusMessage: 'Unauthorized: No valid strategy or token found'});
    }

    const strategy: StrategiesOptions | undefined = strategies[strategyName];
    if (!strategy) {
        throw createError({statusCode: 400, statusMessage: 'Invalid authentication strategy'});
    }

    try {
        const userProfile = await getProfile(strategy.endpoints, token, baseURL);
        return {...userProfile, strategyName, token};
    } catch (error: any) {
        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to fetch user profile',
        });
    }
});

async function getProfile(endpoints: StrategiesOptions['endpoints'], token: string, baseURL: string): Promise<any> {
    try {
        return await $fetch(endpoints.user.url, {
            baseURL,
            method: endpoints.user.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
        });
    } catch (error: any) {
        throw new Error(error?.message || 'Error retrieving user profile');
    }
}
