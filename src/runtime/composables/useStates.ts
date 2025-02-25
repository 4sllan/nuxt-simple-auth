import { useState } from "#imports";
import type {AuthState} from '../types'

export const useAuthStore = () =>
    useState<AuthState>("auth", () => ({
        user: null,
        loggedIn: false,
        strategy: "",
    }));