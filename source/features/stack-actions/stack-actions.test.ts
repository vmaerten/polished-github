import {beforeEach, expect, test, vi} from 'vitest';

import stackActions from './index.js';
import type {StackPullRequest} from './stack.js';

vi.stubGlobal('chrome', {
	runtime: {id: 'extension'},
	storage: {local: {get: async () => ({token: 'secret'})}},
});

const fetchMock = vi.fn<typeof fetch>();
let stack: StackPullRequest[];
let failingIds: Set<string>;

function pullRequest(number: number, changes: Partial<StackPullRequest> = {}): StackPullRequest {
	return {
		id: `PR_${number}`,
		number,
		title: `PR ${number}`,
		isDraft: true,
		state: 'OPEN',
		viewerCanUpdate: true,
		...changes,
	};
}

function mutations(name: string): Array<Record<string, unknown>> {
	return fetchMock.mock.calls
		.map(([, init]) => JSON.parse(init!.body as string) as {query: string; variables: Record<string, unknown>})
		.filter(({query}) => query.includes(name))
		.map(({variables}) => variables);
}

const readyButton =
	'<div><button data-component="Button" data-dd-action-name="pull_requests.lifecycle.mark_ready">Ready for review</button></div>';

beforeEach(() => {
	history.pushState({}, '', '/o/r/pull/3');
	document.body.innerHTML = readyButton;
	failingIds = new Set();
	// Listed out of order, as nothing promises the API's order
	stack = [pullRequest(2, {isDraft: false}), pullRequest(1), pullRequest(4, {viewerCanUpdate: false}), pullRequest(3)];
	fetchMock.mockReset();
	fetchMock.mockImplementation(async (_, init) => {
		const {query, variables} = JSON.parse(init!.body as string) as {query: string; variables: {id?: string}};
		if (query.includes('stack')) {
			const nodes = stack.map((entry) => ({position: entry.number, pullRequest: entry}));
			return new Response(JSON.stringify({data: {repository: {pullRequest: {stack: {entries: {nodes}}}}}}));
		}

		return new Response(
			JSON.stringify(
				failingIds.has(variables.id!)
					? {data: null, errors: [{message: 'Resource not accessible by personal access token'}]}
					: {data: {}},
			),
		);
	});
	vi.stubGlobal('fetch', fetchMock);
});

function toast(): Element {
	return document.querySelector('.polished-github-toast')!;
}

function openStackDialog(): HTMLDialogElement {
	const wholeStack = [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find((item) =>
		item.textContent.startsWith('The whole stack'),
	)!;
	expect(wholeStack.textContent).toContain('2 drafts, from #1 up to #3');
	wholeStack.click();
	return document.querySelector('dialog')!;
}

test('marks the drafts of the stack ready for review from its bottom up, once confirmed', async () => {
	await stackActions.init(new AbortController().signal);
	const dialog = openStackDialog();
	const checked = [...dialog.querySelectorAll('input')].map((checkbox) => [checkbox.checked, checkbox.disabled]);
	// From the top of the stack: #4 can't be edited, #2 is already ready
	expect(checked).toEqual([
		[false, true],
		[true, false],
		[false, true],
		[true, false],
	]);
	expect(mutations('markPullRequestReadyForReview')).toEqual([]);

	[...dialog.querySelectorAll('button')].find((button) => button.textContent === 'Mark 2 ready for review')!.click();
	await vi.waitFor(() => expect(toast().classList).toContain('Toast--success'));
	expect(mutations('markPullRequestReadyForReview')).toEqual([{id: 'PR_1'}, {id: 'PR_3'}]);
});

test('leaves the Ready for review button alone when no other PR of the stack is a draft', async () => {
	stack = [pullRequest(1, {isDraft: false}), pullRequest(3)];
	await stackActions.init(new AbortController().signal);
	expect(document.querySelector('.polished-github-stack-ready')).toBeNull();
});

test('goes on after a PR that fails, then explains a token that cannot write', async () => {
	failingIds.add('PR_1');
	await stackActions.init(new AbortController().signal);
	[...openStackDialog().querySelectorAll('button')].at(-1)!.click();
	await vi.waitFor(() => expect(toast().classList).toContain('Toast--error'));
	expect(mutations('markPullRequestReadyForReview')).toEqual([{id: 'PR_1'}, {id: 'PR_3'}]);
	expect(toast().textContent).toContain('Done on 1 of 2 pull requests');
	expect(toast().textContent).toContain('read and write access to Pull requests');
});

function option(id: string, selected: boolean): string {
	return `<div role="option" data-id="${id}" aria-selected="${selected}"><span class="reviewerOptionLogin__a">${id}</span></div>`;
}

async function pickReviewers(alsoOnStack: boolean): Promise<void> {
	document.body.innerHTML = `<div class="prc-SelectPanel-Overlay-x"><div class="prc-SelectPanel-Wrapper-y">${[
		option('ondorse/engineering', true),
		option('thomasdiben', false),
		option('copilot-pull-request-reviewer[bot]', false),
		option('marie-l', false),
	].join('')}</div></div>`;
	await stackActions.init(new AbortController().signal);
	const footer = document.querySelector('.prc-SelectPanel-Wrapper-y > .polished-github-stack-reviewers')!;
	footer.querySelector('input')!.checked = alsoOnStack;
	for (const id of ['thomasdiben', 'copilot-pull-request-reviewer[bot]']) {
		document.querySelector(`[data-id="${id}"]`)!.setAttribute('aria-selected', 'true');
	}

	document.querySelector('.prc-SelectPanel-Overlay-x')!.remove();
}

test('requests the reviewers added in the picker on the other open PRs of the stack', async () => {
	await pickReviewers(true);
	await vi.waitFor(() => expect(toast().classList).toContain('Toast--success'));
	// Not #3, the PR of the page, which GitHub handles, nor #4, which the user can't edit
	expect(mutations('requestReviewsByLogin')).toEqual(
		[1, 2].map((number) => ({
			id: `PR_${number}`,
			users: ['thomasdiben'],
			teams: [],
			bots: ['copilot-pull-request-reviewer[bot]'],
		})),
	);
});

test('requests nothing more unless the stack checkbox is checked', async () => {
	await pickReviewers(false);
	await new Promise((resolve) => setTimeout(resolve, 50));
	expect(mutations('requestReviewsByLogin')).toEqual([]);
});
