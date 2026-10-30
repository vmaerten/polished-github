import {beforeEach, describe, expect, test, vi} from 'vitest';

import {v3, v4} from './api.js';

let token = 'secret';
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
	token = 'secret';
	fetchMock.mockReset();
	vi.stubGlobal('fetch', fetchMock);
	vi.stubGlobal('chrome', {storage: {local: {get: async () => ({token})}}});
});

function respond(status: number, body: unknown, headers: Record<string, string> = {}): void {
	fetchMock.mockResolvedValue(new Response(JSON.stringify(body), {status, headers}));
}

describe('v3', () => {
	test('sends the token', async () => {
		respond(200, {login: 'octocat'});
		await expect(v3('/user')).resolves.toEqual({login: 'octocat'});
		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.github.com/user',
			expect.objectContaining({
				headers: expect.objectContaining({Authorization: 'Bearer secret'}),
			}),
		);
	});

	test('fails before calling GitHub without a token', async () => {
		token = '';
		await expect(v3('/user')).rejects.toThrow('No GitHub token');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	test('explains an invalid token', async () => {
		respond(401, {message: 'Bad credentials'});
		await expect(v3('/user')).rejects.toThrow('invalid or expired');
	});

	test('explains rate limiting', async () => {
		respond(403, {message: 'API rate limit exceeded'}, {'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '0'});
		await expect(v3('/user')).rejects.toThrow('rate limit exceeded');
	});

	test('surfaces GitHub error messages', async () => {
		respond(404, {message: 'Not Found'});
		await expect(v3('/repos/a/b')).rejects.toThrow('GitHub API 404: Not Found');
	});
});

describe('v4', () => {
	test('returns data', async () => {
		respond(200, {data: {viewer: {login: 'octocat'}}});
		await expect(v4('{viewer {login}}')).resolves.toEqual({viewer: {login: 'octocat'}});
	});

	test('throws on GraphQL errors, even with a 200', async () => {
		respond(200, {data: null, errors: [{message: 'Field missing'}]});
		await expect(v4('{nope}')).rejects.toThrow('GitHub GraphQL: Field missing');
	});
});
