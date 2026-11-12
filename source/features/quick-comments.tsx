import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {insertTextIntoField} from 'text-field-edit';

import type {Feature} from '../feature-manager.js';
import {type Emojis, getEmojis, renderEmoji, renderEmojiText} from '../github-helpers/emoji.js';
import {observe} from '../helpers/observe.js';
import {t} from '../helpers/i18n.js';
import {getOptions, type QuickComment} from '../options-storage.js';

// The classic form on PRs, the React composer on issues, and the one of the new PR overview page
const composers = '#new_comment_form, [data-testid="comment-composer"], form[aria-label="Add comment form"]';
const submitButtons =
	'button.btn-primary[type="submit"], [data-testid="markdown-editor-footer"] button[data-variant="primary"]';
const rowClass = 'polished-github-quick-comments';

function isEnabled(button: HTMLButtonElement): boolean {
	return !button.disabled && button.getAttribute('aria-disabled') !== 'true';
}

// GitHub enables the button once it has processed the input, and React may swap it for a new one meanwhile
async function waitForSubmitButton(composer: Element): Promise<HTMLButtonElement> {
	for (let attempt = 0; attempt < 40; attempt++) {
		const button = composer.querySelector<HTMLButtonElement>(submitButtons);
		if (button && isEnabled(button)) {
			return button;
		}

		// oxlint-disable-next-line no-await-in-loop -- Polling, one attempt at a time
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	throw new Error('The comment button never became enabled');
}

async function useComment(composer: Element, {body}: QuickComment, {insertOnly}: {insertOnly: boolean}): Promise<void> {
	const field = composer.querySelector('textarea');
	if (!field) {
		throw new Error('Comment field not found');
	}

	// Never send a draft along: with text already typed, insert instead of posting
	const post = !insertOnly && field.value.trim() === '';
	insertTextIntoField(field, body);
	if (!post) {
		return;
	}

	const inserted = field.value;
	const button = await waitForSubmitButton(composer);
	// Text typed while GitHub enabled the button would go out with the comment: leave it all for the user to send
	if (field.value === inserted) {
		button.click();
	}
}

function addButtons(composer: Element, comments: QuickComment[], emojis: Emojis): void {
	if (composer.previousElementSibling?.classList.contains(rowClass)) {
		return;
	}

	composer.before(
		<div className={rowClass} style={{display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px'}}>
			{comments.map((comment) => (
				<button
					type="button"
					className="btn btn-sm"
					title={`Post “${renderEmojiText(comment.body, emojis)}”. Shift-click to insert it instead.`}
					onClick={(event) => {
						useComment(composer, comment, {insertOnly: event.shiftKey}).catch((error: unknown) => {
							console.error('polished-github: quick-comments failed', error);
						});
					}}
				>
					{renderEmoji(comment.label, emojis)}
				</button>
			))}
		</div>,
	);
}

const quickComments: Feature = {
	id: 'quick-comments',
	description: t('feature_quickComments'),
	include: [pageDetect.isIssue, pageDetect.isPRConversation],
	async init(signal) {
		const scope = pageDetect.isIssue() ? 'issues' : 'prs';
		const comments = (await getOptions()).quickComments.filter(({on}) => on === 'both' || on === scope);
		if (comments.length === 0) {
			return;
		}

		const emojis = await getEmojis();

		observe(
			composers,
			(elements) => {
				for (const composer of elements) {
					addButtons(composer, comments, emojis);
				}
			},
			{signal},
		);
	},
};

export default quickComments;
