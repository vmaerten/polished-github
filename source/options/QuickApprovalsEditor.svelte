<script lang="ts">
	import type {QuickApproval} from '../options-storage.js';
	import {t} from '../helpers/i18n.js';

	// The other features only read: this one needs write access, so it gets its own token link
	const writeTokenUrl =
		'https://github.com/settings/personal-access-tokens/new?name=Polished+GitHub&description=Lets+the+Polished+GitHub+browser+extension+read+and+approve+pull+requests&pull_requests=write';

	let {approvals = $bindable(), onsave}: {approvals: QuickApproval[]; onsave: () => void} = $props();

	function move(index: number, step: number): void {
		const [approval] = approvals.splice(index, 1);
		approvals.splice(index + step, 0, approval);
		onsave();
	}

	function remove(index: number): void {
		approvals.splice(index, 1);
		onsave();
	}

	function add(): void {
		approvals.push({label: t('quickComments_newLabel'), body: t('quickApprovals_newBody')});
		onsave();
	}
</script>

<div class="editor">
	<p class="muted small">
		{t('quickApprovals_tokenHelp')}
		<a href={writeTokenUrl} target="_blank" rel="noopener noreferrer">{t('quickApprovals_createToken')}</a>
	</p>
	{#each approvals as approval, index (index)}
		<div class="approval-row">
			<input aria-label={t('quickComments_label')} bind:value={approval.label} onchange={onsave}>
			<input aria-label={t('quickApprovals_message')} class="mono" bind:value={approval.body} onchange={onsave}>
			<div class="actions">
				<button type="button" class="icon" aria-label={t('quickComments_moveUp')} disabled={index === 0} onclick={() => move(index, -1)}>↑</button>
				<button
					type="button"
					class="icon"
					aria-label={t('quickComments_moveDown')}
					disabled={index === approvals.length - 1}
					onclick={() => move(index, 1)}
				>↓</button>
				<button type="button" class="icon" aria-label={t('quickComments_remove')} onclick={() => remove(index)}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
				</button>
			</div>
		</div>
	{/each}
	<button type="button" class="secondary" onclick={add}>{t('quickApprovals_add')}</button>
	<div class="preview">
		<span class="preview-title">{t('options_preview')}</span>
		<div class="preview-buttons">
			{#each approvals as approval, index (index)}
				<span class="chip">✓ {approval.label}</span>
			{/each}
			<span class="chip muted">{t('quickApprovals_withoutMessage')}</span>
		</div>
	</div>
</div>

<style>
	.approval-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto;
		gap: 8px;
		align-items: center;
	}

	.actions {
		display: flex;
	}

	@media (max-width: 640px) {
		.approval-row {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.approval-row .mono {
			grid-column: 1 / -1;
			grid-row: 2;
		}
	}
</style>
