declare module '#auth-utils' {
    /**
     * Storage utility class for managing stored values.
     */
    export class storage {
        /**
         * Stores a value in the storage.
         * @param key - The key under which the value will be stored.
         * @param value - The value to store, automatically stringified if necessary.
         */
        static set<T>(key: string, value: T): Promise<void>;

        /**
         * Retrieves a value from the storage.
         * @param key - The key of the stored value.
         * @returns A promise resolving to the parsed value if it was JSON, otherwise the raw string.
         */
        static get<T>(key: string): Promise<T | null>;

        /**
         * Removes a specific item from the storage.
         * @param key - The key of the item to remove.
         */
        static remove(key: string): Promise<void>;

        /**
         * Clears all stored data.
         */
        static clear(): Promise<void>;
    }
}
