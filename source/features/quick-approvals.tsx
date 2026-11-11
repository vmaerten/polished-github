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

function titleFor({body}: QuickApproval): string {
	return body === '' ? t('quickApprovals_titleEmpty') : t('quickApprovals_title', body);
}

function createGroup(pullRequestId: string, approvals: QuickApproval[], signal: AbortSignal): HTMLElement {
	const choices = [...approvals, {label: t('quickApprovals_withoutMessage'), body: ''}];
	const icon = (
		<span style={{display: 'inline-flex', color: 'var(--fgColor-success, #1a7f37)'}}>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
			</svg>
		</span>
	) as HTMLElement;
	const label = <span>{t('quickApprovals_approve')}</span>;
	const main = (
		<button type="button" className="btn btn-sm BtnGroup-item" title={titleFor(choices[0])}>
			{icon}
			{label}
		</button>
	) as HTMLElement;
	const toggle = (
		<button
			type="button"
			className="btn btn-sm BtnGroup-item"
			aria-haspopup="menu"
			aria-expanded="false"
			aria-label={t('quickApprovals_choose')}
		>
			▾
		</button>
	) as HTMLElement;
	const menu = (
		<div
			role="menu"
			hidden
			style={{
				position: 'absolute',
				top: 'calc(100% + 4px)',
				right: '0',
				zIndex: '100',
				width: '280px',
				padding: '6px',
				border: '1px solid var(--borderColor-default, #d1d9e0)',
				borderRadius: '12px',
				background: 'var(--overlay-bgColor, #fff)',
				boxShadow: 'var(--shadow-floating-large, 0 8px 24px rgba(0, 0, 0, 0.2))',
				textAlign: 'left',
			}}
		>
			<div style={{padding: '4px 8px 6px', fontSize: '12px', fontWeight: '600', color: mutedColor}}>
				{t('quickApprovals_approveWith')}
			</div>
		</div>
	) as HTMLElement;
	const group = (
		<div
			className={`${groupClass} BtnGroup`}
			style={{position: 'relative', display: 'inline-flex', marginRight: '8px'}}
		>
			{main}
			{toggle}
			{menu}
		</div>
	) as HTMLElement;

	const setOpen = (open: boolean): void => {
		menu.hidden = !open;
		toggle.setAttribute('aria-expanded', String(open));
	};

	const run = async (choice: QuickApproval): Promise<void> => {
		setOpen(false);
		main.toggleAttribute('disabled', true);
		toggle.toggleAttribute('disabled', true);
		label.textContent = t('quickApprovals_approving');
		try {
			await approve(pullRequestId, choice.body);
			label.textContent = t('quickApprovals_approved');
			main.title = '';
		} catch (error) {
			console.error('polished-github: quick-approvals failed', error);
			label.textContent = t('quickApprovals_failed');
			icon.style.color = 'var(--fgColor-danger, #d1242f)';
			main.title = explain(error);
			main.toggleAttribute('disabled', false);
			toggle.toggleAttribute('disabled', false);
		}
	};

	for (const choice of choices) {
		menu.append(
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
				onMouseEnter={(event) => {
					event.currentTarget.style.background = 'var(--bgColor-neutral-muted, #818b981f)';
				}}
				onMouseLeave={(event) => {
					event.currentTarget.style.background = 'none';
				}}
			>
				{choice.label}
				{choice.body && choice.body !== choice.label ? (
					<span style={{display: 'block', fontSize: '12px', color: mutedColor}}>{choice.body}</span>
				) : null}
			</button>,
		);
	}

	main.addEventListener('click', () => void run(choices[0]));
	toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
	group.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			setOpen(false);
			toggle.focus();
		}
	});
	document.addEventListener(
		'click',
		(event) => {
			if (!group.contains(event.target as Node)) {
				setOpen(false);
			}
		},
		{signal},
	);
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

				const group = createGroup(pullRequest.id, approvals, signal);
				const anchor = elements.find((element) => element.matches(newAnchors)) ?? elements[0];
				if (anchor.matches(newAnchors)) {
					anchor.before(group);
				} else {
					anchor.prepend(group);
				}
			},
			{signal},
		);
	},
};

export default quickApprovals;
