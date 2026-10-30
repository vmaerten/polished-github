<script lang="ts">
	import type {StaleSettings} from '../options-storage.js';

	let {settings = $bindable(), onsave}: {settings: StaleSettings; onsave: () => void} = $props();
</script>

<div class="editor">
	<label>
		Flag PRs with no activity for
		<input type="number" min="1" bind:value={settings.days} onchange={onsave}>
		days or more
	</label>
	<label class="check">
		<input type="checkbox" bind:checked={settings.includeDrafts} onchange={onsave}>
		Also flag draft PRs
	</label>
</div>

<style>
	input[type='number'] {
		width: 72px;
		margin-inline: 4px;
	}
</style>
