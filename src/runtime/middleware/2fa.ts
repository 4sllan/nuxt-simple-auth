import {
    navigateTo,
    useNuxtApp,
    useCookie,
    useAuthStore,
    createError,
    useRequestEvent,
    defineNuxtRouteMiddleware
} from '#imports';

export default defineNuxtRouteMiddleware(async () => {
    const {$auth} = useNuxtApp();
    const store = useAuthStore();


    if (!$auth) {
        throw createError({
            statusCode: 500,
            statusMessage: "Auth plugin is not initialized"
        });
    }

    const handleLogout = async (strategy: string | null, redirectPath: string) => {
        if (strategy) {
            await $auth.logout(strategy);
        }

        if (import.meta.client) {
            sessionStorage.clear();

            return navigateTo(redirectPath);
        }

        throw createError({
            statusCode: 401,
            statusMessage: "You do not have permission to access this page without two-factor authentication."
        })
    };

    const validateSession = (strategy: string | null, token: string | null, expires: string | null): boolean => {
        if (!strategy || !token) return false;

        const expirationTime = expires ? Number(expires) : 0;
        return expirationTime > Date.now();
    };

    const getRedirectPath = (strategy: string | null): string => {
        if (!strategy) return '/';
        const {login, callback, home} = $auth.getRedirect(strategy)
        return login || callback || home || '/';
    };

    if (import.meta.server) {
        const event = useRequestEvent();
        if (!event) return;

        const strategyName = useCookie<string | null>($auth.prefix + `strategy`).value;
        const token = strategyName ? useCookie<string | null>($auth.prefix + `_2fa.` + strategyName).value : null;
        const expires = strategyName ? useCookie<string | null>($auth.prefix + `_2fa_expiration.` + strategyName).value : null;


        if (!validateSession(strategyName, token, expires)) {
            return await handleLogout(strategyName, getRedirectPath(strategyName));
        }

        if (token) {
            $auth.headers.set('2fa', token);
        }
    }

    if (import.meta.client) {
        const strategy = sessionStorage.getItem($auth.prefix + `strategy`);
        const token = strategy ? sessionStorage.getItem($auth.prefix + `_2fa.` + strategy) : null;
        const expires = strategy ? sessionStorage.getItem($auth.prefix + `_2fa_expiration.` + strategy) : null;
        //
        if (!validateSession(strategy, token, expires) || $auth.strategy !== strategy || $auth.strategy !== store.value.strategy) {
            return await handleLogout(strategy, getRedirectPath(strategy));
        }

        if (token) {
            $auth.headers.set('2fa', token);
        }

        if (!$auth.user || !$auth.loggedIn || !store.value.user || !store.value.loggedIn) {
            return await handleLogout(strategy, getRedirectPath(strategy));
        }
    }
});