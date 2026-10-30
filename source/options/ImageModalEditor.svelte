<script lang="ts">
	import type {ImageModalSettings} from '../options-storage.js';

	let {settings = $bindable(), onsave}: {settings: ImageModalSettings; onsave: () => void} = $props();
</script>

<div class="editor">
	<label class="check">
		<input type="checkbox" bind:checked={settings.cycleImages} onchange={onsave}>
		Cycle through the comment's images with ← and →
	</label>
	<label class="check">
		<input type="checkbox" bind:checked={settings.zoom} onchange={onsave}>
		Zoom with the scroll wheel, drag to pan
	</label>
	<label class="check">
		<input type="checkbox" bind:checked={settings.includeLinkedImages} onchange={onsave}>
		Also open images that link elsewhere, like CI badges
	</label>
</div>
