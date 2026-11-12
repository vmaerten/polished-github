import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';

export const siteUrl = 'https://polished-github.vmaerten.fr';

const featuresDir = path.join(import.meta.dirname, '../website/src/content/features');

/** The ids of the features with a page on the website: like `hasPage` there, those whose Markdown has a body. */
export function featuresWithPage(): string[] {
	return readdirSync(featuresDir)
		.filter((file) => file.endsWith('.md'))
		.filter((file) => {
			const [, , body = ''] = readFileSync(path.join(featuresDir, file), 'utf8').split(/^---$/m);
			return body.trim() !== '';
		})
		.map((file) => file.replace(/\.md$/, ''));
}

export const featureUrl = (id: string): string => `/features/${id}/`;

/** Links each feature id written in backticks, like (`review-status`), to its page on the website. */
export function linkFeatureIds(markdown: string, ids: readonly string[]): string {
	let linked = markdown;
	for (const id of ids) {
		linked = linked.replaceAll(`\`${id}\``, `[\`${id}\`](${siteUrl}${featureUrl(id)})`);
	}

	return linked;
}
