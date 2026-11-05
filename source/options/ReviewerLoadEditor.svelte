<script lang="ts">
	import type {ReviewerLoadSettings} from '../options-storage.js';
	import {t} from '../helpers/i18n.js';

	let {settings = $bindable(), onsave}: {settings: ReviewerLoadSettings; onsave: () => void} = $props();
</script>

<div class="editor">
	<label class="check">
		<input type="checkbox" bind:checked={settings.directOnly} onchange={onsave}>
		{t('reviewerLoad_directOnly')}
	</label>
	<p class="muted small">{t('reviewerLoad_directOnlyHelp')}</p>
</div>
