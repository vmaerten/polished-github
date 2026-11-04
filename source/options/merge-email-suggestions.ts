import {v3} from '../github-helpers/api.js';
import {getMergeBoxesSeen} from '../options-storage.js';

export type MergeEmailSuggestions = {
	owners: string[];
	emails: string[];
	/** The token could not list the account's emails: they only come from the merge boxes seen. */
	partial: boolean;
};

function unique(values: string[]): string[] {
	const seen = new Set<string>();
	return values.filter((value) => {
		const key = value.toLowerCase();
		if (seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	});
}

function valueOr<T>(result: PromiseSettledResult<T>, fallback: T): T {
	return result.status === 'fulfilled' ? result.value : fallback;
}

// Each request may fail without a token or the permission it needs: what the merge boxes showed is enough
export async function getMergeEmailSuggestions(): Promise<MergeEmailSuggestions> {
	const [user, orgs, emails, seen] = await Promise.allSettled([
		v3<{login: string}>('/user'),
		// Classic tokens with `read:org`; fine-grained tokens always get an empty list
		v3<Array<{login: string}>>('/user/orgs?per_page=100'),
		// Classic tokens with `user:email`, fine-grained tokens with the Email addresses permission
		v3<Array<{email: string; verified: boolean}>>('/user/emails?per_page=100'),
		getMergeBoxesSeen(),
	]);
	const merged = valueOr(seen, {owners: [], emails: []});
	const login = valueOr(user, undefined)?.login;

	return {
		owners: unique([...valueOr(orgs, []).map((org) => org.login), ...(login ? [login] : []), ...merged.owners]),
		emails: unique([
			...valueOr(emails, [])
				.filter(({verified}) => verified)
				.map(({email}) => email),
			...merged.emails,
		]),
		partial: emails.status === 'rejected',
	};
}
