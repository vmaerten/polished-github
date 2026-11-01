<script lang="ts">
	import type {ImageModalSettings} from '../options-storage.js';
	import {t} from '../helpers/i18n.js';

	let {settings = $bindable(), onsave}: {settings: ImageModalSettings; onsave: () => void} = $props();
</script>

<div class="editor">
	<label class="check">
		<input type="checkbox" bind:checked={settings.cycleImages} onchange={onsave}>
		{t('imageModal_cycle')}
	</label>
	<label class="check">
		<input type="checkbox" bind:checked={settings.zoom} onchange={onsave}>
		{t('imageModal_zoom')}
	</label>
	<label class="check">
		<input type="checkbox" bind:checked={settings.includeLinkedImages} onchange={onsave}>
		{t('imageModal_linked')}
	</label>
</div>
