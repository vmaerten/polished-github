import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {mutedColor as muted} from '../github-helpers/colors.js';
import {
	addPullRequestBadge,
	type BadgeOptions,
	forEachListedPullRequest,
	type PullRequestState,
	removePullRequestBadge,
} from '../github-helpers/pr-list.js';
import {t} from '../helpers/i18n.js';
import {getOptions} from '../options-storage.js';

export type ReviewInfo = {
	state: PullRequestState;
	viewerDidAuthor: boolean;
	headRefOid: string;
	viewerLatestReviewRequest: {id: string} | null;
	viewerLatestReview: {state: string; commit: {oid: string} | null} | null;
};

export type ReviewStatus = 'requested' | 're-review' | 'approved-outdated' | 'changes-requested';

const badgeClass = 'polished-github-review-status' as const;

const badges: Record<ReviewStatus, {text: string; color: string; dot?: string; title: string}> = {
	requested: {text: 'Review requested', color: 'var(--fgColor-attention, #9a6700)', title: 'Your review is requested'},
	're-review': {
		text: 'Re-review',
		color: 'var(--fgColor-accent, #0969da)',
		title: 'Your review was requested again, or commits were pushed since you requested changes',
	},
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
		// Nothing to do, and GitHub's own review decision often says it already
		return outdated ? 'approved-outdated' : undefined;
	}

	if (outdated) {
		return 're-review';
	}

	return review.state === 'CHANGES_REQUESTED' ? 'changes-requested' : undefined;
}

function addBadge(title: HTMLElement, status: ReviewStatus, options: BadgeOptions): void {
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
		options,
	);
}

const reviewStatus: Feature = {
	id: 'review-status',
	description: t('feature_reviewStatus'),
	include: [pageDetect.isRepoPRList],
	requiresToken: true,
	async init(signal) {
		const options = await getOptions();
		// Fetched again on every visit: a status goes stale as soon as you review or someone pushes
		forEachListedPullRequest<ReviewInfo>(
			'state viewerDidAuthor headRefOid viewerLatestReviewRequest {id} viewerLatestReview {state commit {oid}}',
			(title, pr) => {
				const status = getReviewStatus(pr);
				if (status) {
					addBadge(title, status, options);
				} else {
					removePullRequestBadge(title, badgeClass);
				}
			},
			{signal},
		);
	},
};

export default reviewStatus;
