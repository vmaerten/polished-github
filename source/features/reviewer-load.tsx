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

const cacheDuration = 5 * 60 * 1000;
const storageKey = 'reviewerLoadCounts';
type StoredCounts = Record<string, {time: number; count: number}>;

function cacheKey(owner: string, reviewer: string): string {
	return `${owner} ${reviewer}`;
}

async function readStoredCounts(): Promise<StoredCounts> {
	const {[storageKey]: stored} = (await chrome.storage.local.get(storageKey)) as {[storageKey]?: StoredCounts};
	const now = Date.now();
	return Object.fromEntries(Object.entries(stored ?? {}).filter(([, {time}]) => now - time <= cacheDuration));
}

async function storeCounts(counts: Map<string, number>): Promise<void> {
	const stored = await readStoredCounts();
	const time = Date.now();
	for (const [key, count] of counts) {
		stored[key] = {time, count};
	}

	await chrome.storage.local.set({[storageKey]: stored});
}

// Stored rather than kept in memory, so a reload or a new tab on the organization shows the counts at once
async function loadCounts(reviewers: string[], owner: string): Promise<number[]> {
	const stored = await readStoredCounts();
	const missing = reviewers.filter((reviewer) => !(cacheKey(owner, reviewer) in stored));
	const fetched = new Map<string, number>();
	if (missing.length > 0) {
		const counts = await fetchPendingCounts(missing, owner);
		for (const [index, reviewer] of missing.entries()) {
			fetched.set(cacheKey(owner, reviewer), counts[index]);
		}

		storeCounts(fetched).catch((error: unknown) => {
			console.error('polished-github: reviewer-load could not store the counts', error);
		});
	}

	return reviewers.map((reviewer) => {
		const key = cacheKey(owner, reviewer);
		return stored[key]?.count ?? fetched.get(key)!;
	});
}

// Shared by the rows of every page in this tab, so a count is never requested twice at once
const pending = new Map<string, {time: number; count: Promise<number>}>();

function getCounts(reviewers: string[], owner: string): Map<string, Promise<number>> {
	const now = Date.now();
	const missing = reviewers.filter((reviewer) => {
		const cached = pending.get(cacheKey(owner, reviewer));
		return !cached || now - cached.time > cacheDuration;
	});
	if (missing.length > 0) {
		const loaded = loadCounts(missing, owner);
		for (const [index, reviewer] of missing.entries()) {
			const key = cacheKey(owner, reviewer);
			const count = loaded.then((counts) => counts[index]);
			pending.set(key, {time: now, count});
			count.catch(() => pending.delete(key));
		}
	}

	return new Map(reviewers.map((reviewer) => [reviewer, pending.get(cacheKey(owner, reviewer))!.count]));
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

async function addCounts(elements: Element[]): Promise<void> {
	const {owner} = pageDetect.utils.getRepositoryInfo()!;
	const rows = elements.flatMap((element) => {
		const reviewer = element.textContent.trim();
		const counter = reviewer ? reserveCounter(element) : undefined;
		return counter ? [{counter, reviewer}] : [];
	});

	const counts = getCounts([...new Set(rows.map(({reviewer}) => reviewer))], owner);
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
		observe(dividers, (elements) => elements.forEach(addHeader), {signal});
		observe(
			usernames,
			(elements) => {
				addCounts(elements).catch((error: unknown) => {
					console.error('polished-github: reviewer-load failed', error);
				});
			},
			{signal},
		);
	},
};

export default reviewerLoad;
