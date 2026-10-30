import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {v4} from '../github-helpers/api.js';
import {observe} from '../helpers/observe.js';

export type ReviewInfo = {
	state: 'OPEN' | 'CLOSED' | 'MERGED';
	viewerDidAuthor: boolean;
	headRefOid: string;
	viewerLatestReviewRequest: {id: string} | null;
	viewerLatestReview: {state: string; commit: {oid: string} | null} | null;
};

export type ReviewStatus = 'requested' | 're-review' | 'approved' | 'changes-requested';

const titleLinks = 'ul[role="list"] > li h3 a[href*="/pull/"]';
const badgeClass = 'github-power-review-status';

const badges: Record<ReviewStatus, {text: string; label: string; title: string}> = {
	requested: {text: 'Review requested', label: 'Label--attention', title: 'Your review is requested'},
	're-review': {text: 'Re-review', label: 'Label--accent', title: 'New commits or a new request since your review'},
	approved: {text: 'Approved', label: 'Label--success', title: 'You approved the latest commit'},
	'changes-requested': {
		text: 'Changes requested',
		label: 'Label--danger',
		title: 'You requested changes on the latest commit',
	},
};

export function getReviewStatus(pr: ReviewInfo): ReviewStatus | undefined {
	if (pr.state !== 'OPEN' || pr.viewerDidAuthor) {
		return undefined;
	}

	const review = pr.viewerLatestReview?.state === 'PENDING' ? null : pr.viewerLatestReview;
	// GitHub drops the request once the viewer reviews, so a request next to a review was made again afterwards
	if (pr.viewerLatestReviewRequest) {
		return review ? 're-review' : 'requested';
	}

	if (!review) {
		return undefined;
	}

	if (review.commit?.oid !== pr.headRefOid) {
		return 're-review';
	}

	if (review.state === 'APPROVED') {
		return 'approved';
	}

	return review.state === 'CHANGES_REQUESTED' ? 'changes-requested' : undefined;
}

function getNumber(link: HTMLAnchorElement): number | undefined {
	const match = /\/pull\/(\d+)\/?$/.exec(link.pathname);
	return match ? Number(match[1]) : undefined;
}

async function fetchReviewInfo(owner: string, name: string, numbers: number[]): Promise<Record<string, ReviewInfo>> {
	const fields = numbers.map(
		(number) =>
			`pr${number}: pullRequest(number: ${number}) {state viewerDidAuthor headRefOid viewerLatestReviewRequest {id} viewerLatestReview {state commit {oid}}}`,
	);
	const {repository} = await v4<{repository: Record<string, ReviewInfo>}>(
		`query($owner: String!, $name: String!) {repository(owner: $owner, name: $name) {${fields.join(' ')}}}`,
		{owner, name},
	);
	return repository;
}

function addBadge(link: HTMLAnchorElement, status: ReviewStatus): void {
	const title = link.closest('h3');
	const container = title?.parentElement;
	if (!title || !container || container.querySelector(`:scope > .${badgeClass}`)) {
		return;
	}

	const {text, label, title: tooltip} = badges[status];
	// After the diff stats when they are there, so the order doesn't depend on which request answers first
	const anchor = container.querySelector(':scope > .github-power-diff-stats') ?? title;
	anchor.after(
		<span className={`Label ${label} ${badgeClass}`} title={tooltip} style={{marginLeft: '8px'}}>
			{text}
		</span>,
	);
}

async function addBadges(links: HTMLAnchorElement[], fetched: Map<number, ReviewInfo>): Promise<void> {
	const {owner, name} = pageDetect.utils.getRepositoryInfo()!;
	const numbered = links.flatMap((link) => {
		const number = getNumber(link);
		return number === undefined ? [] : [{link, number}];
	});

	const missing = [...new Set(numbered.map(({number}) => number))].filter((number) => !fetched.has(number));
	if (missing.length > 0) {
		const info = await fetchReviewInfo(owner, name, missing);
		for (const number of missing) {
			fetched.set(number, info[`pr${number}`]);
		}
	}

	for (const {link, number} of numbered) {
		const status = getReviewStatus(fetched.get(number)!);
		if (status) {
			addBadge(link, status);
		}
	}
}

const prListReviewStatus: Feature = {
	id: 'pr-list-review-status',
	description:
		'Shows where each PR stands for you in the repository pull request list: review requested, re-review, approved or changes requested.',
	include: [pageDetect.isRepoPRList],
	requiresToken: true,
	init(signal) {
		// Fetched again on every visit: a status goes stale as soon as you review or someone pushes
		const fetched = new Map<number, ReviewInfo>();
		observe(
			titleLinks,
			(elements) => {
				const links = elements.filter((element) => element instanceof HTMLAnchorElement);
				addBadges(links, fetched).catch((error: unknown) => {
					console.error('github-power: pr-list-review-status failed', error);
				});
			},
			{signal},
		);
	},
};

export default prListReviewStatus;
