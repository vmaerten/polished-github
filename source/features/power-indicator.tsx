import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {elementExists} from 'select-dom';

import type {Feature} from '../feature-manager.js';

async function init(signal: AbortSignal): Promise<void> {
	const repoName = await elementReady('[data-testid="repo-name-wrapper"]', {signal, stopOnDomReady: false});
	if (!repoName || elementExists('.github-power-indicator')) {
		return;
	}

	repoName.after(
		<span className="Label Label--secondary github-power-indicator" title="github-power is running">
			github-power
		</span>,
	);
}

const powerIndicator: Feature = {
	id: 'power-indicator',
	description: 'Demo feature: tags the repository name to show the extension is running.',
	include: [pageDetect.isRepo],
	init,
};

export default powerIndicator;
