import svelte from 'rollup-plugin-svelte';
import {defineConfig, type UserConfig} from 'tsdown';

const shared: UserConfig = {
	platform: 'browser',
	outDir: 'distribution',
	dts: false,
	hash: false,
	clean: false,
	// Extensions can't load remote code: everything ships in the bundle
	deps: {alwaysBundle: [/.*/], onlyBundle: false},
	inputOptions: {
		resolve: {conditionNames: ['production', 'browser', 'module', 'import', 'default']},
		transform: {jsx: {runtime: 'classic'}},
	},
	plugins: [svelte({emitCss: false})],
};

export default defineConfig([
	{
		...shared,
		// Content scripts can't be ES modules
		entry: {'content-script': 'source/content-script.ts'},
		format: 'iife',
		clean: true,
		outputOptions: {entryFileNames: '[name].js'},
		copy: [
			{from: 'source/manifest.json', to: 'distribution'},
			{from: 'source/options.html', to: 'distribution'},
			{from: 'source/icons/*.png', to: 'distribution/icons'},
			{
				from: 'node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
				to: 'distribution/fonts',
			},
			{
				from: 'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
				to: 'distribution/fonts',
			},
		],
	},
	{
		...shared,
		entry: {options: 'source/options.ts'},
		format: 'esm',
	},
]);
