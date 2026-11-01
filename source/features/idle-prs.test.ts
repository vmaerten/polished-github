import {expect, test} from 'vitest';

import {type ActivityInfo, getIdleDays} from './idle-prs.js';

const now = Date.parse('2026-10-30T12:00:00Z');
const settings = {days: 7, includeDrafts: false};

function pr(changes: Partial<ActivityInfo>): ActivityInfo {
	return {state: 'OPEN', isDraft: false, updatedAt: '2026-10-23T12:00:00Z', ...changes};
}

test('flags open PRs idle for at least the configured days', () => {
	expect(getIdleDays(pr({}), settings, now)).toBe(7);
	expect(getIdleDays(pr({updatedAt: '2026-10-23T12:00:01Z'}), settings, now)).toBeUndefined();
	expect(getIdleDays(pr({state: 'MERGED'}), settings, now)).toBeUndefined();
});

test('skips drafts unless asked', () => {
	expect(getIdleDays(pr({isDraft: true}), settings, now)).toBeUndefined();
	expect(getIdleDays(pr({isDraft: true}), {...settings, includeDrafts: true}, now)).toBe(7);
});
