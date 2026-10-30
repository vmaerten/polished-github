import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {v4} from '../github-helpers/api.js';
import {observe} from '../helpers/observe.js';
import {type DiffStatsSettings, getOptions} from '../options-storage.js';

type DiffStats = {additions: number; deletions: number; changedFiles: number};

const titleLinks = 'ul[role="list"] > li h3 a[href*="/pull/"]';
const badgeClass = 'github-power-diff-stats';

const sizeLabels = ['XS', 'S', 'M', 'L', 'XL'];

export function getSizeLabel(changedLines: number, thresholds: DiffStatsSettings['sizeThresholds']): string {
	const index = thresholds.findIndex((max) => changedLines <= max);
	return sizeLabels[index === -1 ? thresholds.length : index];
}

// Kept for the life of the tab: lists are revisited often, and a reload refreshes stale numbers
const cache = new Map<string, DiffStats>();

function getNumber(link: HTMLAnchorElement): number | undefined {
	const match = /\/pull\/(\d+)\/?$/.exec(link.pathname);
	return match ? Number(match[1]) : undefined;
}

async function fetchStats(owner: string, name: string, numbers: number[]): Promise<Record<string, DiffStats>> {
	const fields = numbers.map(
		(number) => `pr${number}: pullRequest(number: ${number}) {additions deletions changedFiles}`,
	);
	const {repository} = await v4<{repository: Record<string, DiffStats>}>(
		`query($owner: String!, $name: String!) {repository(owner: $owner, name: $name) {${fields.join(' ')}}}`,
		{owner, name},
	);
	return repository;
}

function addBadge(link: HTMLAnchorElement, stats: DiffStats, settings: DiffStatsSettings): void {
	const title = link.closest('h3');
	// Other features add badges next to the title too, so ours is not always right after it
	if (!title || title.parentElement?.querySelector(`:scope > .${badgeClass}`)) {
		return;
	}

	const {additions, deletions, changedFiles} = stats;
	const files = `${changedFiles} ${changedFiles === 1 ? 'file' : 'files'}`;
	title.after(
		<span
			className={badgeClass}
			title={`${files} changed`}
			style={{
				marginLeft: '8px',
				fontFamily: 'var(--fontStack-monospace, monospace)',
				fontSize: '12px',
				fontWeight: '600',
				whiteSpace: 'nowrap',
			}}
		>
			<span style={{color: 'var(--fgColor-success, #1a7f37)'}}>+{additions.toLocaleString()}</span>{' '}
			<span style={{color: 'var(--fgColor-danger, #d1242f)'}}>−{deletions.toLocaleString()}</span>
			{settings.showChangedFiles && (
				<span style={{color: 'var(--fgColor-muted, #59636e)', fontWeight: '400'}}> · {files}</span>
			)}
			{settings.showSizeLabel && (
				<span className="Label" style={{marginLeft: '6px'}}>
					{getSizeLabel(additions + deletions, settings.sizeThresholds)}
				</span>
			)}
		</span>,
	);
}

async function addBadges(links: HTMLAnchorElement[], settings: DiffStatsSettings): Promise<void> {
	const {owner, name, nameWithOwner} = pageDetect.utils.getRepositoryInfo()!;
	const keyOf = (number: number): string => `${nameWithOwner}#${number}`;
	const numbered = links.flatMap((link) => {
		const number = getNumber(link);
		return number === undefined ? [] : [{link, number}];
	});

	const missing = [...new Set(numbered.map(({number}) => number))].filter((number) => !cache.has(keyOf(number)));
	if (missing.length > 0) {
		const stats = await fetchStats(owner, name, missing);
		for (const number of missing) {
			cache.set(keyOf(number), stats[`pr${number}`]);
		}
	}

	for (const {link, number} of numbered) {
		addBadge(link, cache.get(keyOf(number))!, settings);
	}
}

const prListDiffStats: Feature = {
	id: 'pr-list-diff-stats',
	description: 'Shows lines added and removed for each PR in the repository pull request list.',
	include: [pageDetect.isRepoPRList],
	requiresToken: true,
	async init(signal) {
		const {diffStats} = await getOptions();
		observe(
			titleLinks,
			(elements) => {
				const links = elements.filter((element) => element instanceof HTMLAnchorElement);
				addBadges(links, diffStats).catch((error: unknown) => {
					console.error('github-power: pr-list-diff-stats failed', error);
				});
			},
			{signal},
		);
	},
};

export default prListDiffStats;
