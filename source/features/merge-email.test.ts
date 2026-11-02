import {afterEach, expect, test, vi} from 'vitest';

import mergeEmail from './merge-email.js';

vi.stubGlobal('chrome', {
	storage: {
		sync: {
			get: async (defaults: object) => ({
				...defaults,
				mergeEmails: [
					{owner: 'Ondorse', email: 'me@ondorse.co'},
					{owner: 'other', email: 'me@other.dev'},
				],
			}),
		},
	},
});

let page: AbortController;

afterEach(() => {
	page.abort();
});

async function openMergeBox(path: string): Promise<{field: HTMLSelectElement; changes: string[]}> {
	history.pushState({}, '', path);
	document.body.innerHTML = '<div class="merge-box"></div>';
	page = new AbortController();
	await mergeEmail.init(page.signal);

	// Rendered once the merge is to be confirmed, like GitHub's form
	document.querySelector('.merge-box')!.innerHTML = `
		<div class="layout">
			<span class="wrapper">
				<select aria-label="Select commit author email">
					<option value="me@personal.dev">me@personal.dev</option>
					<option value="me@ondorse.co">me@ondorse.co</option>
				</select>
			</span>
		</div>
	`;
	const field = document.querySelector('select')!;
	const changes: string[] = [];
	field.addEventListener('change', () => changes.push(field.value));
	return {field, changes};
}

function note(): string | undefined {
	return document.querySelector('.polished-github-merge-email')?.textContent;
}

test('selects the owner’s email, whatever its case, and says so', async () => {
	const {field, changes} = await openMergeBox('/ondorse/app/pull/1');

	await vi.waitFor(() => expect(changes).toEqual(['me@ondorse.co']));
	expect(field.value).toBe('me@ondorse.co');
	expect(note()).toBe('Set by Polished GitHub for ondorse.');
});

test('leaves the field alone when the email is not one of the account’s', async () => {
	const {field, changes} = await openMergeBox('/other/app/pull/1');

	await vi.waitFor(() =>
		expect(note()).toBe('me@other.dev is not a verified email of your account, so Polished GitHub left this as is.'),
	);
	expect(field.value).toBe('me@personal.dev');
	expect(changes).toEqual([]);
});

test('changes nothing for an owner without a rule', async () => {
	const {field} = await openMergeBox('/vmaerten/app/pull/1');

	await new Promise((resolve) => setTimeout(resolve, 0));
	expect(field.value).toBe('me@personal.dev');
	expect(note()).toBeUndefined();
});
