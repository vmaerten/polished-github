import {beforeEach, expect, test, vi} from 'vitest';

import quickComments from './quick-comments.js';

// happy-dom has no `execCommand`, which text-field-edit relies on
vi.mock('text-field-edit', () => ({
	insertTextIntoField(field: HTMLTextAreaElement, text: string) {
		field.value += text;
		field.dispatchEvent(new Event('input'));
	},
}));

vi.stubGlobal('chrome', {
	runtime: {id: 'extension', getManifest: () => ({version: '1.0.0'})},
	storage: {
		local: {
			get: async () => ({
				emojis: {
					version: '1.0.0',
					urls: {tada: 'https://github.githubassets.com/images/icons/emoji/unicode/1f389.png'},
				},
			}),
		},
		sync: {
			get: async (defaults: object) => ({
				...defaults,
				quickComments: [
					{label: 'LGTM', body: 'LGTM', on: 'prs'},
					{label: 'Thanks :tada:', body: 'Thanks :tada:', on: 'both'},
					{label: 'Triage', body: 'Needs triage', on: 'issues'},
				],
			}),
		},
	},
});

let submitted: number;

beforeEach(() => {
	submitted = 0;
	history.pushState({}, '', '/o/r/pull/1');
	document.body.innerHTML = `
		<form id="new_comment_form">
			<textarea></textarea>
			<button type="submit" class="btn-primary" disabled>Comment</button>
		</form>
	`;
	const field = document.querySelector('textarea')!;
	const submit = document.querySelector('button')!;
	// Like GitHub: the button is enabled only once there is text
	field.addEventListener('input', () => {
		submit.disabled = field.value === '';
	});
	submit.addEventListener('click', (event) => {
		event.preventDefault();
		submitted++;
	});
});

const tada = String.fromCodePoint(0x1_f3_89, 0xfe_0f);

function buttons(): string[] {
	return [...document.querySelectorAll('.polished-github-quick-comments button')].map((button) => button.textContent);
}

function clickButton(label: string, init: MouseEventInit = {}): void {
	const target = [...document.querySelectorAll('button')].find((button) => button.textContent === label)!;
	target.dispatchEvent(new MouseEvent('click', init));
}

test('shows the buttons meant for the current page', async () => {
	await quickComments.init(new AbortController().signal);
	expect(buttons()).toEqual(['LGTM', `Thanks ${tada}`]);
	expect(document.querySelector<HTMLElement>('.polished-github-quick-comments button:last-child')!.title).toContain(
		`Post “Thanks ${tada}”`,
	);
});

test('posts from the React composer of the new PR overview page', async () => {
	document.body.innerHTML = `
		<form aria-label="Add comment form">
			<textarea></textarea>
			<div data-testid="markdown-editor-footer"><button type="button" data-variant="primary">Comment</button></div>
		</form>
	`;
	let posted = 0;
	document.querySelector('button')!.addEventListener('click', () => posted++);
	await quickComments.init(new AbortController().signal);
	clickButton('LGTM');
	await vi.waitFor(() => expect(posted).toBe(1));
});

test('posts the comment in one click', async () => {
	await quickComments.init(new AbortController().signal);
	clickButton('LGTM');
	await vi.waitFor(() => expect(submitted).toBe(1));
	expect(document.querySelector('textarea')!.value).toBe('LGTM');
});

test('inserts without posting on Shift-click, or when a draft is in progress', async () => {
	await quickComments.init(new AbortController().signal);
	clickButton(`Thanks ${tada}`, {shiftKey: true});
	clickButton('LGTM');
	await new Promise((resolve) => setTimeout(resolve, 100));
	expect(document.querySelector('textarea')!.value).toBe('Thanks :tada:LGTM');
	expect(submitted).toBe(0);
});

test('does not post text typed while GitHub was enabling the button', async () => {
	await quickComments.init(new AbortController().signal);
	clickButton('LGTM');
	document.querySelector('textarea')!.value += ' my draft';
	await new Promise((resolve) => setTimeout(resolve, 100));
	expect(submitted).toBe(0);
	expect(document.querySelector('textarea')!.value).toBe('LGTM my draft');
});
