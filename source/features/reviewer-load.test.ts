import {expect, test, vi} from 'vitest';

import {v4} from '../github-helpers/api.js';
import reviewerLoad from './reviewer-load.js';

vi.mock('../github-helpers/api.js', () => ({v4: vi.fn<typeof v4>()}));

const v4Mock = vi.mocked(v4);

function item(login: string): string {
	return `<label class="select-menu-item"><div class="select-menu-item-text"><span class="select-menu-item-heading"><span class="js-username">${login}</span><span class="description">Name</span></span></div></label>`;
}

function counts(): string[] {
	return [...document.querySelectorAll('.github-power-reviewer-load')].map((count) => count.textContent);
}

test('shows each reviewer’s pending reviews in the owner’s repositories, fetching each once', async () => {
	history.pushState({}, '', '/o/r/pull/1');
	document.body.innerHTML = `<details id="reviewers-select-menu"><div class="select-menu-divider">Suggestions</div><div class="list">${item('ada')}${item('org/core')}</div></details>`;
	v4Mock.mockImplementation(async (_query, variables) =>
		Object.fromEntries(Object.keys(variables!).map((key, index) => [`r${key.slice(1)}`, {issueCount: index + 3}])),
	);

	await reviewerLoad.init(new AbortController().signal);
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
});
