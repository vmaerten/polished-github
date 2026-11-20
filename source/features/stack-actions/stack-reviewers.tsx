import React from 'dom-chef';

import {mutedColor} from '../../github-helpers/colors.js';
import {showToast} from '../../github-helpers/toast.js';
import {t} from '../../helpers/i18n.js';
import {observe} from '../../helpers/observe.js';
import {canEdit, requestReviewers, runOnStack, type StackPullRequest} from './stack.js';

// The React picker of the new PR overview page, as reviewer-load finds it
const reviewerPanel = '[class*="SelectPanel-Overlay"]:has([class*="reviewerOptionLogin"])';
// `data-id` holds the login, or `org/team` for a team
const options = '[role="option"][data-id]';
export const footerClass = 'polished-github-stack-reviewers';

/**
 * Follows what the user picks while the panel is open: a row's state when first seen is what GitHub had already
 * requested, so the ones that turned selected since are the reviewers added now.
 */
function trackAdded(panel: Element): () => string[] {
	const states = new Map<string, {initial: boolean; now: boolean}>();
	const scan = (): void => {
		for (const option of panel.querySelectorAll<HTMLElement>(options)) {
			const selected = option.getAttribute('aria-selected') === 'true';
			const state = states.get(option.dataset.id!);
			if (state) {
				state.now = selected;
			} else {
				states.set(option.dataset.id!, {initial: selected, now: selected});
			}
		}
	};

	scan();
	const observer = new MutationObserver(scan);
	observer.observe(panel, {childList: true, subtree: true, attributes: true, attributeFilter: ['aria-selected']});
	return () => {
		observer.disconnect();
		// The last changes can still wait in the observer's queue
		scan();
		return [...states].filter(([, {initial, now}]) => now && !initial).map(([reviewer]) => reviewer);
	};
}

function createFooter(others: StackPullRequest[]): {footer: HTMLElement; checkbox: HTMLInputElement} {
	const checkbox = (<input type="checkbox" style={{margin: '2px 0 0'}} />) as HTMLElement as HTMLInputElement;
	const footer = (
		<label
			className={footerClass}
			style={{
				display: 'flex',
				gap: '8px',
				alignItems: 'flex-start',
				padding: '10px 12px',
				borderTop: '1px solid var(--borderColor-default, #d1d9e0)',
				fontSize: '12px',
				cursor: 'pointer',
			}}
		>
			{checkbox}
			<span>
				{t('stackActions_alsoOnStack')}
				<span style={{display: 'block', color: mutedColor}}>
					{others.map((pullRequest) => `#${pullRequest.number}`).join(', ')} · Polished GitHub
				</span>
			</span>
		</label>
	) as HTMLElement;
	return {footer, checkbox};
}

async function requestOnStack(others: StackPullRequest[], reviewers: string[]): Promise<void> {
	const toast = showToast(t('stackActions_requesting', 1, others.length));
	await runOnStack(others, async (pullRequest) => requestReviewers(pullRequest, reviewers), toast, {
		progress: (done, total) => t('stackActions_requesting', done, total),
		done: t('stackActions_requested', reviewers.join(', ')),
	});
}

/** Adds a checkbox to the reviewers picker that requests the reviewers added there on the rest of the stack too. */
export function addStackReviewers(stack: StackPullRequest[], current: number, signal: AbortSignal): void {
	const others = stack.filter((pullRequest) => pullRequest.number !== current && canEdit(pullRequest));
	if (others.length === 0) {
		return;
	}

	observe(
		reviewerPanel,
		(panels) => {
			for (const panel of panels) {
				const {footer, checkbox} = createFooter(others);
				(panel.querySelector('[class*="SelectPanel-Wrapper"]') ?? panel).append(footer);
				const added = trackAdded(panel);

				// GitHub saves the picked reviewers when the panel closes, which unmounts it
				const closing = new MutationObserver(() => {
					if (panel.isConnected) {
						return;
					}

					closing.disconnect();
					const reviewers = added();
					if (checkbox.checked && reviewers.length > 0) {
						void requestOnStack(others, reviewers);
					}
				});
				closing.observe(document.body, {childList: true, subtree: true});
				signal.addEventListener('abort', () => closing.disconnect(), {once: true});
			}
		},
		{signal},
	);
}
