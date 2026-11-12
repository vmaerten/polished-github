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
import {getOptions, type StaleSettings} from '../options-storage.js';

export type ActivityInfo = {state: PullRequestState; isDraft: boolean; updatedAt: string};

const badgeClass = 'polished-github-stale' as const;
const dayInMs = 24 * 60 * 60 * 1000;

/** Whole days since the PR's last activity, or undefined when it should not be flagged. */
export function getIdleDays(pr: ActivityInfo, settings: StaleSettings, now = Date.now()): number | undefined {
	if (pr.state !== 'OPEN' || (pr.isDraft && !settings.includeDrafts)) {
		return undefined;
	}

	const days = Math.floor((now - Date.parse(pr.updatedAt)) / dayInMs);
	return days >= settings.days ? days : undefined;
}

function addBadge(title: HTMLElement, days: number, options: BadgeOptions): void {
	addPullRequestBadge(
		title,
		badgeClass,
		<span
			className={badgeClass}
			title={`No activity for ${days} days`}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: '3px',
				color: 'var(--fgColor-severe, #bc4c00)',
				whiteSpace: 'nowrap',
			}}
		>
			<svg
				width="12"
				height="12"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				aria-hidden="true"
			>
				<circle cx="8" cy="8" r="6.25" />
				<path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
			</svg>
			{days}d
		</span>,
		options,
	);
}

const idlePrs: Feature = {
	id: 'idle-prs',
	description: t('feature_idlePrs'),
	include: [pageDetect.isRepoPRList, pageDetect.isGlobalPRList],
	requiresToken: true,
	async init(signal) {
		const options = await getOptions();
		// Fetched again on every visit, like the review status: any comment or push resets the count
		forEachListedPullRequest<ActivityInfo>(
			'state isDraft updatedAt',
			(title, pr) => {
				const days = getIdleDays(pr, options.stale);
				if (days === undefined) {
					removePullRequestBadge(title, badgeClass);
				} else {
					addBadge(title, days, options);
				}
			},
			{signal},
		);
	},
};

export default idlePrs;
