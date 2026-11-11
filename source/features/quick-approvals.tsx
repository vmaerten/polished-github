import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import type {Feature} from '../feature-manager.js';
import {v4} from '../github-helpers/api.js';
import {mutedColor} from '../github-helpers/colors.js';
import {observe} from '../helpers/observe.js';
import {t} from '../helpers/i18n.js';
import {getOptions, type QuickApproval} from '../options-storage.js';

// The review button of the sticky header on the new PR pages, and the title actions of the classic one
const newAnchors = 'button[class*="ReviewMenuButton"]';
const classicAnchors = '.gh-header-actions';
const groupClass = 'polished-github-quick-approvals';
const menuId = `${groupClass}-menu`;
const menuWidth = 280;

type PullRequest = {id: string; state: string; viewerDidAuthor: boolean};

async function fetchPullRequest(owner: string, name: string, number: number): Promise<PullRequest> {
	const {repository} = await v4<{repository: {pullRequest: PullRequest}}>(
		`query($owner: String!, $name: String!, $number: Int!) {
			repository(owner: $owner, name: $name) {pullRequest(number: $number) {id state viewerDidAuthor}}
		}`,
		{owner, name, number},
	);
	return repository.pullRequest;
}

async function approve(pullRequestId: string, body: string): Promise<void> {
	await v4(
		`mutation($id: ID!, $body: String) {
			addPullRequestReview(input: {pullRequestId: $id, event: APPROVE, body: $body}) {clientMutationId}
		}`,
		{id: pullRequestId, body},
	);
}

function explain(error: unknown): string {
	const message = error instanceof Error ? error.message : String(error);
	// What GitHub answers to a token that can only read pull requests
	return /not accessible by/i.test(message) ? t('quickApprovals_needsWrite') : message;
}

// Primer's legacy `.btn` classes render taller than the React buttons of the new pages: match these with their variables
const buttonStyle = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: '4px',
	boxSizing: 'border-box',
	height: '28px',
	padding: '0 8px',
	border: '1px solid var(--button-default-borderColor-rest, #d1d9e0)',
	background: 'var(--button-default-bgColor-rest, #f6f8fa)',
	color: 'var(--button-default-fgColor-rest, #25292e)',
	font: 'inherit',
	fontSize: '12px',
	fontWeight: '500',
	lineHeight: '1',
	cursor: 'pointer',
} as const;

function highlightOnHover(element: HTMLElement, hover: string, rest: string): void {
	element.addEventListener('mouseenter', () => {
		element.style.background = hover;
	});
	element.addEventListener('mouseleave', () => {
		element.style.background = rest;
	});
}

