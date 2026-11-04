<script lang="ts">
	import type {MergeEmail} from '../options-storage.js';
	import {t} from '../helpers/i18n.js';
	import {getMergeEmailSuggestions, type MergeEmailSuggestions} from './merge-email-suggestions.js';

	let {rules = $bindable(), onsave}: {rules: MergeEmail[]; onsave: () => void} = $props();

	let suggestions = $state<MergeEmailSuggestions>({owners: [], emails: [], partial: false});
	void getMergeEmailSuggestions().then((found) => (suggestions = found));

	function remove(index: number): void {
		rules.splice(index, 1);
		onsave();
	}

	function add(): void {
		rules.push({owner: '', email: ''});
	}
</script>

<div class="editor">
	<p class="muted small">{t('mergeEmail_help')}</p>
	{#if suggestions.partial}
		<p class="muted small">{t('mergeEmail_suggestionsHelp')}</p>
	{/if}
	<datalist id="merge-email-owners">
		{#each suggestions.owners as owner (owner)}
			<option value={owner}></option>
		{/each}
	</datalist>
	<datalist id="merge-email-emails">
		{#each suggestions.emails as email (email)}
			<option value={email}></option>
		{/each}
	</datalist>
	{#each rules as rule, index (index)}
		<div class="rule-row">
			<input
				aria-label={t('mergeEmail_owner')}
				placeholder={t('mergeEmail_ownerPlaceholder')}
				list="merge-email-owners"
				bind:value={rule.owner}
				onchange={onsave}
			>
			<input
				type="email"
				aria-label={t('mergeEmail_email')}
				placeholder={t('mergeEmail_emailPlaceholder')}
				list="merge-email-emails"
				bind:value={rule.email}
				onchange={onsave}
			>
			<button type="button" class="icon" aria-label={t('mergeEmail_remove')} onclick={() => remove(index)}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
			</button>
		</div>
	{/each}
	<button type="button" class="secondary" onclick={add}>{t('mergeEmail_add')}</button>
</div>

<style>
	.rule-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto;
		gap: 8px;
		align-items: center;
	}
</style>
