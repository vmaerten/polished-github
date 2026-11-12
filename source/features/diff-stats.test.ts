import {afterEach, beforeEach, expect, test, vi} from 'vitest';

import {v4} from '../github-helpers/api.js';
import diffStats, {getSizeLabel} from './diff-stats.js';

vi.mock('../github-helpers/api.js', () => ({v4: vi.fn<typeof v4>()}));

const v4Mock = vi.mocked(v4);

vi.stubGlobal('chrome', {
	runtime: {id: 'extension'},
	storage: {
		sync: {
			get: async (defaults: object) => ({
				...defaults,
				diffStats: {showChangedFiles: false, showSizeLabel: false, sizeThresholds: [10, 50, 250, 1000]},
			}),
		},
	},
});

function row(number: number): string {
	return `<li><div><h3><a href="/o/r/pull/${number}">PR ${number}</a></h3></div></li>`;
}

function badges(): string[] {
	return [...document.querySelectorAll('.polished-github-diff-stats')].map((badge) => badge.textContent);
}

// Every init observes the list until its navigation ends: end them all, or they would fetch the next test's rows too
const navigations: AbortController[] = [];
function navigate(): AbortSignal {
	const navigation = new AbortController();
	navigations.push(navigation);
	return navigation.signal;
}

afterEach(() => {
	for (const navigation of navigations.splice(0)) {
		navigation.abort();
	}

	v4Mock.mockClear();
});

beforeEach(() => {
	history.pushState({}, '', '/o/r/pulls');
	document.body.innerHTML = `<ul role="list">${row(1)}${row(2)}</ul>`;
	v4Mock.mockImplementation(async (query) => {
		const numbers = [...query.matchAll(/pullRequest\(number: (\d+)\)/g)].map((match) => Number(match[1]));
		return {
			repository: Object.fromEntries(
				numbers.map((n) => [`pr${n}`, {additions: n * 10, deletions: n, changedFiles: 1}]),
			),
		};
	});
});

test('fetches each PR once, in batches, and never adds a badge twice', async () => {
	await diffStats.init(navigate());
	await vi.waitFor(() => expect(badges()).toEqual(['+10 −1', '+20 −2']));
	expect(v4Mock).toHaveBeenCalledOnce();

	// GitHub renders more rows: only those are fetched
	document.querySelector('ul')!.insertAdjacentHTML('beforeend', row(3));
	await vi.waitFor(() => expect(badges()).toHaveLength(3));
	expect(v4Mock).toHaveBeenCalledTimes(2);
	expect(v4Mock.mock.lastCall?.[0]).not.toContain('number: 1)');

	// Next in-app navigation back to the same list: served from the cache
	await diffStats.init(navigate());
	await new Promise((resolve) => setTimeout(resolve));
	expect(badges()).toEqual(['+10 −1', '+20 −2', '+30 −3']);
	expect(v4Mock).toHaveBeenCalledTimes(2);
});

test('fetches each repository of the global list on its own, so one the token cannot read leaves only its rows bare', async () => {
	history.pushState({}, '', '/pulls/involves');
	document.body.innerHTML = `<ul role="list">
		<li><div><h3><a href="/a/one/pull/4">PR</a></h3></div></li>
		<li><div><h3><a href="/b/private/pull/5">PR</a></h3></div></li>
		<li><div><h3><a href="/a/one/pull/6">PR</a></h3></div></li>
	</ul>`;
	const failure = vi.spyOn(console, 'error').mockImplementation(() => {});
	const defaultImplementation = v4Mock.getMockImplementation()!;
	v4Mock.mockImplementation(async (query, variables) => {
		if (variables?.owner === 'b') {
			throw new Error('Could not resolve to a Repository');
		}

		return defaultImplementation(query, variables);
	});

	expect(diffStats.include!.some((matches) => matches())).toBe(true);
	await diffStats.init(navigate());
	await vi.waitFor(() => expect(failure).toHaveBeenCalledOnce());

	expect(v4Mock.mock.calls.map(([, variables]) => variables)).toEqual([
		{owner: 'a', name: 'one'},
		{owner: 'b', name: 'private'},
	]);
	expect(v4Mock.mock.calls[0][0]).toMatch(/number: 4\).*number: 6\)/);
	expect(badges()).toEqual(['+40 −4', '+60 −6']);
	failure.mockRestore();
});

test('sizes PRs by changed lines', () => {
	const thresholds: [number, number, number, number] = [10, 50, 250, 1000];
	expect(getSizeLabel(10, thresholds)).toBe('XS');
	expect(getSizeLabel(11, thresholds)).toBe('S');
	expect(getSizeLabel(1000, thresholds)).toBe('L');
	expect(getSizeLabel(1001, thresholds)).toBe('XL');
});
