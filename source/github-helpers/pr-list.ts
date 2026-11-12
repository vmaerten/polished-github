import {observe} from '../helpers/observe.js';
import {isFeatureEnabled, type Options} from '../options-storage.js';
import {v4} from './api.js';

export type PullRequestState = 'OPEN' | 'CLOSED' | 'MERGED';

const titleLinks = 'ul[role="list"] > li h3 a[href*="/pull/"]';

// One order for every row whichever request answers first; in the right column each enabled feature also keeps its
// own fixed-width column, so badges line up from row to row even when some are missing
const badgeColumns = [
	{className: 'polished-github-review-status', feature: 'review-status', width: 168},
	{className: 'polished-github-diff-stats', feature: 'diff-stats', width: 160},
	{className: 'polished-github-stale', feature: 'idle-prs', width: 44},
	{className: 'polished-github-unresolved-comments', feature: 'unresolved-comments', width: 44},
] as const;

const columnGap = 12;
// Room left after our columns for GitHub's own counters and avatars
const githubItemsWidth = 96;

export type BadgeClass = (typeof badgeColumns)[number]['className'];

export type BadgeOptions = Pick<Options, 'prListBadges' | 'disabledFeatures' | 'enabledFeatures'>;

const containerClass = 'polished-github-badges';

type ListedPullRequest = {owner: string; name: string; number: number};

/** The PR a title link points to. Read from the link rather than the page: the global list mixes repositories. */
export function parsePullRequestLink(link: Element): ListedPullRequest | undefined {
	const match = link instanceof HTMLAnchorElement ? /^\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/.exec(link.pathname) : null;
	return match ? {owner: match[1], name: match[2], number: Number(match[3])} : undefined;
}

async function fetchPullRequests<T>(
	{owner, name}: Pick<ListedPullRequest, 'owner' | 'name'>,
	numbers: number[],
	fields: string,
): Promise<Record<string, T>> {
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
	const keyOf = ({owner, name, number}: ListedPullRequest): string => `${owner}/${name}#${number}`;
	const rows = links.flatMap((link) => {
		const title = link.closest('h3');
		const pr = parsePullRequestLink(link);
		return title && pr ? [{title, pr}] : [];
	});

	const missingByRepository = new Map<string, ListedPullRequest[]>();
	for (const {pr} of rows) {
		if (!cache.has(keyOf(pr))) {
			const nameWithOwner = `${pr.owner}/${pr.name}`;
			missingByRepository.set(nameWithOwner, [...(missingByRepository.get(nameWithOwner) ?? []), pr]);
		}
	}

	// One query per repository: GraphQL fails the whole query when one repository is out of the token's reach, which
	// on the global list would leave every row bare
	const results = await Promise.allSettled(
		[...missingByRepository].map(async ([nameWithOwner, prs]) => {
			const numbers = [...new Set(prs.map(({number}) => number))];
			const fetched = await fetchPullRequests<T>(prs[0], numbers, fields).catch((error: unknown) => {
				throw new Error(`fetching the PRs of ${nameWithOwner} failed`, {cause: error});
			});
			for (const pr of prs) {
				cache.set(keyOf(pr), fetched[`pr${pr.number}`]);
			}
		}),
	);

	for (const {title, pr} of rows) {
		// Not cached when its repository failed: the row keeps whatever it showed
		if (cache.has(keyOf(pr))) {
			callback(title, cache.get(keyOf(pr))!);
		}
	}

	const errors = results.flatMap((result) => (result.status === 'rejected' ? [result.reason as unknown] : []));
	if (errors.length > 0) {
		throw new AggregateError(errors, 'some repositories failed');
	}
}

/**
 * Calls `callback` with each PR title of a PR list, of a repository or the global one, and the GraphQL `fields` of that
 * PR, now and as GitHub renders more rows. One query per repository and render; PRs already in `cache` are not fetched
 * again, so its lifetime sets freshness: without one, every render fetches afresh.
 */
export function forEachListedPullRequest<T>(
	fields: string,
	callback: (title: HTMLHeadingElement, pr: T) => void,
	{signal, cache = new Map()}: {signal: AbortSignal; cache?: Map<string, T>},
): void {
	observe(
		titleLinks,
		(links) => {
			handleTitles(links, fields, callback, cache).catch((error: unknown) => {
				console.error('polished-github: fetching the PR list data failed', error);
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

function getContainer(title: HTMLElement, {prListBadges: placement, ...toggles}: BadgeOptions): HTMLElement {
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
		// A disabled feature would leave an empty column on every row
		const columns = badgeColumns.filter(({feature}) => isFeatureEnabled(feature, toggles));
		container.dataset.columns = columns.map(({className}) => className).join(' ');
		Object.assign(container.style, {
			display: 'grid',
			// A wider badge widens its column on that row rather than running over the next one
			gridTemplateColumns: columns.map(({width}) => `minmax(${width}px, max-content)`).join(' '),
			columnGap: `${columnGap}px`,
			justifyItems: 'end',
			alignItems: 'center',
			// Pushes GitHub's items to the right edge
			marginRight: 'auto',
		});
		// The column sizes itself to its content, so without a shared width our columns would start at a different place on every row
		const badgesWidth = columns.reduce((sum, {width}) => sum + width + columnGap, 0);
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

/** Adds `badge`, which carries `className`, to the PR row of `title`, replacing the one already there. */
export function addPullRequestBadge(
	title: HTMLElement,
	className: BadgeClass,
	badge: Element,
	options: BadgeOptions,
): void {
	removePullRequestBadge(title, className);
	const container = getContainer(title, options);

	const slot = document.createElement('span');
	slot.dataset.badge = className;
	if (container.dataset.columns) {
		// The columns the row was built with, should the options have changed since
		slot.style.gridArea = `1 / ${container.dataset.columns.split(' ').indexOf(className) + 1}`;
	} else {
		slot.style.order = String(badgeColumns.findIndex((column) => column.className === className));
		if (container.parentElement !== title) {
			slot.append('· ');
		}
	}

	slot.append(badge);
	container.append(slot);
}

/** Removes the `className` badge from the PR row of `title`, for a PR that no longer needs it. */
export function removePullRequestBadge(title: HTMLElement, className: BadgeClass): void {
	(title.closest('li') ?? title).querySelector(`.${containerClass} > [data-badge="${className}"]`)?.remove();
}
