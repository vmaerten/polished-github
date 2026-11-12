import {beforeEach, expect, test, vi} from 'vitest';

import quickApprovals from './quick-approvals.js';

vi.stubGlobal('chrome', {
	runtime: {id: 'extension'},
	storage: {
		sync: {
			get: async (defaults: object) => ({
				...defaults,
				quickApprovals: [
					{label: 'LGTM', body: 'LGTM :rocket:'},
					{label: 'Ship it', body: 'Ship it :ship:'},
				],
			}),
		},
		local: {get: async () => ({token: 'secret'})},
	},
});

const fetchMock = vi.fn<typeof fetch>();
let pullRequest: {id: string; state: string; viewerDidAuthor: boolean};
let mutationResponse: {data?: unknown; errors?: Array<{message: string}>};

function graphqlCalls(): Array<{query: string; variables: Record<string, unknown>}> {
	return fetchMock.mock.calls.map(([, init]) => JSON.parse(init!.body as string));
}

function approvals(): Array<Record<string, unknown>> {
	return graphqlCalls()
		.filter(({query}) => query.includes('addPullRequestReview'))
		.map(({variables}) => variables);
}

beforeEach(() => {
	history.pushState({}, '', '/o/r/pull/1');
	document.body.innerHTML = '<div class="gh-header-actions"><button>Code</button></div>';
	pullRequest = {id: 'PR_1', state: 'OPEN', viewerDidAuthor: false};
	mutationResponse = {data: {addPullRequestReview: {clientMutationId: null}}};
	fetchMock.mockReset();
	fetchMock.mockImplementation(async (_, init) => {
		const {query} = JSON.parse(init!.body as string) as {query: string};
		const body = query.includes('addPullRequestReview') ? mutationResponse : {data: {repository: {pullRequest}}};
		return new Response(JSON.stringify(body));
	});
	vi.stubGlobal('fetch', fetchMock);
});

function group(): Element | null {
	return document.querySelector('.polished-github-quick-approvals');
}

function toast(): Element | null {
	return document.querySelector('.polished-github-toast');
}

function click(label: string, init: MouseEventInit = {}): void {
	const button = [...document.querySelectorAll<HTMLButtonElement>('.polished-github-quick-approvals button')].find(
		(candidate) => candidate.textContent.startsWith(label),
	)!;
	button.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, ...init}));
}

test('a click only opens the menu; a ⌘ or Ctrl-click approves without a message', async () => {
	await quickApprovals.init(new AbortController().signal);
	click('Approve');
	await new Promise((resolve) => setTimeout(resolve, 50));
	expect(approvals()).toEqual([]);

	click('Approve', {metaKey: true});
	await vi.waitFor(() => expect(group()!.textContent).toContain('Approved'));
	expect(approvals()).toEqual([{id: 'PR_1', body: ''}]);
	expect(toast()!.classList).toContain('Toast--success');
	expect(toast()!.textContent).toContain('Approved');
});

test('approves with the message picked in the menu, or without one', async () => {
	await quickApprovals.init(new AbortController().signal);
	click('Ship it');
	await vi.waitFor(() => expect(approvals()).toHaveLength(1));

	await quickApprovals.init(new AbortController().signal);
	click('Without a message');
	await vi.waitFor(() => expect(approvals()).toHaveLength(2));
	expect(approvals().map(({body}) => body)).toEqual(['Ship it :ship:', '']);
});

test('goes before the review button of the new PR pages', async () => {
	document.body.innerHTML = '<div><button class="ReviewMenuButton__9e8CKv">Submit review</button></div>';
	await quickApprovals.init(new AbortController().signal);
	expect(group()!.nextElementSibling!.textContent).toBe('Submit review');
});

test('stays away from your own PRs and from closed ones', async () => {
	pullRequest.viewerDidAuthor = true;
	await quickApprovals.init(new AbortController().signal);
	expect(group()).toBeNull();

	pullRequest = {id: 'PR_1', state: 'MERGED', viewerDidAuthor: false};
	await quickApprovals.init(new AbortController().signal);
	expect(group()).toBeNull();
});

test('explains a token that cannot approve', async () => {
	mutationResponse = {data: null, errors: [{message: 'Resource not accessible by personal access token'}]};
	await quickApprovals.init(new AbortController().signal);
	click('LGTM');
	await vi.waitFor(() => expect(group()!.textContent).toContain('Not approved'));
	expect(group()!.querySelector('button')!.title).toContain('read and write access to Pull requests');
	expect(toast()!.classList).toContain('Toast--error');
	expect(toast()!.textContent).toContain('read and write access to Pull requests');
	expect(toast()!.querySelector('a')!.href).toBe('https://github.com/settings/personal-access-tokens');
});

test('a retry replaces the toast of the failed attempt', async () => {
	mutationResponse = {data: null, errors: [{message: 'Something broke'}]};
	await quickApprovals.init(new AbortController().signal);
	click('LGTM');
	await vi.waitFor(() => expect(toast()!.classList).toContain('Toast--error'));
	expect(toast()!.querySelector('a')).toBeNull();

	mutationResponse = {data: {addPullRequestReview: {clientMutationId: null}}};
	click('LGTM');
	await vi.waitFor(() => expect(toast()!.classList).toContain('Toast--success'));
	expect(document.querySelectorAll('.polished-github-toast')).toHaveLength(1);
});
