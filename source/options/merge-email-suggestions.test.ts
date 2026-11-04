import {expect, test, vi} from 'vitest';

import {getMergeEmailSuggestions} from './merge-email-suggestions.js';

vi.mock('../options-storage.js', () => ({
	getMergeBoxesSeen: async () => ({owners: ['ONDORSE', 'acme'], emails: ['me@ondorse.co']}),
}));

const responses: Record<string, unknown> = {
	'/user': {login: 'vmaerten'},
	'/user/orgs?per_page=100': [{login: 'ondorse'}],
};

vi.mock('../github-helpers/api.js', () => ({
	v3: async (path: string) => {
		if (path in responses) {
			return responses[path];
		}

		throw new Error('403');
	},
}));

test('merges the account and the merge boxes seen, and flags emails the token cannot list', async () => {
	expect(await getMergeEmailSuggestions()).toEqual({
		owners: ['ondorse', 'vmaerten', 'acme'],
		emails: ['me@ondorse.co'],
		partial: true,
	});
});
