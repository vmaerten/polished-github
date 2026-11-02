import {getCollection, type CollectionEntry} from 'astro:content';
import {groups} from './content.config';
import {rawContent} from '../../CHANGELOG.md';

export {groups};
export type Feature = CollectionEntry<'features'>;

export async function getFeatures(): Promise<Feature[]> {
	const features = await getCollection('features');
	return features.toSorted(
		(a, b) => groups.indexOf(a.data.group) - groups.indexOf(b.data.group) || a.data.order - b.data.order,
	);
}

// A feature gets its own page once its Markdown file has a body
export const hasPage = (feature: Feature): boolean => Boolean(feature.body?.trim());

export const featureUrl = (feature: Feature): string => `/features/${feature.id}/`;

// The first release whose notes name the feature id, written `review-status` in the changelog
export function releasedIn(feature: Feature): string | undefined {
	const releases = rawContent()
		.split(/^## /m)
		.slice(1)
		.filter((notes) => !notes.startsWith('Unreleased'));
	return releases.findLast((notes) => notes.includes(`\`${feature.id}\``))?.split(' ')[0];
}
