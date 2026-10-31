import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {insertTextIntoField} from 'text-field-edit';

import type {Feature} from '../feature-manager.js';
import {observe} from '../helpers/observe.js';
import {getOptions, type QuickComment} from '../options-storage.js';

// The classic form on PRs, the React composer on issues
const composers = '#new_comment_form, [data-testid="comment-composer"]';
const submitButtons =
	'button.btn-primary[type="submit"], [data-testid="markdown-editor-footer"] button[data-variant="primary"]';
const rowClass = 'supercharged-github-quick-comments';

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
	if (post) {
		(await waitForSubmitButton(composer)).click();
	}
}

function addButtons(composer: Element, comments: QuickComment[]): void {
	if (composer.previousElementSibling?.classList.contains(rowClass)) {
		return;
	}

	composer.before(
		<div className={rowClass} style={{display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px'}}>
			{comments.map((comment) => (
				<button
					type="button"
					className="btn btn-sm"
					title={`Post “${comment.body}”. Shift-click to insert it instead.`}
					onClick={(event) => {
						useComment(composer, comment, {insertOnly: event.shiftKey}).catch((error: unknown) => {
							console.error('supercharged-github: quick-comments failed', error);
						});
					}}
				>
					{comment.label}
				</button>
			))}
		</div>,
	);
}

const quickComments: Feature = {
	id: 'quick-comments',
	description:
		'Buttons above the comment box that post a predefined comment in one click. Shift-click inserts it instead.',
	include: [pageDetect.isIssue, pageDetect.isPRConversation],
	async init(signal) {
		const scope = pageDetect.isIssue() ? 'issues' : 'prs';
		const comments = (await getOptions()).quickComments.filter(({on}) => on === 'both' || on === scope);
		if (comments.length === 0) {
			return;
		}

		observe(
			composers,
			(elements) => {
				for (const composer of elements) {
					addButtons(composer, comments);
				}
			},
			{signal},
		);
	},
};

export default quickComments;
