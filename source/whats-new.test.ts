import {expect, test} from 'vitest';
import {shouldAnnounce} from './whats-new.js';

test('announces a minor or major release, not a patch', () => {
	expect(shouldAnnounce('0.3.1', '0.4.0', true)).toBe(true);
	expect(shouldAnnounce('0.4.2', '1.0.0', true)).toBe(true);
	expect(shouldAnnounce('0.4.0', '0.4.1', true)).toBe(false);
});

test('tells an update from a version that saved none from a fresh install by the stored data', () => {
	expect(shouldAnnounce(undefined, '0.4.0', true)).toBe(true);
	expect(shouldAnnounce(undefined, '0.4.0', false)).toBe(false);
});
