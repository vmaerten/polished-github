<script lang="ts">
	import type {BadgePlacement} from '../options-storage.js';
	import {t} from '../helpers/i18n.js';

	let {placement = $bindable(), onsave}: {placement: BadgePlacement; onsave: () => void} = $props();
</script>

<section class="card">
	<div class="heading">
		<h2>{t('prList_title')}</h2>
		<p class="muted">{t('prList_description')}</p>
	</div>
	<div class="editor">
		<label class="check">
			<input type="radio" name="pr-list-badges" value="right" bind:group={placement} onchange={onsave}>
			{t('prList_right')}
		</label>
		<label class="check">
			<input type="radio" name="pr-list-badges" value="metadata" bind:group={placement} onchange={onsave}>
			{t('prList_metadata')}
		</label>
	</div>
</section>
