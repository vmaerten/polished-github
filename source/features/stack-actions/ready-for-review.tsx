import React from 'dom-chef';

import {mutedColor} from '../../github-helpers/colors.js';
import {showToast} from '../../github-helpers/toast.js';
import {t} from '../../helpers/i18n.js';
import {observe} from '../../helpers/observe.js';
import {canEdit, markReady, runOnStack, type StackPullRequest} from './stack.js';

// The Ready for review button of the merge box on the new PR pages, not the item of the same name in the sidebar
const readyButton = 'button[data-component="Button"][data-dd-action-name="pull_requests.lifecycle.mark_ready"]';
export const toggleClass = 'polished-github-stack-ready';
export const dialogClass = 'polished-github-stack-ready-dialog';
const menuId = `${toggleClass}-menu`;
const menuWidth = 300;

function isReadyCandidate(pullRequest: StackPullRequest): boolean {
	return pullRequest.isDraft && canEdit(pullRequest);
}

function rowDetail(pullRequest: StackPullRequest, current: number): string {
	if (pullRequest.state === 'MERGED') {
		return t('stackActions_merged');
	}

	if (pullRequest.state === 'CLOSED') {
		return t('stackActions_closed');
	}

	if (!pullRequest.viewerCanUpdate) {
		return t('stackActions_cannotEdit');
	}

	if (!pullRequest.isDraft) {
		return t('stackActions_alreadyOpen');
	}

	return pullRequest.number === current ? t('stackActions_thisOne') : '';
}

const menuItemStyle = {
	display: 'block',
	width: '100%',
	padding: '6px 8px',
	border: '0',
	borderRadius: '6px',
	background: 'none',
	color: 'inherit',
	font: 'inherit',
	fontSize: '13px',
	textAlign: 'left',
	cursor: 'pointer',
} as const;

function highlightOnHover(element: HTMLElement): void {
	element.addEventListener('mouseenter', () => {
		element.style.background = 'var(--bgColor-neutral-muted, #818b981f)';
	});
	element.addEventListener('mouseleave', () => {
		element.style.background = 'none';
	});
}

async function markStackReady(pullRequests: StackPullRequest[]): Promise<void> {
	const toast = showToast(t('stackActions_marking', 1, pullRequests.length));
	await runOnStack(pullRequests, markReady, toast, {
		progress: (done, total) => t('stackActions_marking', done, total),
		done: t('stackActions_marked'),
	});
}

