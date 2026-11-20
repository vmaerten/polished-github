import {lacksWriteAccess, v4} from '../../github-helpers/api.js';
import type {Toast} from '../../github-helpers/toast.js';
import {t} from '../../helpers/i18n.js';

export type StackPullRequest = {
	id: string;
	number: number;
	title: string;
	isDraft: boolean;
	state: 'OPEN' | 'CLOSED' | 'MERGED';
	viewerCanUpdate: boolean;
};

type StackEntry = {position: number; pullRequest: StackPullRequest};

/** The PRs of the stack, from the one on the base branch up, or none when the PR is not in a stack. */
export async function fetchStack(owner: string, name: string, number: number): Promise<StackPullRequest[]> {
	const {repository} = await v4<{
		repository: {pullRequest: {stack: {entries: {nodes: StackEntry[]}} | null}};
	}>(
		`query($owner: String!, $name: String!, $number: Int!) {
			repository(owner: $owner, name: $name) {
				pullRequest(number: $number) {
					stack {
						entries(first: 100) {
							nodes {position pullRequest {id number title isDraft state viewerCanUpdate}}
						}
					}
				}
			}
		}`,
		{owner, name, number},
	);
	const entries = repository.pullRequest.stack?.entries.nodes ?? [];
	return entries.toSorted((a, b) => a.position - b.position).map(({pullRequest}) => pullRequest);
}

export function canEdit(pullRequest: StackPullRequest): boolean {
	return pullRequest.state === 'OPEN' && pullRequest.viewerCanUpdate;
}

export async function markReady(pullRequest: StackPullRequest): Promise<void> {
	await v4(
		`mutation($id: ID!) {
			markPullRequestReadyForReview(input: {pullRequestId: $id}) {clientMutationId}
		}`,
		{id: pullRequest.id},
	);
}

/** Adds the reviewers, logins and `org/team` slugs as the picker lists them, to those already requested. */
export async function requestReviewers(pullRequest: StackPullRequest, reviewers: string[]): Promise<void> {
	const teams = reviewers.filter((reviewer) => reviewer.includes('/'));
	const bots = reviewers.filter((reviewer) => reviewer.endsWith('[bot]'));
	const users = reviewers.filter((reviewer) => !teams.includes(reviewer) && !bots.includes(reviewer));
	await v4(
		`mutation($id: ID!, $users: [String!], $teams: [String!], $bots: [String!]) {
			requestReviewsByLogin(
				input: {pullRequestId: $id, userLogins: $users, teamSlugs: $teams, botLogins: $bots, union: true}
			) {clientMutationId}
		}`,
		{id: pullRequest.id, users, teams, bots},
	);
}

/**
 * Runs `action` on each PR in turn, from the bottom of the stack, so GitHub notifies in the order of the stack. A
 * failure doesn't stop the others: the toast lists them at the end.
 */
export async function runOnStack(
	pullRequests: StackPullRequest[],
	action: (pullRequest: StackPullRequest) => Promise<void>,
	toast: Toast,
	messages: {progress: (done: number, total: number) => string; done: string},
): Promise<void> {
	const failures: Array<{pullRequest: StackPullRequest; error: unknown}> = [];
	for (const [index, pullRequest] of pullRequests.entries()) {
		toast.update(messages.progress(index + 1, pullRequests.length));
		try {
			// oxlint-disable-next-line no-await-in-loop -- One at a time, in the order of the stack
			await action(pullRequest);
		} catch (error) {
			console.error(`polished-github: stack-actions failed on #${pullRequest.number}`, error);
			failures.push({pullRequest, error});
		}
	}

	if (failures.length === 0) {
		toast.succeed(messages.done);
		return;
	}

	const readOnly = failures.some(({error}) => lacksWriteAccess(error));
	const details = failures
		.map(({pullRequest, error}) => `#${pullRequest.number}: ${error instanceof Error ? error.message : String(error)}`)
		.join(' · ');
	toast.fail(
		t('stackActions_partial', pullRequests.length - failures.length, pullRequests.length),
		readOnly ? t('stackActions_needsWrite') : details,
		readOnly
			? {label: t('stackActions_tokenSettings'), url: 'https://github.com/settings/personal-access-tokens'}
			: undefined,
	);
}
