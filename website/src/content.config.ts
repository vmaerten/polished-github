import {defineCollection} from 'astro:content';
import {glob} from 'astro/loaders';
import {z} from 'astro/zod';

export const groups = ['Triage', 'Reviewing code', 'Discussing', 'Reading'] as const;

const features = defineCollection({
	loader: glob({pattern: '*.md', base: './src/content/features'}),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		group: z.enum(groups),
		appearsIn: z.string(),
		order: z.number(),
		// Intro of the feature page; the summary is used when missing
		lede: z.string().optional(),
		needsToken: z.boolean().default(false),
		onByDefault: z.boolean().default(true),
		// Shown in the home page highlights, so left out of its "everything else" list
		featured: z.boolean().default(false),
	}),
});

export const collections = {features};
