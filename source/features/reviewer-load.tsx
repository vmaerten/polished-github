import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {v4} from '../github-helpers/api.js';
import {observe} from '../helpers/observe.js';

// The picker loads its rows when opened and again when filtering
const usernames = '#reviewers-select-menu .select-menu-item .js-username';
const dividers = '#reviewers-select-menu .select-menu-divider';
const loadClass = 'supercharged-github-reviewer-load';
const headerClass = 'supercharged-github-reviewer-load-header';

// Up to 2 pending reviews is a normal load
const loadLevels = [
	{max: 2, color: 'var(--fgColor-muted, #59636e)', background: 'var(--bgColor-neutral-muted, #818b981f)'},
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

function addCount(username: Element, count: number, owner: string): void {
	const item = username.closest<HTMLElement>('.select-menu-item');
	if (!item || item.querySelector(`.${loadClass}`)) {
		return;
	}

	const {color, background} = loadLevels.find(({max}) => count <= max)!;
	const description = `${count} open ${count === 1 ? 'PR' : 'PRs'} waiting for their review in ${owner}`;
	// The item is a block layout: an absolute counter keeps it in a right-hand column without reflowing the name
	item.style.position = 'relative';
	item.querySelector<HTMLElement>('.select-menu-item-text')?.style.setProperty('padding-right', '36px');
	item.append(
		<span
			className={loadClass}
			title={description}
			aria-label={description}
			style={{
				position: 'absolute',
				top: '50%',
				right: '16px',
				transform: 'translateY(-50%)',
				minWidth: '22px',
				boxSizing: 'border-box',
				padding: '0 7px',
				borderRadius: '999px',
				fontSize: '12px',
				fontWeight: '600',
				lineHeight: '20px',
				textAlign: 'center',
				color,
				background,
			}}
		>
			{count}
		</span>,
	);
}

function addHeader(divider: Element): void {
	if (divider.querySelector(`.${headerClass}`)) {
		return;
	}

	divider.append(
		<span className={headerClass} style={{float: 'right', fontWeight: '400', color: 'var(--fgColor-muted, #59636e)'}}>
			Pending reviews
		</span>,
	);
}

async function addCounts(elements: Element[], counts: Map<string, number>): Promise<void> {
	const {owner} = pageDetect.utils.getRepositoryInfo()!;
	const rows = elements.flatMap((element) => {
		const reviewer = element.textContent.trim();
		return reviewer ? [{element, reviewer}] : [];
	});

	const missing = [...new Set(rows.map(({reviewer}) => reviewer))].filter((reviewer) => !counts.has(reviewer));
	if (missing.length > 0) {
		const fetched = await fetchPendingCounts(missing, owner);
		for (const [index, reviewer] of missing.entries()) {
			counts.set(reviewer, fetched[index]);
		}
	}

	for (const {element, reviewer} of rows) {
		addCount(element, counts.get(reviewer)!, owner);
	}
}

const reviewerLoad: Feature = {
	id: 'reviewer-load',
	description: 'Shows how many reviews each person already has pending in the reviewers picker of a PR.',
	include: [pageDetect.isPRConversation],
	requiresToken: true,
	init(signal) {
		const counts = new Map<string, number>();
		observe(dividers, (elements) => elements.forEach(addHeader), {signal});
		observe(
			usernames,
			(elements) => {
				addCounts(elements, counts).catch((error: unknown) => {
					console.error('supercharged-github: reviewer-load failed', error);
				});
			},
			{signal},
		);
	},
};

export default reviewerLoad;