function createGroup(pullRequestId: string, approvals: QuickApproval[]): HTMLElement {
	const withoutMessage = {label: t('quickApprovals_withoutMessage'), body: ''};
	const choices = [...approvals, withoutMessage];
	const icon = (
		<span style={{display: 'inline-flex', color: 'var(--fgColor-success, #1a7f37)'}}>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
			</svg>
		</span>
	) as HTMLElement;
	const label = <span>{t('quickApprovals_approve')}</span>;
	// A click opens the menu rather than approving, so that no plain click approves by accident
	const button = (
		<button
			type="button"
			aria-haspopup="menu"
			title={t('quickApprovals_hint', navigator.platform.startsWith('Mac') ? '⌘' : 'Ctrl')}
			style={{...buttonStyle, borderRadius: '6px'}}
		>
			{icon}
			{label}
			<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z" />
			</svg>
		</button>
	) as HTMLElement;
	// A popover, in the top layer: the sticky header of the new pages clips what overflows it
	const menu = (
		<div
			id={menuId}
			role="menu"
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
				textAlign: 'left',
			}}
		>
			<div style={{padding: '4px 8px 6px', fontSize: '12px', fontWeight: '600', color: mutedColor}}>
				{t('quickApprovals_approveWith')}
			</div>
		</div>
	) as HTMLElement;
	const group = (
		<div className={groupClass} style={{display: 'inline-flex', flex: 'none', marginLeft: '8px'}}>
			{button}
			{menu}
		</div>
	) as HTMLElement;

	highlightOnHover(
		button,
		'var(--button-default-bgColor-hover, #eff2f5)',
		'var(--button-default-bgColor-rest, #f6f8fa)',
	);

	// Set as attributes: the JSX types predate the popover API
	menu.setAttribute('popover', 'auto');
	button.setAttribute('popovertarget', menuId);
	menu.addEventListener('beforetoggle', (event) => {
		if (event.newState === 'open') {
			const {bottom, right} = button.getBoundingClientRect();
			menu.style.top = `${bottom + 4}px`;
			menu.style.left = `${right - menuWidth}px`;
		}
	});

	const run = async (choice: QuickApproval): Promise<void> => {
		button.toggleAttribute('disabled', true);
		group.style.opacity = '0.6';
		label.textContent = t('quickApprovals_approving');
		try {
			await approve(pullRequestId, choice.body);
			label.textContent = t('quickApprovals_approved');
			button.title = '';
			group.style.opacity = '';
		} catch (error) {
			console.error('polished-github: quick-approvals failed', error);
			label.textContent = t('quickApprovals_failed');
			icon.style.color = 'var(--fgColor-danger, #d1242f)';
			button.title = explain(error);
			button.toggleAttribute('disabled', false);
			group.style.opacity = '';
		}
	};

	for (const choice of choices) {
		const item = (
			<button
				type="button"
				role="menuitem"
				style={{
					display: 'block',
					width: '100%',
					padding: '6px 8px',
					border: '0',
					borderRadius: '6px',
					background: 'none',
					color: choice.body === '' ? mutedColor : 'inherit',
					font: 'inherit',
					fontSize: '13px',
					textAlign: 'left',
					cursor: 'pointer',
				}}
				onClick={() => void run(choice)}
			>
				{choice.label}
				{choice.body && choice.body !== choice.label ? (
					<span style={{display: 'block', fontSize: '12px', color: mutedColor}}>{choice.body}</span>
				) : null}
			</button>
		) as HTMLElement;
		item.setAttribute('popovertarget', menuId);
		item.setAttribute('popovertargetaction', 'hide');
		highlightOnHover(item, 'var(--bgColor-neutral-muted, #818b981f)', 'none');
		menu.append(item);
	}

	button.addEventListener('click', (event) => {
		if (event.metaKey || event.ctrlKey) {
			// A cancelled click leaves the menu closed
			event.preventDefault();
			void run(withoutMessage);
		}
	});
	return group;
}

const quickApprovals: Feature = {
	id: 'quick-approvals',
	description: t('feature_quickApprovals'),
	include: [pageDetect.isPR],
	requiresToken: true,
	async init(signal) {
		// The header can outlive a navigation to another PR: never leave a button bound to the previous one
		for (const group of document.querySelectorAll(`.${groupClass}`)) {
			group.remove();
		}

		const {owner, name, path} = pageDetect.utils.getRepositoryInfo()!;
		const number = Number(/^pull\/(\d+)/.exec(path)![1]);
		const [{quickApprovals: approvals}, pullRequest] = await Promise.all([
			getOptions(),
			fetchPullRequest(owner, name, number),
		]);
		// GitHub refuses an approval from the author, and of a closed or merged PR
		if (pullRequest.state !== 'OPEN' || pullRequest.viewerDidAuthor) {
			return;
		}

		observe(
			`${newAnchors}, ${classicAnchors}`,
			(elements) => {
				if (document.querySelector(`.${groupClass}`)) {
					return;
				}

				const group = createGroup(pullRequest.id, approvals);
				const anchor = elements.find((element) => element.matches(newAnchors)) ?? elements[0];
				if (anchor.matches(newAnchors)) {
					anchor.before(group);
				} else {
					group.style.margin = '0 8px 0 0';
					anchor.prepend(group);
				}
			},
			{signal},
		);
	},
};

export default quickApprovals;
