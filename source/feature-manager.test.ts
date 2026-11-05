import {describe, expect, test, vi} from 'vitest';

import {type Feature, shouldRun, start} from './feature-manager.js';

vi.mock('./options-storage.js', async (importOriginal) => ({
	...(await importOriginal()),
	getOptions: async () => ({disabledFeatures: [], enabledFeatures: []}),
	getToken: async () => 'token',
}));

const yes = (): boolean => true;
const no = (): boolean => false;

function feature(overrides: Partial<Feature> = {}): Feature {
	return {id: 'demo', description: '', init() {}, ...overrides};
}

const context = {toggles: {disabledFeatures: [], enabledFeatures: []}, hasToken: true};

describe('shouldRun', () => {
	test('runs everywhere by default', () => {
		expect(shouldRun(feature(), context)).toBe(true);
	});

	test('skips features the user disabled', () => {
		expect(shouldRun(feature(), {...context, toggles: {disabledFeatures: ['demo'], enabledFeatures: []}})).toBe(false);
	});

	test('skips token features until a token is set', () => {
		expect(shouldRun(feature({requiresToken: true}), {...context, hasToken: false})).toBe(false);
		expect(shouldRun(feature({requiresToken: true}), context)).toBe(true);
	});

	test('runs when any include matches', () => {
		expect(shouldRun(feature({include: [no, yes]}), context)).toBe(true);
		expect(shouldRun(feature({include: [no]}), context)).toBe(false);
	});
});

test('stops once the extension is updated or reloaded under the open tab', async () => {
	const runtime: {id?: string} = {id: 'extension'};
	vi.stubGlobal('chrome', {runtime});
	const init = vi.fn<Feature['init']>();
	await start([feature({init})]);
	expect(init).toHaveBeenCalledOnce();

	document.dispatchEvent(new Event('turbo:render'));
	expect(init).toHaveBeenCalledTimes(2);
	const signal = init.mock.lastCall![0];

	delete runtime.id;
	document.dispatchEvent(new Event('turbo:render'));
	expect(signal.aborted).toBe(true);
	runtime.id = 'extension';
	document.dispatchEvent(new Event('soft-nav:react-done'));
	expect(init).toHaveBeenCalledTimes(2);
	vi.unstubAllGlobals();
});
