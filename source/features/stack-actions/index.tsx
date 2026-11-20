import * as pageDetect from 'github-url-detection';

import type {Feature} from '../../feature-manager.js';
import {t} from '../../helpers/i18n.js';
import {addStackReady, dialogClass, toggleClass} from './ready-for-review.js';
import {addStackReviewers, footerClass} from './stack-reviewers.js';
import {fetchStack} from './stack.js';

const stackActions: Feature = {
	id: 'stack-actions',
	description: t('feature_stackActions'),
	include: [pageDetect.isPRConversation],
	requiresToken: true,
	async init(signal) {
		// The page can outlive a navigation to another PR: never leave a control bound to the previous stack
		for (const element of document.querySelectorAll(`.${toggleClass}, .${dialogClass}, .${footerClass}`)) {
			element.remove();
		}

		const {owner, name, path} = pageDetect.utils.getRepositoryInfo()!;
		const number = Number(/^pull\/(\d+)/.exec(path)![1]);
		const stack = await fetchStack(owner, name, number);
		if (stack.length < 2) {
			return;
		}

		addStackReady(stack, number, signal);
		addStackReviewers(stack, number, signal);
	},
};

export default stackActions;
