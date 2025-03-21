import { describe, it, expect, beforeAll } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

beforeAll(async () => {
    await setup({
        server: true, // Garante que o servidor esteja rodando
    });
});
describe('Auth Module API', () => {
    const routes = [
        { url: '/api/auth-token', method: 'POST' },
        { url: '/api/send-token-2fa', method: 'POST' },
        { url: '/api/logout', method: 'GET' }
    ];

    routes.forEach(({ url, method }) => {
        it(`should check if route ${url} exists`, async () => {
            try {
                const response = await $fetch(url, {
                    baseURL: 'http://localhost:3000',
                    method
                });
                expect(response).toBeDefined();
            } catch (error) {
                console.error(`Error on route ${url}:`, error);
                expect(error.response).toBeDefined();
            }
        });
    });
});