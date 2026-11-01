import {expect, test, vi} from 'vitest';
import {getOptions} from './options-storage.js';

function stubStored(stored: object): void {
	vi.stubGlobal('chrome', {storage: {sync: {get: async (defaults: object) => ({...defaults, ...stored})}}});
}

test('falls back to the defaults when a number field was emptied', async () => {
	stubStored({
		stale: {days: null, includeDrafts: true},
		diffStats: {showChangedFiles: false, sizeThresholds: [10, null, 250, 1000]},
	});
	const {stale, diffStats} = await getOptions();
	expect(stale).toEqual({days: 7, includeDrafts: true});
	expect(diffStats).toEqual({showChangedFiles: false, showSizeLabel: true, sizeThresholds: [10, 50, 250, 1000]});
});

test('rejects size thresholds that are out of order', async () => {
	stubStored({diffStats: {showChangedFiles: true, showSizeLabel: true, sizeThresholds: [100, 50, 250, 1000]}});
	expect((await getOptions()).diffStats.sizeThresholds).toEqual([10, 50, 250, 1000]);
});
