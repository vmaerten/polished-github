import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {addPullRequestBadge, forEachListedPullRequest} from '../github-helpers/pr-list.js';
import {type BadgePlacement, type DiffStatsSettings, getOptions} from '../options-storage.js';

type DiffStats = {additions: number; deletions: number; changedFiles: number};

const badgeClass = 'polished-github-diff-stats' as const;

const sizeLabels = ['XS', 'S', 'M', 'L', 'XL'];

export function getSizeLabel(changedLines: number, thresholds: DiffStatsSettings['sizeThresholds']): string {
	const index = thresholds.findIndex((max) => changedLines <= max);
	return sizeLabels[index === -1 ? thresholds.length : index];
}

// Kept for the life of the tab: lists are revisited often, and a reload refreshes stale numbers
const cache = new Map<string, DiffStats>();

function addBadge(title: HTMLElement, stats: DiffStats, settings: DiffStatsSettings, placement: BadgePlacement): void {
	const {additions, deletions, changedFiles} = stats;
	const files = `${changedFiles} ${changedFiles === 1 ? 'file' : 'files'}`;
	addPullRequestBadge(
		title,
		badgeClass,
		<span
			className={badgeClass}
			title={`${files} changed`}
			style={{fontFamily: 'var(--fontStack-monospace, monospace)', whiteSpace: 'nowrap'}}
		>
			<span style={{color: 'var(--fgColor-success, #1a7f37)'}}>+{additions.toLocaleString()}</span>{' '}
			<span style={{color: 'var(--fgColor-danger, #d1242f)'}}>−{deletions.toLocaleString()}</span>
			{settings.showChangedFiles && (
				<span style={{color: 'var(--fgColor-muted, #59636e)', fontWeight: '400'}}> · {files}</span>
			)}
			{settings.showSizeLabel && (
				<span style={{color: 'var(--fgColor-muted, #59636e)', fontWeight: '600'}}>
					{' '}
					{getSizeLabel(additions + deletions, settings.sizeThresholds)}
				</span>
			)}
		</span>,
		placement,
	);
}

const prListDiffStats: Feature = {
	id: 'pr-list-diff-stats',
	description: 'Shows lines added and removed for each PR in the repository pull request list.',
	include: [pageDetect.isRepoPRList],
	requiresToken: true,
	async init(signal) {
		const {diffStats, prListBadges} = await getOptions();
		forEachListedPullRequest<DiffStats>(
			'additions deletions changedFiles',
			(title, stats) => addBadge(title, stats, diffStats, prListBadges),
			{signal, cache},
		);
	},
};

export default prListDiffStats;
