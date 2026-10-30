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
			<select aria-label="Show on" bind:value={comment.on} onchange={onsave}>
				{#each scopes as scope (scope.value)}
					<option value={scope.value}>{scope.label}</option>
				{/each}
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
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto auto;
		gap: 8px;
		align-items: center;
	}

	.actions {
		display: flex;
	}

	/* Chrome draws a stylable select whose menu opens under it; other browsers keep the native one */
	select,
	::picker(select) {
		appearance: base-select;
	}

	select {
		display: inline-flex;
		align-items: center;
		box-sizing: border-box;
		min-width: 100px;
		min-height: 36px;
		padding: 0 8px 0 10px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
		font: inherit;
		cursor: pointer;
	}

	select:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: -1px;
	}

	select::picker-icon {
		color: var(--muted);
		transition: rotate 0.15s;
	}

	select:open::picker-icon {
		rotate: 180deg;
	}

	::picker(select) {
		margin-top: 4px;
		padding: 4px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		box-shadow: 0 8px 24px rgb(0 0 0 / 25%);
	}

	option {
		padding: 6px 10px;
		border-radius: 6px;
		color: var(--text);
	}

	option:hover,
	option:focus-visible {
		background: var(--canvas);
		outline: none;
	}

	option:checked {
		font-weight: 600;
	}

	option::checkmark {
		order: 1;
		margin-left: auto;
		color: var(--accent);
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
