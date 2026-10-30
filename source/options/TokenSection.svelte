<script lang="ts">
	import {v3} from '../github-helpers/api.js';
	import {getToken, setToken} from '../options-storage.js';

	type Status =
		| {kind: 'none'}
		| {kind: 'checking'}
		| {kind: 'connected'; login: string; remaining: number; limit: number}
		| {kind: 'error'; message: string};

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
			const [{login}, {resources}] = await Promise.all([
				v3<{login: string}>('/user'),
				// Doesn't count against the rate limit
				v3<{resources: {core: {remaining: number; limit: number}}}>('/rate_limit'),
			]);
			status = {kind: 'connected', login, ...resources.core};
		} catch (error) {
			status = {kind: 'error', message: error instanceof Error ? error.message : String(error)};
		}
	}

	async function load(): Promise<void> {
		token = await getToken();
		await check();
	}

	async function save(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		await setToken(token);
		ontokenchange(token.trim() !== '');
		await check();
	}

	void load();
</script>

<section class="card">
	<div class="heading">
		<h2>GitHub token</h2>
		<p class="muted">Needed by features that call the GitHub API. Stored on this device only, never synced.</p>
	</div>
	<form onsubmit={save}>
		<label for="token">Personal access token</label>
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
					aria-label={visible ? 'Hide token' : 'Show token'}
					onclick={() => (visible = !visible)}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
				</button>
			</div>
			<button type="submit" class="primary">Save</button>
		</div>
		<p class="status" role="status">
			{#if status.kind === 'checking'}
				<span class="muted">Checking…</span>
			{:else if status.kind === 'connected'}
				<span class="success">Connected as <strong>@{status.login}</strong></span>
				<span class="muted">· {status.remaining.toLocaleString()} / {status.limit.toLocaleString()} requests left this hour</span>
			{:else if status.kind === 'error'}
				<span class="danger">{status.message}</span>
			{/if}
		</p>
	</form>
	<p class="muted small">
		Use a <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">fine-grained token</a>
		with read access to <em>Pull requests</em> on the repositories you browse, or a classic token with the <code>repo</code> scope. For organizations using SSO, authorize the token for them too.
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
