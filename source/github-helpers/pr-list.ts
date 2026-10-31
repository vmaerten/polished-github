import * as pageDetect from 'github-url-detection';

import {observe} from '../helpers/observe.js';
import {v4} from './api.js';

const titleLinks = 'ul[role="list"] > li h3 a[href*="/pull/"]';

// Badges keep this order after a PR title, whichever request answers first
const badgeOrder = ['github-power-diff-stats', 'github-power-review-status', 'github-power-stale'] as const;

export type TitleBadgeClass = (typeof badgeOrder)[number];

function getNumber(link: HTMLAnchorElement): number | undefined {
	const match = /\/pull\/(\d+)\/?$/.exec(link.pathname);
	return match ? Number(match[1]) : undefined;
}

async function fetchPullRequests<T>(numbers: number[], fields: string): Promise<Record<string, T>> {
	const {owner, name} = pageDetect.utils.getRepositoryInfo()!;
	const aliases = numbers.map((number) => `pr${number}: pullRequest(number: ${number}) {${fields}}`);
	const {repository} = await v4<{repository: Record<string, T>}>(
		`query($owner: String!, $name: String!) {repository(owner: $owner, name: $name) {${aliases.join(' ')}}}`,
		{owner, name},
	);
	return repository;
}

async function handleTitles<T>(
	links: Element[],
	fields: string,
	callback: (title: HTMLHeadingElement, pr: T) => void,
	cache: Map<string, T>,
): Promise<void> {
	const {nameWithOwner} = pageDetect.utils.getRepositoryInfo()!;
	const keyOf = (number: number): string => `${nameWithOwner}#${number}`;
	const rows = links.flatMap((link) => {
		const title = link.closest('h3');
		const number = link instanceof HTMLAnchorElement ? getNumber(link) : undefined;
		return title && number !== undefined ? [{title, number}] : [];
	});

	const missing = [...new Set(rows.map(({number}) => number))].filter((number) => !cache.has(keyOf(number)));
	if (missing.length > 0) {
		const fetched = await fetchPullRequests<T>(missing, fields);
		for (const number of missing) {
			cache.set(keyOf(number), fetched[`pr${number}`]);
		}
	}

	for (const {title, number} of rows) {
		callback(title, cache.get(keyOf(number))!);
	}
}

/**
 * Calls `callback` with each PR title of the repository PR list and the GraphQL `fields` of that PR, now and as GitHub
 * renders more rows. One query per render; PRs already in `cache` are not fetched again, so its lifetime sets freshness.
 */
export function forEachListedPullRequest<T>(
	fields: string,
	callback: (title: HTMLHeadingElement, pr: T) => void,
	{signal, cache}: {signal: AbortSignal; cache: Map<string, T>},
): void {
	observe(
		titleLinks,
		(links) => {
			handleTitles(links, fields, callback, cache).catch((error: unknown) => {
				console.error('github-power: fetching the PR list data failed', error);
			});
		},
		{signal},
	);
}

const badgesClass = 'github-power-title-badges';

// Inside the title: its siblings are cells of the row's CSS grid, where extra elements land in random cells
function getBadgesContainer(title: HTMLElement): HTMLElement {
	const existing = title.querySelector<HTMLElement>(`:scope > .${badgesClass}`);
	if (existing) {
		return existing;
	}

	const container = document.createElement('span');
	container.className = badgesClass;
	Object.assign(container.style, {
		display: 'inline-flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: '6px',
		marginLeft: '8px',
		verticalAlign: 'middle',
	});
	title.append(container);
	return container;
}

/** Adds `badge`, which carries `className`, next to a PR title unless that title already has one. */
export function addTitleBadge(title: HTMLElement, className: TitleBadgeClass, badge: Element): void {
	const container = getBadgesContainer(title);
	if (container.querySelector(`:scope > .${className}`)) {
		return;
	}

	const previous = badgeOrder
		.slice(0, badgeOrder.indexOf(className))
		.toReversed()
		.map((previousClass) => container.querySelector(`:scope > .${previousClass}`))
		.find((element) => element !== null);
	if (previous) {
		previous.after(badge);
	} else {
		container.prepend(badge);
	}
}
