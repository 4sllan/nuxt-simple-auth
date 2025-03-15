import {defineEventHandler, createError} from 'h3';
import {getAuthSession} from '../utils';
import protectedMiddleware from "../middleware/protected";

export default defineEventHandler(async (event) => {
    try {
        await protectedMiddleware(event)

        const {token, expires, strategyName} = getAuthSession(event);

        return {token: token, expires: expires, strategyName: strategyName, loggedIn: true};

    } catch (error: any) {
        console.error('[Auth Error] ' + error);
        throw createError({
            statusCode: error.statusCode ? error.statusCode : 500,
            statusMessage: error.statusMessage ? error.statusMessage : 'Authentication failed',
        });
    }
});
