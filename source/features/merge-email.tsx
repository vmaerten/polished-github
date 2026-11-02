import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {mutedColor} from '../github-helpers/colors.js';
import {t} from '../helpers/i18n.js';
import {observe} from '../helpers/observe.js';
import {getOptions, type MergeEmail} from '../options-storage.js';

// A native select controlled by React, shown once a merge or a squash is to be confirmed
const emailSelects = 'select[aria-label="Select commit author email"]';
const noteClass = 'polished-github-merge-email';

export function findEmail(rules: MergeEmail[], owner: string): string | undefined {
	const rule = rules.find((candidate) => candidate.owner.trim().toLowerCase() === owner.toLowerCase());
	return rule?.email.trim() || undefined;
}

// React keeps its own copy of the value: set it the way a user would, then tell React
function select(field: HTMLSelectElement, value: string): void {
	Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(field, value);
	field.dispatchEvent(new Event('change', {bubbles: true}));
}

function removeNote(field: HTMLSelectElement): void {
	field.parentElement?.parentElement?.querySelector(`.${noteClass}`)?.remove();
}

function addNote(field: HTMLSelectElement, text: string): void {
	removeNote(field);
	field.parentElement?.after(
		<p className={noteClass} style={{margin: '4px 0 0', fontSize: '12px', color: mutedColor}}>
			{text}
		</p>,
	);
}

const mergeEmail: Feature = {
	id: 'merge-email',
	description: t('feature_mergeEmail'),
	include: [pageDetect.isPRConversation],
	async init(signal) {
		const {owner} = pageDetect.utils.getRepositoryInfo()!;
		const email = findEmail((await getOptions()).mergeEmails, owner);
		if (!email) {
			return;
		}

		// The form is rendered again when switching between merge and squash: keep a choice made by hand
		let chosenByHand = false;
		document.addEventListener(
			'change',
			(event) => {
				if (event.isTrusted && event.target instanceof HTMLSelectElement && event.target.matches(emailSelects)) {
					chosenByHand = true;
					removeNote(event.target);
				}
			},
			{signal},
		);

		observe(
			emailSelects,
			(fields) => {
				for (const field of fields as HTMLSelectElement[]) {
					if (chosenByHand) {
						continue;
					}

					if (![...field.options].some((option) => option.value === email)) {
						addNote(field, `${email} is not a verified email of your account, so Polished GitHub left this as is.`);
						continue;
					}

					if (field.value !== email) {
						select(field, email);
					}

					addNote(field, `Set by Polished GitHub for ${owner}.`);
				}
			},
			{signal},
		);
	},
};

export default mergeEmail;
