import {createError, navigateTo, useNuxtApp} from "#imports";
import {createStorage} from 'unstorage';
import type {Storage} from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';

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