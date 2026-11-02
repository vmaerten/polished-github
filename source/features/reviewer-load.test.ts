import {expect, test, vi} from 'vitest';

import {v4} from '../github-helpers/api.js';
import reviewerLoad from './reviewer-load.js';

vi.mock('../github-helpers/api.js', () => ({v4: vi.fn<typeof v4>()}));

const v4Mock = vi.mocked(v4);

// Without the pulse: happy-dom leaves the finished promise of a canceled animation unhandled, unlike browsers
vi.stubGlobal('matchMedia', () => ({matches: true}));

function item(login: string): string {
	return `<label class="select-menu-item"><div class="select-menu-item-text"><span class="select-menu-item-heading"><span class="js-username">${login}</span><span class="description">Name</span></span></div></label>`;
}

function counts(): string[] {
	return [...document.querySelectorAll('.polished-github-reviewer-load')].map((count) => count.textContent);
}

test('shows each reviewer’s pending reviews in the owner’s repositories, fetching each once for a few minutes', async () => {
	history.pushState({}, '', '/o/r/pull/1');
	document.body.innerHTML = `<details id="reviewers-select-menu"><div class="select-menu-divider">Suggestions</div><div class="list">${item('ada')}${item('org/core')}</div></details>`;
	v4Mock.mockImplementation(async (_query, variables) =>
		Object.fromEntries(Object.keys(variables!).map((key, index) => [`r${key.slice(1)}`, {issueCount: index + 3}])),
	);

	const page = new AbortController();
	await reviewerLoad.init(page.signal);
	await vi.waitFor(() => expect(counts()).toEqual(['3', '4']));
	expect(document.querySelector('.select-menu-divider')!.textContent).toBe('SuggestionsPending reviews');
	expect(v4Mock.mock.lastCall?.[1]).toEqual({
		q0: 'is:pr is:open review-requested:ada user:o',
		q1: 'is:pr is:open team-review-requested:org/core user:o',
	});

	// Filtering the picker renders new rows for the same people
	document.querySelector('.list')!.innerHTML = item('ada');
	await vi.waitFor(() => expect(counts()).toEqual(['3']));
	expect(v4Mock).toHaveBeenCalledOnce();
	page.abort();

	// Another PR of the same owner, a few minutes later
	vi.useFakeTimers({now: Date.now() + 4 * 60 * 1000, toFake: ['Date']});
	history.pushState({}, '', '/o/other/pull/2');
	document.body.innerHTML = `<details id="reviewers-select-menu"><div class="list">${item('ada')}</div></details>`;
	const nextPage = new AbortController();
	await reviewerLoad.init(nextPage.signal);
	await vi.waitFor(() => expect(counts()).toEqual(['3']));
	expect(v4Mock).toHaveBeenCalledOnce();
	nextPage.abort();
	vi.useRealTimers();
});

test('reserves the counter while the counts load, and removes it if they fail', async () => {
	history.pushState({}, '', '/p/r/pull/1');
	document.body.innerHTML = `<details id="reviewers-select-menu"><div class="list">${item('bob')}</div></details>`;
	let reject!: (error: Error) => void;
	v4Mock.mockReturnValue(
		new Promise((_resolve, rejectRequest) => {
			reject = rejectRequest;
		}),
	);
	const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
	const text = document.querySelector<HTMLElement>('.select-menu-item-text')!;

	const page = new AbortController();
	await reviewerLoad.init(page.signal);
	expect(counts()).toEqual(['']);
	expect(text.style.paddingRight).toBe('36px');

	reject(new Error('Rate limited'));
	await vi.waitFor(() => expect(counts()).toEqual([]));
	expect(text.style.paddingRight).toBe('');
	expect(consoleError).toHaveBeenCalledOnce();
	page.abort();
});
