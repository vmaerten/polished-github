import {expect, test, vi} from 'vitest';

import {v4} from '../github-helpers/api.js';
import prListReviewStatus, {getReviewStatus, type ReviewInfo} from './pr-list-review-status.js';

vi.mock('../github-helpers/api.js', () => ({v4: vi.fn<typeof v4>()}));

vi.stubGlobal('chrome', {storage: {sync: {get: async (defaults: object) => defaults}}});

const head = 'abc';

function pr(changes: Partial<ReviewInfo>): ReviewInfo {
	return {
		state: 'OPEN',
		viewerDidAuthor: false,
		headRefOid: head,
		viewerLatestReviewRequest: null,
		viewerLatestReview: null,
		...changes,
	};
}

const request = {id: 'request'};

test('derives the viewer review status', () => {
	expect(getReviewStatus(pr({}))).toBeUndefined();
	expect(getReviewStatus(pr({viewerLatestReviewRequest: request}))).toBe('requested');
	expect(getReviewStatus(pr({viewerLatestReview: {state: 'APPROVED', commit: {oid: head}}}))).toBeUndefined();
	expect(getReviewStatus(pr({viewerLatestReview: {state: 'CHANGES_REQUESTED', commit: {oid: head}}}))).toBe(
		'changes-requested',
	);
	expect(getReviewStatus(pr({viewerLatestReview: {state: 'COMMENTED', commit: {oid: head}}}))).toBeUndefined();
});

test('asks for a re-review after a new request, or new commits on a non-approving review', () => {
	expect(getReviewStatus(pr({viewerLatestReview: {state: 'CHANGES_REQUESTED', commit: {oid: 'old'}}}))).toBe(
		're-review',
	);
	// A push after an approval may be a mere rebase: the approval stands
	expect(getReviewStatus(pr({viewerLatestReview: {state: 'APPROVED', commit: {oid: 'old'}}}))).toBe(
		'approved-outdated',
	);
	expect(
		getReviewStatus(
			pr({viewerLatestReviewRequest: request, viewerLatestReview: {state: 'APPROVED', commit: {oid: head}}}),
		),
	).toBe('re-review');
	// A review still being written is not a review yet
	expect(
		getReviewStatus(
			pr({viewerLatestReviewRequest: request, viewerLatestReview: {state: 'PENDING', commit: {oid: head}}}),
		),
	).toBe('requested');
});

test('ignores closed PRs and the viewer’s own', () => {
	expect(getReviewStatus(pr({state: 'MERGED', viewerLatestReviewRequest: request}))).toBeUndefined();
	// Replying to a review thread on your own PR creates a review too
	expect(
		getReviewStatus(pr({viewerDidAuthor: true, viewerLatestReview: {state: 'COMMENTED', commit: {oid: 'old'}}})),
	).toBeUndefined();
});

test('adds one badge per PR, fetched again on every visit', async () => {
	history.pushState({}, '', '/o/r/pulls');
	document.body.innerHTML = `<ul role="list"><li><div><h3><a href="/o/r/pull/1">PR 1</a></h3></div></li></ul>`;
	vi.mocked(v4).mockResolvedValue({repository: {pr1: pr({viewerLatestReviewRequest: request})}});

	await prListReviewStatus.init(new AbortController().signal);
	await vi.waitFor(() => expect(document.querySelector('.github-power-review-status')).not.toBeNull());
	await prListReviewStatus.init(new AbortController().signal);
	await new Promise((resolve) => setTimeout(resolve));

	expect(document.querySelectorAll('.github-power-review-status')).toHaveLength(1);
	expect(v4).toHaveBeenCalledTimes(2);
});
