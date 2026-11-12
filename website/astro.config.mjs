import {satteri} from '@astrojs/markdown-satteri';
import {defineConfig} from 'astro/config';
import {changelogFeatureLinks} from './feature-links.mjs';

export default defineConfig({
	// Compression drops the line breaks between inline tags, and with them the spaces they render
	compressHTML: false,
	// Its launcher sits over the bottom of the page, where it reads as part of the footer
	devToolbar: {enabled: false},
	markdown: {processor: satteri({mdastPlugins: [changelogFeatureLinks]})},
});
