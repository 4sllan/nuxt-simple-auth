import {createError, navigateTo, useNuxtApp} from "#imports";
import {createStorage} from 'unstorage';
import type {Storage} from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';

/**
 * Handles user logout by clearing session data and redirecting.
 * @param strategy - The authentication strategy to log out from.
 * @param redirectPath - The path to redirect after logout.
 * @param middleware - The middleware type, defaults to "auth".
 * @throws An error if called on the server side.
 */
export const handleLogout = async (strategy: string | null, redirectPath: string, middleware: string = "auth") => {
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
        statusMessage: middleware === "auth" ?
            "You do not have permission to access this page." :
            "You do not have permission to access this page without two-factor authentication."
    })
};

/**
 * Validates an authentication session based on token and expiration time.
 * @param strategy - The authentication strategy in use.
 * @param token - The authentication token.
 * @param expires - Expiration timestamp of the token.
 * @returns `true` if the session is valid, otherwise `false`.
 */
export const validateSession = (strategy: string | null, token: string | null, expires: string | null): boolean => {
    if (!strategy || !token) return false;

    const expirationTime = expires ? Number(expires) : 0;
    return expirationTime > Date.now();
};

/**
 * Retrieves the appropriate redirect path based on the authentication strategy.
 * @param strategy - The authentication strategy in use.
 * @returns The redirect path for login, callback, or home, defaults to `/` if none is found.
 */
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

/**
 * Universal storage utility for managing session-like data.
 * Uses memory storage in the client and cookies on the server.
 */
const unStorage: Storage = createStorage({
    driver: memoryDriver()
});

/**
 * Extracts the base key name by removing dynamic prefixes and suffixes.
 * Example: "auth._token.local" -> "token"
 * @param key - The original key name.
 * @returns The extracted base key.
 */
function extractBaseKey(key: string): string {
    return key.replace(/^auth\./, '').replace(/\.local$/, '');
}

/**
 * Storage utility with type-safe methods for setting, getting, and removing items.
 */
export const storage = {
    /**
     * Stores a value in the storage.
     * @param key - The key under which the value will be stored.
     * @param value - The value to store, automatically stringified if necessary.
     */
    set<T>(key: string, value: T): Promise<void> {
        const baseKey = extractBaseKey(key);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
        return unStorage.setItem(baseKey, JSON.stringify(value));
    },

    /**
     * Retrieves a value from the storage.
     * @param key - The key of the stored value.
     * @returns A promise resolving to the parsed value if it was JSON, otherwise the raw string.
     */
    async get<T>(key: string): Promise<T | null> {
        const baseKey = extractBaseKey(key);
        let item: string | null = null;
        if (typeof window !== 'undefined') {
            item = sessionStorage.getItem(key);
        }
        if (!item) {
            const storedItem = await unStorage.getItem(baseKey);
            item = storedItem !== null ? String(storedItem) : null;
        }
        if (!item) return null;
        try {
            return JSON.parse(item) as T;
        } catch {
            return item as T; // If not JSON, return as raw value
        }
    },

    /**
     * Removes a specific item from the storage.
     * @param key - The key of the item to remove.
     */
    remove(key: string): Promise<void> {
        const baseKey = extractBaseKey(key);
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(key);
        }
        return unStorage.removeItem(baseKey);
    },

    /**
     * Clears all stored data.
     */
    clear(): Promise<void> {
        if (typeof window !== 'undefined') {
            sessionStorage.clear();
        }
        return unStorage.clear();
    }
};