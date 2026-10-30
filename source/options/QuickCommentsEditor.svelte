<script lang="ts">
	import type {QuickComment} from '../options-storage.js';

	let {comments = $bindable(), onsave}: {comments: QuickComment[]; onsave: () => void} = $props();

	function move(index: number, step: number): void {
		const [comment] = comments.splice(index, 1);
		comments.splice(index + step, 0, comment);
		onsave();
	}

	function remove(index: number): void {
		comments.splice(index, 1);
		onsave();
	}

	function add(): void {
		comments.push({label: 'New', body: 'New comment', on: 'both'});
		onsave();
	}
</script>

<div class="editor">
	{#each comments as comment, index (index)}
		<div class="comment-row">
			<input aria-label="Button label" bind:value={comment.label} onchange={onsave}>
			<input aria-label="Comment" class="mono" bind:value={comment.body} onchange={onsave}>
			<select aria-label="Show on" bind:value={comment.on} onchange={onsave}>
				<option value="prs">PRs</option>
				<option value="issues">Issues</option>
				<option value="both">Both</option>
			</select>
			<div class="actions">
				<button type="button" class="icon" aria-label="Move up" disabled={index === 0} onclick={() => move(index, -1)}>↑</button>
				<button
					type="button"
					class="icon"
					aria-label="Move down"
					disabled={index === comments.length - 1}
					onclick={() => move(index, 1)}
				>↓</button>
				<button type="button" class="icon" aria-label="Remove" onclick={() => remove(index)}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
				</button>
			</div>
		</div>
	{/each}
	<button type="button" class="secondary" onclick={add}>+ Add button</button>
	<div class="preview">
		<span class="preview-title">Preview</span>
		<div class="preview-buttons">
			{#each comments as comment, index (index)}
				<span class="chip">{comment.label}</span>
			{/each}
		</div>
	</div>
</div>

<style>
	.comment-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) 100px auto;
		gap: 8px;
		align-items: center;
	}

	.actions {
		display: flex;
	}

	@media (max-width: 640px) {
		.comment-row {
			grid-template-columns: minmax(0, 1fr) 100px;
		}

		.comment-row .mono {
			grid-column: 1 / -1;
			grid-row: 2;
		}
	}
</style>
