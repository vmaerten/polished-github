import * as pageDetect from 'github-url-detection';

import {observe} from '../helpers/observe.js';
import type {BadgePlacement} from '../options-storage.js';
import {v4} from './api.js';

const titleLinks = 'ul[role="list"] > li h3 a[href*="/pull/"]';

// One order for every row whichever request answers first; in the right column each badge also keeps its own
// fixed-width column, so badges line up from row to row even when some are missing
const badgeColumns = [
	{className: 'github-power-review-status', width: 136},
	{className: 'github-power-diff-stats', width: 160},
	{className: 'github-power-stale', width: 44},
] as const;

const columnGap = 12;
// Room left after our columns for GitHub's own counters and avatars
const githubItemsWidth = 96;

export type BadgeClass = (typeof badgeColumns)[number]['className'];

const containerClass = 'github-power-badges';

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

// Rows are CSS grids; their areas are named, unlike their classes, which change with every GitHub deploy
function findRowArea(title: HTMLElement, area: string): HTMLElement | undefined {
	const row = title.closest('li');
	return [...(row?.children ?? [])].find(
		(child): child is HTMLElement => child instanceof HTMLElement && getComputedStyle(child).gridArea.startsWith(area),
	);
}

// The area stacks the "#123 · opened by" line above the labels; the line is the first row of several items
function findMetadataLine(title: HTMLElement): HTMLElement | undefined {
	const area = findRowArea(title, 'main-content');
	return [...(area?.querySelectorAll<HTMLElement>('*') ?? [])].find(
		(element) => element.children.length > 1 && getComputedStyle(element).flexDirection !== 'column',
	);
}

function getContainer(title: HTMLElement, placement: BadgePlacement): HTMLElement {
	const row = title.closest('li') ?? title;
	const existing = row.querySelector<HTMLElement>(`.${containerClass}`);
	if (existing) {
		return existing;
	}

	const container = document.createElement('span');
	container.className = containerClass;
	container.dataset.placement = placement;
	container.style.fontSize = '12px';
	const rightColumn = placement === 'right' ? findRowArea(title, 'metadata') : undefined;
	const metadataLine = placement === 'metadata' ? findMetadataLine(title) : undefined;
	if (rightColumn) {
		Object.assign(container.style, {
			display: 'grid',
			gridTemplateColumns: badgeColumns.map(({width}) => `${width}px`).join(' '),
			columnGap: `${columnGap}px`,
			justifyItems: 'end',
			alignItems: 'center',
			// Pushes GitHub's items to the right edge
			marginRight: 'auto',
		});
		// The column sizes itself to its content, so without a shared width our columns would start at a different place on every row
		const badgesWidth = badgeColumns.reduce((sum, {width}) => sum + width + columnGap, 0);
		rightColumn.style.minWidth = `${badgesWidth + githubItemsWidth}px`;
		rightColumn.prepend(container);
	} else {
		Object.assign(container.style, {display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px'});
		if (metadataLine) {
			metadataLine.append(container);
		} else {
			// Unknown row layout: next to the title, which is always there
			container.style.marginLeft = '8px';
			title.append(container);
		}
	}

	return container;
}

/** Adds `badge`, which carries `className`, to the PR row of `title` unless that row already has one. */
export function addPullRequestBadge(
	title: HTMLElement,
	className: BadgeClass,
	badge: Element,
	placement: BadgePlacement,
): void {
	const container = getContainer(title, placement);
	if (container.querySelector(`:scope > [data-badge="${className}"]`)) {
		return;
	}

	const index = badgeColumns.findIndex((column) => column.className === className);
	const slot = document.createElement('span');
	slot.dataset.badge = className;
	if (container.style.display === 'grid') {
		slot.style.gridArea = `1 / ${index + 1}`;
	} else {
		slot.style.order = String(index);
		if (container.parentElement !== title) {
			slot.append('· ');
		}
	}

	slot.append(badge);
	container.append(slot);
}
