<script lang="ts">
	import {getSizeLabel, sizeLabels} from '../features/diff-stats.js';
	import type {DiffStatsSettings} from '../options-storage.js';
	import {t} from '../helpers/i18n.js';

	let {settings = $bindable(), onsave}: {settings: DiffStatsSettings; onsave: () => void} = $props();

	// The last label, XL, has no threshold: it is everything above L
	const labels = sizeLabels.slice(0, -1);
</script>

<div class="editor">
	<label class="check">
		<input type="checkbox" bind:checked={settings.showChangedFiles} onchange={onsave}>
		{t('diffStats_showFiles')}
	</label>
	<label class="check">
		<input type="checkbox" bind:checked={settings.showSizeLabel} onchange={onsave}>
		{t('diffStats_showSize')}
	</label>
	<div class="thresholds">
		{#each labels as label, index (label)}
			<label>
				<strong>{label}</strong> ≤
				<input type="number" min="1" bind:value={settings.sizeThresholds[index]} onchange={onsave}>
			</label>
		{/each}
		<span class="muted">{t('diffStats_above', sizeLabels.at(-1)!)}</span>
	</div>
	<div class="preview">
		<span class="preview-title">{t('options_preview')}</span>
		<div class="pr-row">
			<strong>feat: open images in a modal on click</strong>
			<span class="mono success">+128</span>
			<span class="mono danger">−14</span>
			{#if settings.showChangedFiles}<span class="muted">{t('diffStats_previewFiles', 6)}</span>{/if}
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
