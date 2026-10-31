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

export type ReviewStatus = 'requested' | 're-review' | 'approved' | 'approved-outdated' | 'changes-requested';

const badgeClass = 'github-power-review-status' as const;

const muted = 'var(--fgColor-muted, #59636e)';

const badges: Record<ReviewStatus, {text: string; color: string; dot?: string; title: string}> = {
	requested: {text: 'Review requested', color: 'var(--fgColor-attention, #9a6700)', title: 'Your review is requested'},
	're-review': {
		text: 'Re-review',
		color: 'var(--fgColor-accent, #0969da)',
		title: 'Your review was requested again, or commits were pushed since you requested changes',
	},
	approved: {text: 'Approved', color: 'var(--fgColor-success, #1a7f37)', title: 'You approved the latest commit'},
	'approved-outdated': {
		text: 'Approved · new commits',
		color: muted,
		dot: 'var(--fgColor-success, #1a7f37)',
		title: 'Your approval still stands, but commits were pushed since, maybe only a rebase',
	},
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

	// A push after an approval is often only a rebase: the approval still stands, so it is not a call to action
	const outdated = review.commit?.oid !== pr.headRefOid;
	if (review.state === 'APPROVED') {
		return outdated ? 'approved-outdated' : 'approved';
	}

	if (outdated) {
		return 're-review';
	}

	return review.state === 'CHANGES_REQUESTED' ? 'changes-requested' : undefined;
}

function addBadge(title: HTMLElement, status: ReviewStatus, placement: BadgePlacement): void {
	const {text, color, dot = color, title: tooltip} = badges[status];
	addPullRequestBadge(
		title,
		badgeClass,
		<span
			className={badgeClass}
			title={tooltip}
			style={{display: 'inline-flex', alignItems: 'center', gap: '5px', color, fontWeight: '600', whiteSpace: 'nowrap'}}
		>
			<span style={{width: '7px', height: '7px', borderRadius: '50%', background: dot}} />
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
