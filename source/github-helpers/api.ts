import {getToken} from '../options-storage.js';
import {t} from '../helpers/i18n.js';

export class GitHubApiError extends Error {
	override name = 'GitHubApiError';
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
	const token = await getToken();
	if (!token) {
		throw new GitHubApiError(t('api_noToken'));
	}

	const headers = new Headers(init.headers);
	headers.set('Authorization', `Bearer ${token}`);
	if (!headers.has('Accept')) {
		headers.set('Accept', 'application/vnd.github+json');
	}

	const response = await fetch(`https://api.github.com${path}`, {...init, headers});

	if (response.ok) {
		return response;
	}

	if (response.status === 401) {
		throw new GitHubApiError(t('api_invalidToken'));
	}

	if (response.headers.get('x-ratelimit-remaining') === '0') {
		const reset = new Date(Number(response.headers.get('x-ratelimit-reset')) * 1000);
		throw new GitHubApiError(t('api_rateLimit', reset.toLocaleTimeString()));
	}

	// Error bodies are usually `{message}`, but proxies can answer with HTML
	const {message} = (await response.json().catch(() => ({message: response.statusText}))) as {message: string};
	throw new GitHubApiError(t('api_error', response.status, message));
}

/** REST API. `path` starts with `/`, e.g. `/repos/owner/name`. */
export async function v3<T>(path: string): Promise<T> {
	const response = await request(path);
	return (await response.json()) as T;
}

/** GraphQL API. Throws on partial errors instead of returning half the data. */
export async function v4<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
	const response = await request('/graphql', {method: 'POST', body: JSON.stringify({query, variables})});
	const {data, errors} = (await response.json()) as {data: T; errors?: Array<{message: string}>};
	if (errors?.length) {
		throw new GitHubApiError(t('api_graphqlError', errors.map((error) => error.message).join('; ')));
	}

	return data;
}
