import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {
	addPullRequestBadge,
	type BadgeOptions,
	forEachListedPullRequest,
	type PullRequestState,
	removePullRequestBadge,
} from '../github-helpers/pr-list.js';
import {t} from '../helpers/i18n.js';
import {getOptions} from '../options-storage.js';

export type ThreadsInfo = {
	state: PullRequestState;
	reviewThreads: {nodes: Array<{isResolved: boolean}>; pageInfo: {hasNextPage: boolean}};
};

const badgeClass = 'polished-github-unresolved-comments' as const;
const threadsPerPr = 100;

/** The unresolved review threads of an open PR, like `3`, or `3+` past the first page; undefined when there are none. */
export function getUnresolvedCount({state, reviewThreads}: ThreadsInfo): string | undefined {
	const count = reviewThreads.nodes.filter(({isResolved}) => !isResolved).length;
	if (state !== 'OPEN' || count === 0) {
		return undefined;
	}

	return reviewThreads.pageInfo.hasNextPage ? `${count}+` : String(count);
}

function addBadge(title: HTMLElement, count: string, options: BadgeOptions): void {
	addPullRequestBadge(
		title,
		badgeClass,
		<span
			className={badgeClass}
			title={count === '1' ? '1 unresolved conversation' : `${count} unresolved conversations`}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: '3px',
				color: 'var(--fgColor-attention, #9a6700)',
				fontWeight: '600',
				whiteSpace: 'nowrap',
			}}
		>
			<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
			</svg>
			{count}
		</span>,
		options,
	);
}

const unresolvedComments: Feature = {
	id: 'unresolved-comments',
	description: t('feature_unresolvedComments'),
	include: [pageDetect.isRepoPRList, pageDetect.isGlobalPRList],
	requiresToken: true,
	async init(signal) {
		const options = await getOptions();
		// Fetched again on every visit, like the review status: a thread gets resolved or opened at any time
		forEachListedPullRequest<ThreadsInfo>(
			`state reviewThreads(first: ${threadsPerPr}) {nodes {isResolved} pageInfo {hasNextPage}}`,
			(title, pr) => {
				const count = getUnresolvedCount(pr);
				if (count) {
					addBadge(title, count, options);
				} else {
					removePullRequestBadge(title, badgeClass);
				}
			},
			{signal},
		);
	},
};

export default unresolvedComments;
