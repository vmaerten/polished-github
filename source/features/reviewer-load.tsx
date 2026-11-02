import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {v4} from '../github-helpers/api.js';
import {observe} from '../helpers/observe.js';
import {t} from '../helpers/i18n.js';
import {mutedColor} from '../github-helpers/colors.js';

// The picker loads its rows when opened and again when filtering
const usernames = '#reviewers-select-menu .select-menu-item .js-username';
const dividers = '#reviewers-select-menu .select-menu-divider';
const loadClass = 'polished-github-reviewer-load';
const headerClass = 'polished-github-reviewer-load-header';

// Up to 2 pending reviews is a normal load
const loadLevels = [
	{max: 2, color: mutedColor, background: 'var(--bgColor-neutral-muted, #818b981f)'},
	{max: 5, color: 'var(--fgColor-attention, #9a6700)', background: 'var(--bgColor-attention-muted, #d4a72c33)'},
	{max: Infinity, color: 'var(--fgColor-severe, #bc4c00)', background: 'var(--bgColor-severe-muted, #fb8f4433)'},
];

function pendingQuery(reviewer: string, owner: string): string {
	const qualifier = reviewer.includes('/') ? 'team-review-requested' : 'review-requested';
	return `is:pr is:open ${qualifier}:${reviewer} user:${owner}`;
}

// GraphQL search instead of the REST search endpoint, which allows only 30 calls a minute
async function fetchPendingCounts(reviewers: string[], owner: string): Promise<number[]> {
	const variables = Object.fromEntries(
		reviewers.map((reviewer, index) => [`q${index}`, pendingQuery(reviewer, owner)]),
	);
	const declarations = reviewers.map((_, index) => `$q${index}: String!`).join(', ');
	const searches = reviewers.map(
		(_, index) => `r${index}: search(query: $q${index}, type: ISSUE, first: 0) {issueCount}`,
	);
	const result = await v4<Record<string, {issueCount: number}>>(
		`query(${declarations}) {${searches.join(' ')}}`,
		variables,
	);
	return reviewers.map((_, index) => result[`r${index}`].issueCount);
}

// Shared by the rows of a page, so filtering the picker fetches nobody twice
function getCounts(
	reviewers: string[],
	owner: string,
	cache: Map<string, Promise<number>>,
): Map<string, Promise<number>> {
	const missing = reviewers.filter((reviewer) => !cache.has(reviewer));
	if (missing.length > 0) {
		const fetched = fetchPendingCounts(missing, owner);
		for (const [index, reviewer] of missing.entries()) {
			const count = fetched.then((counts) => counts[index]);
			cache.set(reviewer, count);
			count.catch(() => cache.delete(reviewer));
		}
	}

	return new Map(reviewers.map((reviewer) => [reviewer, cache.get(reviewer)!]));
}

// Added as soon as the row appears, so the count fills a space already there instead of moving the rows
function reserveCounter(username: Element): HTMLElement | undefined {
	const item = username.closest<HTMLElement>('.select-menu-item');
	if (!item) {
		return undefined;
	}

	const existing = item.querySelector<HTMLElement>(`.${loadClass}`);
	if (existing) {
		return existing;
	}

	// The item is a block layout: an absolute counter keeps it in a right-hand column without reflowing the name
	item.style.position = 'relative';
	item.querySelector<HTMLElement>('.select-menu-item-text')?.style.setProperty('padding-right', '36px');
	const counter = (
		<span
			className={loadClass}
			style={{
				position: 'absolute',
				top: '50%',
				right: '16px',
				transform: 'translateY(-50%)',
				minWidth: '22px',
				height: '20px',
				boxSizing: 'border-box',
				padding: '0 7px',
				borderRadius: '999px',
				fontSize: '12px',
				fontWeight: '600',
				lineHeight: '20px',
				textAlign: 'center',
				background: loadLevels[0].background,
			}}
		/>
	) as HTMLElement;
	item.append(counter);
	if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
		counter.animate([{opacity: 1}, {opacity: 0.4}], {duration: 800, direction: 'alternate', iterations: Infinity});
	}

	return counter;
}

function fillCounter(counter: HTMLElement, count: number, owner: string): void {
	const {color, background} = loadLevels.find(({max}) => count <= max)!;
	const description = `${count} open ${count === 1 ? 'PR' : 'PRs'} waiting for their review in ${owner}`;
	for (const animation of counter.getAnimations()) {
		animation.cancel();
	}

	counter.textContent = String(count);
	counter.title = description;
	counter.setAttribute('aria-label', description);
	counter.style.color = color;
	counter.style.background = background;
}

function removeCounter(counter: HTMLElement): void {
	counter.parentElement?.querySelector<HTMLElement>('.select-menu-item-text')?.style.removeProperty('padding-right');
	counter.remove();
}

function addHeader(divider: Element): void {
	if (divider.querySelector(`.${headerClass}`)) {
		return;
	}

	divider.append(
		<span className={headerClass} style={{float: 'right', fontWeight: '400', color: mutedColor}}>
			Pending reviews
		</span>,
	);
}

async function addCounts(elements: Element[], cache: Map<string, Promise<number>>): Promise<void> {
	const {owner} = pageDetect.utils.getRepositoryInfo()!;
	const rows = elements.flatMap((element) => {
		const reviewer = element.textContent.trim();
		const counter = reviewer ? reserveCounter(element) : undefined;
		return counter ? [{counter, reviewer}] : [];
	});

	const counts = getCounts([...new Set(rows.map(({reviewer}) => reviewer))], owner, cache);
	const results = await Promise.allSettled(
		rows.map(async ({counter, reviewer}) => {
			try {
				fillCounter(counter, await counts.get(reviewer)!, owner);
			} catch (error) {
				removeCounter(counter);
				throw error;
			}
		}),
	);
	const failure = results.find((result) => result.status === 'rejected');
	if (failure) {
		throw failure.reason;
	}
}

const reviewerLoad: Feature = {
	id: 'reviewer-load',
	description: t('feature_reviewerLoad'),
	include: [pageDetect.isPRConversation],
	requiresToken: true,
	init(signal) {
		const cache = new Map<string, Promise<number>>();
		observe(dividers, (elements) => elements.forEach(addHeader), {signal});
		observe(
			usernames,
			(elements) => {
				addCounts(elements, cache).catch((error: unknown) => {
					console.error('polished-github: reviewer-load failed', error);
				});
			},
			{signal},
		);
	},
};

export default reviewerLoad;
