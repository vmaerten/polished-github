import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {addTitleBadge, forEachListedPullRequest} from '../github-helpers/pr-list.js';

export type ReviewInfo = {
	state: 'OPEN' | 'CLOSED' | 'MERGED';
	viewerDidAuthor: boolean;
	headRefOid: string;
	viewerLatestReviewRequest: {id: string} | null;
	viewerLatestReview: {state: string; commit: {oid: string} | null} | null;
};

export type ReviewStatus = 'requested' | 're-review' | 'approved' | 'changes-requested';

const badgeClass = 'github-power-review-status' as const;

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

function addBadge(title: HTMLElement, status: ReviewStatus): void {
	const {text, label, title: tooltip} = badges[status];
	addTitleBadge(
		title,
		badgeClass,
		<span className={`Label ${label} ${badgeClass}`} title={tooltip} style={{marginLeft: '8px'}}>
			{text}
		</span>,
	);
}

const prListReviewStatus: Feature = {
	id: 'pr-list-review-status',
	description:
		'Shows where each PR stands for you in the repository pull request list: review requested, re-review, approved or changes requested.',
	include: [pageDetect.isRepoPRList],
	requiresToken: true,
	init(signal) {
		// Fetched again on every visit: a status goes stale as soon as you review or someone pushes
		forEachListedPullRequest<ReviewInfo>(
			'state viewerDidAuthor headRefOid viewerLatestReviewRequest {id} viewerLatestReview {state commit {oid}}',
			(title, pr) => {
				const status = getReviewStatus(pr);
				if (status) {
					addBadge(title, status);
				}
			},
			{signal, cache: new Map()},
		);
	},
};

export default prListReviewStatus;
