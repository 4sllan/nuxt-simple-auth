import { defineEventHandler, createError } from 'h3';
import { getAuthSession } from '../utils';

export default defineEventHandler(async (event) => {
    try {
        const { token, expires } = getAuthSession(event);

        if (!token) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
        }

        // Validar se o token expirou
        const expirationTime = expires ? Number(expires) : NaN;
        if (isNaN(expirationTime) || expirationTime < Date.now()) {
            throw createError({ statusCode: 401, statusMessage: 'Session expired' });
        }

    } catch (error: any) {
        console.error('[Auth Error] ', error);
        throw error.statusCode
            ? error
            : createError({ statusCode: 500, statusMessage: 'Authentication failed' });
    }
});
