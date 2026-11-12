import {expect, test} from 'vitest';
import {newFeatures} from './new-features.js';

const ids = ['diff-stats', 'quick-approvals', 'next-feature'];

test('flags the features missing from the seen list', () => {
	expect(newFeatures(ids, ['diff-stats', 'quick-approvals'], true)).toEqual(new Set(['next-feature']));
});

test('flags the features added since 0.3 for a user who has no seen list yet, and none on a fresh install', () => {
	expect(newFeatures(ids, undefined, true)).toEqual(new Set(['quick-approvals', 'next-feature']));
	expect(newFeatures(ids, undefined, false)).toEqual(new Set());
});
