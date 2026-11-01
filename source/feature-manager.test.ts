import {describe, expect, test} from 'vitest';

import {type Feature, shouldRun} from './feature-manager.js';

const yes = (): boolean => true;
const no = (): boolean => false;

function feature(overrides: Partial<Feature> = {}): Feature {
	return {id: 'demo', description: '', init() {}, ...overrides};
}

const context = {disabled: new Set<string>(), hasToken: true};

describe('shouldRun', () => {
	test('runs everywhere by default', () => {
		expect(shouldRun(feature(), context)).toBe(true);
	});

	test('skips features the user disabled', () => {
		expect(shouldRun(feature(), {...context, disabled: new Set(['demo'])})).toBe(false);
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
