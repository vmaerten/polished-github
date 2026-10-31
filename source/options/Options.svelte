<script lang="ts">
	import {features} from '../features/index.js';
	import {
		getOptions,
		getToken,
		type Options,
		resetOptions,
		setFeatureEnabled,
		setOptions,
	} from '../options-storage.js';
	import DiffStatsEditor from './DiffStatsEditor.svelte';
	import ImageModalEditor from './ImageModalEditor.svelte';
	import PrListSection from './PrListSection.svelte';
	import QuickCommentsEditor from './QuickCommentsEditor.svelte';
	import StaleEditor from './StaleEditor.svelte';
	import TokenSection from './TokenSection.svelte';

	const configurable = new Set(['image-modal', 'quick-comments', 'pr-list-diff-stats', 'pr-list-stale']);
	const {version} = chrome.runtime.getManifest();

	let options = $state<Options>();
	let hasToken = $state(false);
	let filter = $state('');
	let expanded = $state<string>();

	const visibleFeatures = $derived(
		features.filter(({id, description}) =>
			`${id} ${description}`.toLowerCase().includes(filter.trim().toLowerCase()),
		),
	);
	const enabledCount = $derived(
		features.filter(({id}) => options && !options.disabledFeatures.includes(id)).length,
	);

	async function load(): Promise<void> {
		[options, hasToken] = await Promise.all([getOptions(), getToken().then((token) => token !== '')]);
	}

	async function toggle(id: string, enabled: boolean): Promise<void> {
		await setFeatureEnabled(id, enabled);
		options = await getOptions();
	}

	async function save(changes: Partial<Options>): Promise<void> {
		await setOptions(changes);
	}

	async function reset(): Promise<void> {
		if (confirm('Reset every setting to its default? Your token is kept.')) {
			await resetOptions();
			await load();
		}
	}

	void load();
</script>

