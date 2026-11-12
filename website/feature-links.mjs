import {featuresWithPage, featureUrl} from '../build/feature-links.ts';

const ids = new Set(featuresWithPage());

/** Links each feature id written in backticks in CHANGELOG.md, like (`review-status`), to its page. */
export const changelogFeatureLinks = ({fileURL}) =>
	fileURL?.pathname.endsWith('/CHANGELOG.md') && {
		name: 'changelog-feature-links',
		inlineCode(node, context) {
			if (ids.has(node.value)) {
				context.replaceNode(node, {type: 'link', url: featureUrl(node.value), children: [node]});
			}
		},
	};
