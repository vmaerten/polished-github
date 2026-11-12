import React from 'dom-chef';

import {t} from '../helpers/i18n.js';
import {mutedColor} from './colors.js';

const toastClass = 'polished-github-toast';
const displayTime = 3000;
// The length of Primer's Toast--animateOut
const animationTime = 180;

type Action = {label: string; url: string};

export type Toast = {
	succeed(message: string): void;
	/** Unlike a success, a failure stays until dismissed: the user has to read it. */
	fail(message: string, details: string, action?: Action): void;
};

function octicon(path: string): JSX.Element {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
			<path d={path} />
		</svg>
	);
}

const checkPath =
	'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z';
const stopPath =
	'M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z';
const xPath =
	'M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z';

function spinner(): JSX.Element {
	return (
		<svg className="Toast--spinner" viewBox="0 0 32 32" width="18" height="18" aria-hidden="true">
			<path fill="#959da5" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4" />
			<path fill="#ffffff" d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z" />
		</svg>
	);
}

const infoPath =
	'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z';

type Parts = {toast: HTMLElement; icon: HTMLElement; text: HTMLElement; content: HTMLElement};

// Without a state modifier, Primer's toast is the informational one
function mountToast(message: string, state: 'Toast--loading' | undefined, iconContent: JSX.Element): Parts {
	// A retry replaces the toast of the previous attempt rather than stacking on it
	for (const previous of document.querySelectorAll(`.${toastClass}`)) {
		previous.remove();
	}

	const icon = <span className="Toast-icon">{iconContent}</span>;
	const text = <span>{message}</span>;
	const content = (
		<span className="Toast-content" style={{padding: '8px 16px'}}>
			<div style={{marginBottom: '-0.3em', fontSize: '10px', color: mutedColor}}>Polished GitHub</div>
			{text}
		</span>
	);
	const toast = (
		<div
			role="log"
			className={[toastClass, 'Toast', state, 'Toast--animateIn'].filter(Boolean).join(' ')}
			style={{position: 'fixed', right: '0', bottom: '0', marginBottom: '32px', zIndex: '101'}}
		>
			{icon}
			{content}
		</div>
	);
	document.body.append(toast);
	return {toast, icon, text, content};
}

function dismiss(toast: HTMLElement): void {
	toast.classList.replace('Toast--animateIn', 'Toast--animateOut');
	// A timer rather than animationend, which never fires when the animations are disabled
	setTimeout(() => {
		toast.remove();
	}, animationTime);
}

function addDismissButton(toast: HTMLElement): void {
	toast.append(
		<button
			type="button"
			className="Toast-dismissButton"
			aria-label={t('toast_dismiss')}
			onClick={() => {
				dismiss(toast);
			}}
		>
			{octicon(xPath)}
		</button>,
	);
}

/** Shows Primer's toast, which GitHub's stylesheet defines, in a loading state until the returned toast settles. */
export function showToast(message: string): Toast {
	const {toast, icon, text, content} = mountToast(message, 'Toast--loading', spinner());

	const settle = (state: 'success' | 'error', iconPath: string, newMessage: string): void => {
		toast.classList.replace('Toast--loading', `Toast--${state}`);
		icon.replaceChildren(octicon(iconPath));
		text.textContent = newMessage;
	};

	return {
		succeed(newMessage) {
			settle('success', checkPath, newMessage);
			setTimeout(() => {
				dismiss(toast);
			}, displayTime);
		},
		fail(newMessage, details, action) {
			settle('error', stopPath, newMessage);
			content.append(
				<div style={{fontSize: '12px', color: mutedColor}}>
					{details}
					{action ? (
						<>
							{' '}
							<a href={action.url} target="_blank" rel="noreferrer">
								{action.label}
							</a>
						</>
					) : null}
				</div>,
			);
			addDismissButton(toast);
		},
	};
}

/** An informational toast that stays until dismissed. */
export function showNotice(message: string, action: Action): void {
	const {toast, content} = mountToast(message, undefined, octicon(infoPath));
	content.append(
		<div style={{fontSize: '12px'}}>
			<a href={action.url} target="_blank" rel="noreferrer">
				{action.label}
			</a>
		</div>,
	);
	addDismissButton(toast);
}
