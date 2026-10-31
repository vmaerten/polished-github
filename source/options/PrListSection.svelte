<script lang="ts">
	import type {BadgePlacement} from '../options-storage.js';

	let {placement = $bindable(), onsave}: {placement: BadgePlacement; onsave: () => void} = $props();
</script>

<section class="card">
	<div class="heading">
		<h2>PR list badges</h2>
		<p class="muted">Where the diff stats, your review status and idle time go in each row of the PR list.</p>
	</div>
	<div class="editor">
		<label class="check">
			<input type="radio" name="pr-list-badges" value="right" bind:group={placement} onchange={onsave}>
			In the right column, aligned from row to row
		</label>
		<label class="check">
			<input type="radio" name="pr-list-badges" value="metadata" bind:group={placement} onchange={onsave}>
			In the grey line under the title
		</label>
	</div>
</section>
