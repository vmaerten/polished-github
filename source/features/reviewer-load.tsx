import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {v4} from '../github-helpers/api.js';
import {observe} from '../helpers/observe.js';

// The picker loads its rows when opened and again when filtering
const usernames = '#reviewers-select-menu .select-menu-item .js-username';
const loadClass = 'github-power-reviewer-load';

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

function addCount(username: Element, count: number): void {
	const heading = username.closest('.select-menu-item-heading');
	if (!heading || heading.querySelector(`.${loadClass}`)) {
		return;
	}

	heading.append(
		<span
			className={`${loadClass} color-fg-muted text-small`}
			title="Open PRs in this account waiting for their review"
			style={{marginLeft: '6px'}}
		>
			· {count} pending
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
		addCount(element, counts.get(reviewer)!);
	}
}

const reviewerLoad: Feature = {
	id: 'reviewer-load',
	description: 'Shows how many reviews each person already has pending in the reviewers picker of a PR.',
	include: [pageDetect.isPRConversation],
	requiresToken: true,
	init(signal) {
		const counts = new Map<string, number>();
		observe(
			usernames,
			(elements) => {
				addCounts(elements, counts).catch((error: unknown) => {
					console.error('github-power: reviewer-load failed', error);
				});
			},
			{signal},
		);
	},
};

export default reviewerLoad;
