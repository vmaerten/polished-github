<script lang="ts">
	import type {QuickComment} from '../options-storage.js';

	let {comments = $bindable(), onsave}: {comments: QuickComment[]; onsave: () => void} = $props();

	const scopes: Array<{value: QuickComment['on']; label: string}> = [
		{value: 'prs', label: 'PRs'},
		{value: 'issues', label: 'Issues'},
		{value: 'both', label: 'Both'},
	];

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
			<div class="segmented" role="radiogroup" aria-label="Show on">
				{#each scopes as scope (scope.value)}
					<label class:selected={comment.on === scope.value}>
						<input type="radio" name="on-{index}" value={scope.value} bind:group={comment.on} onchange={onsave}>
						{scope.label}
					</label>
				{/each}
			</div>
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
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto auto;
		gap: 8px;
		align-items: center;
	}

	.actions {
		display: flex;
	}

	.segmented {
		display: flex;
		height: 36px;
		box-sizing: border-box;
		border: 1px solid var(--border);
		border-radius: 6px;
		overflow: hidden;
	}

	.segmented label {
		position: relative;
		display: flex;
		align-items: center;
		padding: 0 10px;
		font-size: 13px;
		color: var(--muted);
		cursor: pointer;
	}

	.segmented label + label {
		border-left: 1px solid var(--border);
	}

	.segmented label.selected {
		background: var(--accent-emphasis);
		color: #fff;
		font-weight: 600;
	}

	.segmented label:has(input:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}

	/* Visually hidden but still focusable with the keyboard */
	.segmented input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	@media (max-width: 640px) {
		.comment-row {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.comment-row .mono {
			grid-column: 1 / -1;
			grid-row: 2;
		}
	}
</style>
