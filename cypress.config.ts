import { defineConfig } from 'cypress';

export default defineConfig({
	projectId: '7t2nix',
	e2e: {
		baseUrl: 'http://localhost',
	},
	defaultCommandTimeout: 8000,
	env: {
		apiUrl: 'http://localhost/api',
	},
});
