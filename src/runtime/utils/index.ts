import {createError, navigateTo, useNuxtApp} from "#imports";

export const handleLogout = async (strategy: string | null, redirectPath: string) => {
    const nuxtApp = useNuxtApp();
    const $auth = nuxtApp?.$auth;

    if (!$auth) {
        console.error("Auth plugin is not initialized.");
        return navigateTo(redirectPath);
    }

    if (strategy) {
        await $auth.logout(strategy);
    }

    if (import.meta.client) {

        sessionStorage.clear();

        return navigateTo(redirectPath);
    }

    throw createError({
        statusCode: 401,
        statusMessage: "You do not have permission to access this page."
    })
};

export const validateSession = (strategy: string | null, token: string | null, expires: string | null): boolean => {
    if (!strategy || !token) return false;

    const expirationTime = expires ? Number(expires) : 0;
    return expirationTime > Date.now();
};

export const getRedirectPath = (strategy: string | null): string => {
    if (!strategy) return '/';

    const nuxtApp = useNuxtApp();
    const $auth = nuxtApp?.$auth;

    if (!$auth) {
        console.error("Auth plugin is not initialized.");
        return '/';
    }

    const {login, callback, home} = $auth.getRedirect(strategy);
    return callback || home || login || '/';
};