import { describe, it, expect } from 'vitest';
import Auth from '../src/runtime/plugin'; // Adjust the path as necessary

describe('Auth Class', () => {
    const auth = new Auth({ cookie: { prefix: 'auth_' } });

    it('should initialize with default state', () => {
        expect(auth.loggedIn).toBe(false);
        expect(auth.user).toBe(null);
        expect(auth.strategy).toBe('');
    });

    it('should allow login', () => {
        auth.loginWith('local', { username: 'user', password: 'pass' });
        expect(auth.loggedIn).toBe(true);
        // Add more checks as necessary
    });

    it('should allow logout', () => {
        auth.logout('local');
        expect(auth.loggedIn).toBe(false);
    });
});
