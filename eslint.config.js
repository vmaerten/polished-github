import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import {defineConfig} from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
	{ignores: ['distribution', 'web-ext-artifacts']},
	js.configs.recommended,
	tseslint.configs.recommended,
	svelte.configs.recommended,
	{languageOptions: {globals: {...globals.browser, chrome: 'readonly'}}},
	{
		files: ['**/*.svelte'],
		languageOptions: {parserOptions: {parser: tseslint.parser}},
	},
);