<main>
	<header>
		<div class="brand">
			<div class="logo" aria-hidden="true">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></svg>
			</div>
			<div>
				<h1>Supercharged GitHub</h1>
				<span class="muted small">Version {version} · Options</span>
			</div>
		</div>
		<nav class="small">
			<a href="https://github.com/vmaerten/supercharged-github" target="_blank" rel="noopener noreferrer">Repository</a>
			<a href="https://github.com/vmaerten/supercharged-github/issues/new" target="_blank" rel="noopener noreferrer">Report a bug</a>
		</nav>
	</header>

	<TokenSection ontokenchange={(value) => (hasToken = value)} />

	{#if options}
		<PrListSection bind:placement={options.prListBadges} onsave={() => save({prListBadges: options!.prListBadges})} />

		<section class="features">
			<div class="features-header">
				<div class="heading">
					<h2>Features</h2>
					<p class="muted">{enabledCount} of {features.length} enabled. Changes apply on the next page load.</p>
				</div>
				<input type="search" aria-label="Filter features" placeholder="Filter features" bind:value={filter}>
			</div>

			<ul class="card list">
				{#each visibleFeatures as feature (feature.id)}
					{@const enabled = !options.disabledFeatures.includes(feature.id)}
					<li>
						<div class="feature">
							<div class="feature-text">
								<div class="feature-title">
									<h3 class="mono">{feature.id}</h3>
									{#if feature.requiresToken}<span class="pill">needs token</span>{/if}
								</div>
								<p class="muted">{feature.description}</p>
								{#if feature.requiresToken && !hasToken && enabled}
									<p class="warning small">Add a token above to turn this on.</p>
								{/if}
								{#if configurable.has(feature.id)}
									<button
										type="button"
										class="link"
										aria-expanded={expanded === feature.id}
										onclick={() => (expanded = expanded === feature.id ? undefined : feature.id)}
									>{expanded === feature.id ? '▾' : '▸'} Settings</button>
								{/if}
							</div>
							<button
								type="button"
								role="switch"
								class="switch"
								aria-checked={enabled}
								aria-label="Enable {feature.id}"
								onclick={() => toggle(feature.id, !enabled)}
							><span></span></button>
						</div>
						{#if expanded === feature.id}
							<div class="settings">
								{#if feature.id === 'image-modal'}
									<ImageModalEditor
										bind:settings={options.imageModal}
										onsave={() => save({imageModal: $state.snapshot(options!.imageModal)})}
									/>
								{:else if feature.id === 'quick-comments'}
									<QuickCommentsEditor
										bind:comments={options.quickComments}
										onsave={() => save({quickComments: $state.snapshot(options!.quickComments)})}
									/>
								{:else if feature.id === 'pr-list-diff-stats'}
									<DiffStatsEditor
										bind:settings={options.diffStats}
										onsave={() => save({diffStats: $state.snapshot(options!.diffStats)})}
									/>
								{:else if feature.id === 'pr-list-stale'}
									<StaleEditor
										bind:settings={options.stale}
										onsave={() => save({stale: $state.snapshot(options!.stale)})}
									/>
								{/if}
							</div>
						{/if}
					</li>
				{:else}
					<li class="muted">No feature matches “{filter}”.</li>
				{/each}
			</ul>
		</section>

		<footer class="small muted">
			<span>Settings sync across your browsers. The token stays on this device.</span>
			<button type="button" class="link danger" onclick={reset}>Reset to defaults</button>
		</footer>
	{/if}

	<p class="small muted">Supercharged GitHub is not affiliated with, endorsed or sponsored by GitHub, Inc.</p>
</main>

<style>
	:global(:root) {
		color-scheme: light dark;
		--text: #1f2328;
		--muted: #59636e;
		--border: #d1d9e0;
		--canvas: #f6f8fa;
		--surface: #ffffff;
		--accent: #0969da;
		--accent-emphasis: #0969da;
		--success: #1a7f37;
		--danger: #d1242f;
		--warning: #9a6700;
		--switch-on: #1f883d;
		--switch-off: #818b98;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--text: #f0f6fc;
			--muted: #9198a1;
			--border: #3d444d;
			--canvas: #0d1117;
			--surface: #151b23;
			--accent: #4493f8;
			--accent-emphasis: #1f6feb;
			--success: #3fb950;
			--danger: #f85149;
			--warning: #d29922;
			--switch-on: #238636;
			--switch-off: #656c76;
		}
	}

	:global(body) {
		margin: 0;
		background: var(--canvas);
		color: var(--text);
		font: 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
	}

	:global(a) {
		color: var(--accent);
	}

	:global(h1, h2, h3, p) {
		margin: 0;
	}

	:global(.muted) {
		color: var(--muted);
	}

	:global(.small) {
		font-size: 13px;
	}

	:global(.success) {
		color: var(--success);
	}

	:global(.danger) {
		color: var(--danger);
	}

	:global(.warning) {
		color: var(--warning);
	}

	:global(.mono, code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	:global(.card) {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}

	:global(section.card) {
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	:global(.heading) {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	:global(h2) {
		font-size: 16px;
		font-weight: 600;
	}

	:global(input:not([type='checkbox'], [type='radio'])) {
		box-sizing: border-box;
		min-height: 36px;
		padding: 0 10px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
		font: inherit;
		min-width: 0;
	}

	:global(button) {
		font: inherit;
		color: inherit;
		cursor: pointer;
	}

	:global(button.primary, button.secondary) {
		min-height: 36px;
		padding: 0 16px;
		border-radius: 6px;
		font-weight: 600;
	}

	:global(button.primary) {
		border: 1px solid var(--switch-on);
		background: var(--switch-on);
		color: #fff;
	}

	:global(button.secondary) {
		align-self: flex-start;
		border: 1px solid var(--border);
		background: var(--surface);
	}

	:global(button.icon) {
		width: 36px;
		height: 36px;
		border: 0;
		background: transparent;
		color: var(--muted);
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	:global(button.icon:disabled) {
		opacity: 0.4;
		cursor: default;
	}

	:global(button.link) {
		align-self: flex-start;
		border: 0;
		background: transparent;
		padding: 4px 0;
		color: var(--accent);
	}

	:global(button.link.danger) {
		color: var(--danger);
	}

	:global(.editor) {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	:global(.check) {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	:global(.preview) {
		border-top: 1px solid var(--border);
		padding-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	:global(.preview-title) {
		font-size: 12px;
		font-weight: 600;
		color: var(--muted);
	}

	:global(.preview-buttons) {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	:global(.chip) {
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		padding: 2px 10px;
		font-size: 12px;
		font-weight: 600;
	}

	main {
		max-width: 880px;
		margin: 0 auto;
		padding: 32px 16px 64px;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	header,
	footer,
	.features-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.logo {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: #1f2328;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	h1 {
		font-size: 20px;
	}

	nav {
		display: flex;
		gap: 16px;
	}

	.features {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.features-header {
		align-items: flex-end;
	}

	.features-header input {
		flex: 0 1 280px;
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	.list > li {
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.list > li + li {
		border-top: 1px solid var(--border);
	}

	.feature {
		display: flex;
		align-items: flex-start;
		gap: 16px;
	}

	.feature-text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.feature-title {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	h3 {
		font-size: 14px;
	}

	.pill {
		font-size: 12px;
		border: 1px solid var(--border);
		color: var(--muted);
		border-radius: 12px;
		padding: 0 8px;
		line-height: 20px;
	}

	.switch {
		flex: none;
		width: 44px;
		height: 24px;
		margin-top: 2px;
		padding: 2px;
		border: 0;
		border-radius: 12px;
		background: var(--switch-off);
		display: flex;
		justify-content: flex-start;
	}

	.switch[aria-checked='true'] {
		background: var(--switch-on);
		justify-content: flex-end;
	}

	.switch span {
		width: 20px;
		height: 20px;
		border-radius: 10px;
		background: #fff;
	}

	.settings {
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--canvas);
		padding: 16px;
	}
</style>
