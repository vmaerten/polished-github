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
	storage: {
		sync: {
			get: async (defaults: object) => ({
				...defaults,
				quickComments: [
					{label: 'LGTM', body: 'LGTM', on: 'prs'},
					{label: 'Thanks', body: 'Thanks!', on: 'both'},
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

function buttons(): string[] {
	return [...document.querySelectorAll('.github-power-quick-comments button')].map((button) => button.textContent);
}

function clickButton(label: string, init: MouseEventInit = {}): void {
	const target = [...document.querySelectorAll('button')].find((button) => button.textContent === label)!;
	target.dispatchEvent(new MouseEvent('click', init));
}

test('shows the buttons meant for the current page', async () => {
	await quickComments.init(new AbortController().signal);
	expect(buttons()).toEqual(['LGTM', 'Thanks']);
});

test('posts the comment in one click', async () => {
	await quickComments.init(new AbortController().signal);
	clickButton('LGTM');
	await vi.waitFor(() => expect(submitted).toBe(1));
	expect(document.querySelector('textarea')!.value).toBe('LGTM');
});

test('inserts without posting on Shift-click, or when a draft is in progress', async () => {
	await quickComments.init(new AbortController().signal);
	clickButton('Thanks', {shiftKey: true});
	clickButton('LGTM');
	await new Promise((resolve) => setTimeout(resolve, 100));
	expect(document.querySelector('textarea')!.value).toBe('Thanks!LGTM');
	expect(submitted).toBe(0);
});
