<script lang="ts">
	import {v4} from '../github-helpers/api.js';
	import {getToken, setToken} from '../options-storage.js';
	import {t} from '../helpers/i18n.js';

	type Status =
		| {kind: 'none'}
		| {kind: 'checking'}
		| {kind: 'connected'; login: string; remaining: number; limit: number}
		| {kind: 'error'; message: string};

	// GitHub pre-fills the form with the only permission the features need; the user still picks the repositories
	const newTokenUrl =
		'https://github.com/settings/personal-access-tokens/new?name=Polished+GitHub&description=Lets+the+Polished+GitHub+browser+extension+read+pull+requests&pull_requests=read';

	// A fine-grained token covers a single account or organization; a classic one covers them all
	const classicTokenUrl = 'https://github.com/settings/tokens/new?scopes=repo&description=Polished+GitHub';

	let {ontokenchange}: {ontokenchange: (hasToken: boolean) => void} = $props();

	let token = $state('');
	let visible = $state(false);
	let status = $state<Status>({kind: 'none'});

	async function check(): Promise<void> {
		if (token.trim() === '') {
			status = {kind: 'none'};
			return;
		}

		status = {kind: 'checking'};
		try {
			// The features spend the GraphQL quota, which is separate from the REST one
			const {viewer, rateLimit} = await v4<{viewer: {login: string}; rateLimit: {remaining: number; limit: number}}>(
				'{viewer {login} rateLimit {remaining limit}}',
			);
			status = {kind: 'connected', login: viewer.login, ...rateLimit};
		} catch (error) {
			status = {kind: 'error', message: error instanceof Error ? error.message : String(error)};
		}
	}

	async function load(): Promise<void> {
		token = await getToken();
		await check();
	}

	// Firefox asks before data leaves the extension: the token, and the repositories and PRs of the pages browsed. The request must run
	// before any await, while the click still counts as user input.
	function allowSendingToken(): Promise<boolean> {
		if (!navigator.userAgent.includes('Firefox/')) {
			return Promise.resolve(true);
		}

		return chrome.permissions.request({data_collection: ['authenticationInfo', 'browsingActivity']} as chrome.permissions.Permissions);
	}

	async function save(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (token.trim() !== '' && !(await allowSendingToken())) {
			status = {kind: 'error', message: t('token_consentDenied')};
			return;
		}

		await setToken(token);
		ontokenchange(token.trim() !== '');
		await check();
	}

	void load();
</script>

<section class="card">
	<div class="heading">
		<h2>{t('token_title')}</h2>
		<p class="muted">{t('token_description')}</p>
	</div>
	<form onsubmit={save}>
		<label for="token">{t('token_label')}</label>
		<div class="token-row">
			<div class="token-input">
				<input
					id="token"
					type={visible ? 'text' : 'password'}
					autocomplete="off"
					spellcheck="false"
					bind:value={token}
				>
				<button
					type="button"
					class="icon"
					aria-label={visible ? t('token_hide') : t('token_show')}
					onclick={() => (visible = !visible)}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
				</button>
			</div>
			<button type="submit" class="primary">{t('token_save')}</button>
		</div>
		<p class="status" role="status">
			{#if status.kind === 'checking'}
				<span class="muted">{t('token_checking')}</span>
			{:else if status.kind === 'connected'}
				<span class="success">{t('token_connectedAs')} <strong>@{status.login}</strong></span>
				<span class="muted">{t('token_requestsLeft', status.remaining.toLocaleString(), status.limit.toLocaleString())}</span>
			{:else if status.kind === 'error'}
				<span class="danger">{status.message}</span>
			{/if}
		</p>
	</form>
	<p class="muted small">
		{t('token_helpStart')} <a href={newTokenUrl} target="_blank" rel="noopener noreferrer">{t('token_helpLink')}</a>
		{t('token_helpAccess')} <em>Pull requests</em> {t('token_helpClassic')}
		<a href={classicTokenUrl} target="_blank" rel="noopener noreferrer">{t('token_helpClassicLink')}</a>
		{t('token_helpScope')} <code>repo</code>{t('token_helpEnd')}
	</p>
</section>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	label {
		font-weight: 600;
		font-size: 13px;
	}

	.token-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.token-input {
		flex: 1 1 320px;
		display: flex;
		align-items: center;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
	}

	.token-input input {
		flex: 1;
		border: 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13px;
	}

	.status {
		min-height: 21px;
		font-size: 13px;
	}
</style>
