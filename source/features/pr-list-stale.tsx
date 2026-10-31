import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {addTitleBadge, forEachListedPullRequest} from '../github-helpers/pr-list.js';
import {getOptions, type StaleSettings} from '../options-storage.js';

export type ActivityInfo = {state: 'OPEN' | 'CLOSED' | 'MERGED'; isDraft: boolean; updatedAt: string};

const badgeClass = 'github-power-stale' as const;
const dayInMs = 24 * 60 * 60 * 1000;

/** Whole days since the PR's last activity, or undefined when it should not be flagged. */
export function getIdleDays(pr: ActivityInfo, settings: StaleSettings, now = Date.now()): number | undefined {
	if (pr.state !== 'OPEN' || (pr.isDraft && !settings.includeDrafts)) {
		return undefined;
	}

	const days = Math.floor((now - Date.parse(pr.updatedAt)) / dayInMs);
	return days >= settings.days ? days : undefined;
}

function addBadge(title: HTMLElement, days: number): void {
	addTitleBadge(
		title,
		badgeClass,
		<span className={`Label Label--severe ${badgeClass}`} title={`No activity for ${days} days`}>
			Idle {days}d
		</span>,
	);
}

const prListStale: Feature = {
	id: 'pr-list-stale',
	description: 'Flags PRs with no recent activity in the repository pull request list.',
	include: [pageDetect.isRepoPRList],
	requiresToken: true,
	async init(signal) {
		const {stale} = await getOptions();
		// Fetched again on every visit, like the review status: any comment or push resets the count
		forEachListedPullRequest<ActivityInfo>(
			'state isDraft updatedAt',
			(title, pr) => {
				const days = getIdleDays(pr, stale);
				if (days !== undefined) {
					addBadge(title, days);
				}
			},
			{signal, cache: new Map()},
		);
	},
};

export default prListStale;
