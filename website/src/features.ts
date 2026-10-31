import {getCollection, type CollectionEntry} from 'astro:content';
import {groups} from './content.config';

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
