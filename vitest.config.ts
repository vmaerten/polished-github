import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'happy-dom',
		environmentOptions: {happyDOM: {url: 'https://github.com'}},
		setupFiles: ['source/test-setup.ts'],
	},
});
