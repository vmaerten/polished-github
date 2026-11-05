import {expect, test} from 'vitest';

import {getUnresolvedCount, type ThreadsInfo} from './unresolved-comments.js';

function pr(resolved: boolean[], changes: Partial<ThreadsInfo> = {}): ThreadsInfo {
	return {
		state: 'OPEN',
		reviewThreads: {nodes: resolved.map((isResolved) => ({isResolved})), pageInfo: {hasNextPage: false}},
		...changes,
	};
}

test('counts the unresolved threads of open PRs only', () => {
	expect(getUnresolvedCount(pr([false, true, false]))).toBe('2');
	expect(getUnresolvedCount(pr([true]))).toBeUndefined();
	expect(getUnresolvedCount(pr([false], {state: 'MERGED'}))).toBeUndefined();
});

test('marks the count as partial past the first page of threads', () => {
	const threads = pr([false, true]).reviewThreads;
	expect(getUnresolvedCount(pr([], {reviewThreads: {...threads, pageInfo: {hasNextPage: true}}}))).toBe('1+');
});
