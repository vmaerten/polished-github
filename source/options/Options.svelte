<script lang="ts">
	import {features} from '../features/index.js';
	import {getOptions, getToken, setFeatureEnabled, setToken} from '../options-storage.js';

	let token = $state('');
	let tokenSaved = $state(false);
	let disabledFeatures = $state<string[]>([]);

	void Promise.all([getOptions(), getToken()]).then(([options, storedToken]) => {
		disabledFeatures = options.disabledFeatures;
		token = storedToken;
	});

	async function saveToken(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		await setToken(token);
		tokenSaved = true;
	}

	async function toggle(id: string, enabled: boolean): Promise<void> {
		await setFeatureEnabled(id, enabled);
		({disabledFeatures} = await getOptions());
	}
</script>

<main>
	<h1>github-power</h1>

	<section>
		<h2>GitHub token</h2>
		<p>Needed by features that call the GitHub API. Stored on this device only, never synced.</p>
		<form onsubmit={saveToken}>
			<label for="token">Personal access token</label>
			<input id="token" type="password" autocomplete="off" bind:value={token} oninput={() => (tokenSaved = false)}>
			<button type="submit">Save</button>
			{#if tokenSaved}<span role="status">Saved</span>{/if}
		</form>
	</section>

	<section>
		<h2>Features</h2>
		<p>Changes apply on the next page load.</p>
		<ul>
			{#each features as feature (feature.id)}
				<li>
					<label>
						<input
							type="checkbox"
							checked={!disabledFeatures.includes(feature.id)}
							onchange={event => toggle(feature.id, event.currentTarget.checked)}
						>
						<code>{feature.id}</code>
						{#if feature.requiresToken}<small>needs token</small>{/if}
					</label>
					<p>{feature.description}</p>
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	main {
		max-width: 720px;
		margin: 32px auto;
		padding: 0 16px;
		font: 14px/1.5 system-ui, sans-serif;
		color-scheme: light dark;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	li p {
		margin: 0 0 12px 24px;
		opacity: 0.75;
	}
</style>
