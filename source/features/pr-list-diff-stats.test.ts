import {beforeEach, expect, test, vi} from 'vitest';

import {v4} from '../github-helpers/api.js';
import prListDiffStats from './pr-list-diff-stats.js';

vi.mock('../github-helpers/api.js', () => ({v4: vi.fn<typeof v4>()}));

const v4Mock = vi.mocked(v4);

function row(number: number): string {
	return `<li><div><h3><a href="/o/r/pull/${number}">PR ${number}</a></h3></div></li>`;
}

function badges(): string[] {
	return [...document.querySelectorAll('.github-power-diff-stats')].map((badge) => badge.textContent);
}

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
	await prListDiffStats.init(new AbortController().signal);
	await vi.waitFor(() => expect(badges()).toEqual(['+10 −1', '+20 −2']));
	expect(v4Mock).toHaveBeenCalledOnce();

	// GitHub renders more rows: only those are fetched
	document.querySelector('ul')!.insertAdjacentHTML('beforeend', row(3));
	await vi.waitFor(() => expect(badges()).toHaveLength(3));
	expect(v4Mock).toHaveBeenCalledTimes(2);
	expect(v4Mock.mock.lastCall?.[0]).not.toContain('number: 1)');

	// Next in-app navigation back to the same list: served from the cache
	await prListDiffStats.init(new AbortController().signal);
	await new Promise((resolve) => setTimeout(resolve));
	expect(badges()).toEqual(['+10 −1', '+20 −2', '+30 −3']);
	expect(v4Mock).toHaveBeenCalledTimes(2);
});
