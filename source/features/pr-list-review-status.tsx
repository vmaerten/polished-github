import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {addPullRequestBadge, forEachListedPullRequest} from '../github-helpers/pr-list.js';
import {type BadgePlacement, getOptions} from '../options-storage.js';

export type ReviewInfo = {
	state: 'OPEN' | 'CLOSED' | 'MERGED';
	viewerDidAuthor: boolean;
	headRefOid: string;
	viewerLatestReviewRequest: {id: string} | null;
	viewerLatestReview: {state: string; commit: {oid: string} | null} | null;
};

export type ReviewStatus = 'requested' | 're-review' | 'approved' | 'changes-requested';

const badgeClass = 'github-power-review-status' as const;

const badges: Record<ReviewStatus, {text: string; color: string; title: string}> = {
	requested: {text: 'Review requested', color: 'var(--fgColor-attention, #9a6700)', title: 'Your review is requested'},
	're-review': {
		text: 'Re-review',
		color: 'var(--fgColor-accent, #0969da)',
		title: 'New commits or a new request since your review',
	},
	approved: {text: 'Approved', color: 'var(--fgColor-success, #1a7f37)', title: 'You approved the latest commit'},
	'changes-requested': {
		text: 'Changes requested',
		color: 'var(--fgColor-danger, #d1242f)',
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

function addBadge(title: HTMLElement, status: ReviewStatus, placement: BadgePlacement): void {
	const {text, color, title: tooltip} = badges[status];
	addPullRequestBadge(
		title,
		badgeClass,
		<span
			className={badgeClass}
			title={tooltip}
			style={{display: 'inline-flex', alignItems: 'center', gap: '5px', color, fontWeight: '600', whiteSpace: 'nowrap'}}
		>
			<span style={{width: '7px', height: '7px', borderRadius: '50%', background: color}} />
			{text}
		</span>,
		placement,
	);
}

const prListReviewStatus: Feature = {
	id: 'pr-list-review-status',
	description:
		'Shows where each PR stands for you in the repository pull request list: review requested, re-review, approved or changes requested.',
	include: [pageDetect.isRepoPRList],
	requiresToken: true,
	async init(signal) {
		const {prListBadges} = await getOptions();
		// Fetched again on every visit: a status goes stale as soon as you review or someone pushes
		forEachListedPullRequest<ReviewInfo>(
			'state viewerDidAuthor headRefOid viewerLatestReviewRequest {id} viewerLatestReview {state commit {oid}}',
			(title, pr) => {
				const status = getReviewStatus(pr);
				if (status) {
					addBadge(title, status, prListBadges);
				}
			},
			{signal, cache: new Map()},
		);
	},
};

export default prListReviewStatus;
