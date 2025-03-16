import { describe, it, expect, beforeAll } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

// Configuração antes dos testes
beforeAll(async () => {
    await setup({
        server: true,
        runtimeConfig: {
            secret: {
                local: {
                    client_id: 1,
                    client_secret: '1yU9bPrjspLF9FS7SMPah5O7KXWMA04Kv6dfnTMd',
                    grant_type: 'password',
                },
            },
            public: {
                apiBase: '/api',
                baseURL: process.env.baseURL,
            },
        },
    });
});

describe('Auth Module API', () => {
    it('should authenticate user and return auth token', async () => {
        const response = await $fetch('/oauth/token', {
            method: 'POST',
            body: JSON.stringify({
                username: 'test@example.com',
                password: 'password',
                client_id: 1,
                client_secret: '1yU9bPrjspLF9FS7SMPah5O7KXWMA04Kv6dfnTMd',
                grant_type: 'password',
            }),
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('access_token');
    });

    it('should $fetch user profile', async () => {
        const response = await $fetch('/api/profile', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer mockToken' },
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('email');
    });

    it('should send 2FA token', async () => {
        const response = await $fetch('/api/send-token-2fa', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer mockToken' },
        });

        expect(response.status).toBe(200);
    });
});
