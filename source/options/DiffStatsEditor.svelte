<script lang="ts">
	import {getSizeLabel} from '../features/pr-list-diff-stats.js';
	import type {DiffStatsSettings} from '../options-storage.js';

	let {settings = $bindable(), onsave}: {settings: DiffStatsSettings; onsave: () => void} = $props();

	const labels = ['XS', 'S', 'M', 'L'];
</script>

<div class="editor">
	<label class="check">
		<input type="checkbox" bind:checked={settings.showChangedFiles} onchange={onsave}>
		Show the number of changed files
	</label>
	<label class="check">
		<input type="checkbox" bind:checked={settings.showSizeLabel} onchange={onsave}>
		Show a size label, from lines added and removed
	</label>
	<div class="thresholds">
		{#each labels as label, index (label)}
			<label>
				<strong>{label}</strong> ≤
				<input type="number" min="1" bind:value={settings.sizeThresholds[index]} onchange={onsave}>
			</label>
		{/each}
		<span class="muted">XL above</span>
	</div>
	<div class="preview">
		<span class="preview-title">Preview</span>
		<div class="pr-row">
			<strong>feat: open images in a modal on click</strong>
			<span class="mono success">+128</span>
			<span class="mono danger">−14</span>
			{#if settings.showChangedFiles}<span class="muted">· 6 files</span>{/if}
			{#if settings.showSizeLabel}<span class="chip">{getSizeLabel(142, settings.sizeThresholds)}</span>{/if}
		</div>
	</div>
</div>

<style>
	.thresholds {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		padding-left: 26px;
	}

	.thresholds input {
		width: 72px;
		margin-left: 4px;
	}

	.pr-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
	}
</style>
