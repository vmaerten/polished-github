import {defineConfig} from 'astro/config';

export default defineConfig({
	// Compression drops the line breaks between inline tags, and with them the spaces they render
	compressHTML: false,
});
