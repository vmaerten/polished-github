<script lang="ts">
	import type {StaleSettings} from '../options-storage.js';
	import {t} from '../helpers/i18n.js';

	let {settings = $bindable(), onsave}: {settings: StaleSettings; onsave: () => void} = $props();
</script>

<div class="editor">
	<label>
		{t('idlePrs_before')}
		<input type="number" min="1" bind:value={settings.days} onchange={onsave}>
		{t('idlePrs_after')}
	</label>
	<label class="check">
		<input type="checkbox" bind:checked={settings.includeDrafts} onchange={onsave}>
		{t('idlePrs_drafts')}
	</label>
</div>

<style>
	input[type='number'] {
		width: 72px;
		margin-inline: 4px;
	}
</style>