function openDialog(stack: StackPullRequest[], current: number): void {
	document.querySelector(`.${dialogClass}`)?.remove();

	const confirm = (
		<button type="button" className="Button Button--primary Button--medium">
			<span className="Button-label" />
		</button>
	) as HTMLElement as HTMLButtonElement;
	const checkboxes = new Map<StackPullRequest, HTMLInputElement>();
	const selected = (): StackPullRequest[] => stack.filter((pullRequest) => checkboxes.get(pullRequest)?.checked);
	const updateConfirm = (): void => {
		const count = selected().length;
		confirm.querySelector('.Button-label')!.textContent = t('stackActions_confirm', count);
		confirm.disabled = count === 0;
	};

	// Listed as GitHub's stack popover lists them, the top of the stack first
	const rows = stack.toReversed().map((pullRequest) => {
		const candidate = isReadyCandidate(pullRequest);
		const checkbox = (
			<input type="checkbox" checked={candidate} disabled={!candidate} onChange={updateConfirm} />
		) as HTMLElement as HTMLInputElement;
		checkboxes.set(pullRequest, checkbox);
		const detail = rowDetail(pullRequest, current);
		return (
			<label
				style={{
					display: 'flex',
					gap: '10px',
					alignItems: 'flex-start',
					padding: '6px 16px',
					opacity: candidate ? '1' : '0.6',
					cursor: candidate ? 'pointer' : 'default',
				}}
			>
				{checkbox}
				<span style={{minWidth: '0'}}>
					<span
						style={{
							display: 'block',
							overflow: 'hidden',
							fontWeight: '600',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{pullRequest.title}
					</span>
					<span style={{fontSize: '12px', color: mutedColor}}>
						#{pullRequest.number}
						{detail ? ` · ${detail}` : ''}
					</span>
				</span>
			</label>
		);
	});

	const dialog = (
		<dialog
			className={dialogClass}
			aria-labelledby={`${dialogClass}-title`}
			style={{
				width: 'min(560px, calc(100vw - 32px))',
				padding: '0',
				border: '1px solid var(--borderColor-default, #d1d9e0)',
				borderRadius: '12px',
				background: 'var(--overlay-bgColor, #fff)',
				boxShadow: 'var(--shadow-floating-large, 0 8px 24px rgba(0, 0, 0, 0.2))',
				color: 'var(--fgColor-default, #1f2328)',
				fontSize: '14px',
			}}
		>
			<h2
				id={`${dialogClass}-title`}
				style={{
					margin: '0',
					padding: '14px 16px',
					borderBottom: '1px solid var(--borderColor-default, #d1d9e0)',
					fontSize: '14px',
				}}
			>
				{t('stackActions_dialogTitle')}
			</h2>
			<div style={{maxHeight: '50vh', overflowY: 'auto', padding: '6px 0'}}>{rows}</div>
			<p style={{margin: '0 16px 12px', fontSize: '12px', color: mutedColor}}>{t('stackActions_dialogNote')}</p>
			<div
				style={{
					display: 'flex',
					gap: '8px',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '12px 16px',
					borderTop: '1px solid var(--borderColor-default, #d1d9e0)',
				}}
			>
				<span style={{flex: '1', fontSize: '10px', color: mutedColor}}>Polished GitHub</span>
				<button
					type="button"
					className="Button Button--secondary Button--medium"
					onClick={() => {
						dialog.close();
					}}
				>
					<span className="Button-label">{t('stackActions_cancel')}</span>
				</button>
				{confirm}
			</div>
		</dialog>
	) as HTMLElement as HTMLDialogElement;

	confirm.addEventListener('click', () => {
		// In the order of the stack, from its bottom
		const chosen = selected();
		dialog.close();
		void markStackReady(chosen);
	});
	dialog.addEventListener('close', () => {
		dialog.remove();
	});
	updateConfirm();
	document.body.append(dialog);
	dialog.showModal();
}

function createToggle(button: HTMLElement, stack: StackPullRequest[], current: number): HTMLElement {
	const drafts = stack.filter((pullRequest) => isReadyCandidate(pullRequest));
	const toggle = (
		<button
			type="button"
			className={toggleClass}
			aria-haspopup="menu"
			aria-label={t('stackActions_more')}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				boxSizing: 'border-box',
				height: `${button.offsetHeight || 28}px`,
				padding: '0 6px',
				marginLeft: '-1px',
				border: '1px solid var(--button-default-borderColor-rest, #d1d9e0)',
				borderRadius: '0 6px 6px 0',
				background: 'var(--button-default-bgColor-rest, #f6f8fa)',
				color: 'var(--button-default-fgColor-rest, #25292e)',
				cursor: 'pointer',
			}}
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z" />
			</svg>
		</button>
	) as HTMLElement;

	const thisOne = (
		<button type="button" role="menuitem" style={menuItemStyle} onClick={() => button.click()}>
			{t('stackActions_thisPullRequest')}
			<span style={{display: 'block', fontSize: '12px', color: mutedColor}}>#{current}</span>
		</button>
	) as HTMLElement;
	const wholeStack = (
		<button type="button" role="menuitem" style={menuItemStyle} onClick={() => openDialog(stack, current)}>
			{t('stackActions_wholeStack')}
			<span style={{display: 'block', fontSize: '12px', color: mutedColor}}>
				{t('stackActions_draftRange', drafts.length, drafts[0].number, drafts.at(-1)!.number)}
			</span>
		</button>
	) as HTMLElement;
	// A popover, in the top layer, like the menu of quick-approvals
	const menu = (
		<div
			id={menuId}
			role="menu"
			className={toggleClass}
			style={{
				position: 'fixed',
				inset: 'auto',
				margin: '0',
				boxSizing: 'border-box',
				width: `${menuWidth}px`,
				padding: '6px',
				border: '1px solid var(--borderColor-default, #d1d9e0)',
				borderRadius: '12px',
				background: 'var(--overlay-bgColor, #fff)',
				boxShadow: 'var(--shadow-floating-large, 0 8px 24px rgba(0, 0, 0, 0.2))',
				color: 'var(--fgColor-default, #1f2328)',
			}}
		>
			{thisOne}
			{wholeStack}
		</div>
	) as HTMLElement;

	menu.setAttribute('popover', 'auto');
	toggle.setAttribute('popovertarget', menuId);
	for (const item of [thisOne, wholeStack]) {
		item.setAttribute('popovertarget', menuId);
		item.setAttribute('popovertargetaction', 'hide');
		highlightOnHover(item);
	}

	menu.addEventListener('beforetoggle', (event) => {
		if (event.newState === 'open') {
			const {bottom, right} = toggle.getBoundingClientRect();
			menu.style.top = `${bottom + 4}px`;
			menu.style.left = `${Math.max(8, right - menuWidth)}px`;
		}
	});

	document.body.append(menu);
	return toggle;
}

/** Turns the Ready for review button of a draft into a split button, whose menu marks the whole stack ready. */
export function addStackReady(stack: StackPullRequest[], current: number, signal: AbortSignal): void {
	if (stack.filter((pullRequest) => isReadyCandidate(pullRequest)).length < 2) {
		return;
	}

	observe(
		readyButton,
		([button]) => {
			if (document.querySelector(`button.${toggleClass}`)) {
				return;
			}

			const htmlButton = button as HTMLElement;
			// The button sits alone in a loading wrapper: lay the toggle beside it in there
			const wrapper = htmlButton.parentElement!;
			wrapper.style.display = 'inline-flex';
			htmlButton.style.borderTopRightRadius = '0';
			htmlButton.style.borderBottomRightRadius = '0';
			wrapper.append(createToggle(htmlButton, stack, current));
		},
		{signal},
	);
}
