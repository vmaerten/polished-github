import {expect, test} from 'vitest';

import {addTitleBadge, type TitleBadgeClass} from './pr-list.js';

function badge(className: TitleBadgeClass): HTMLElement {
	const element = document.createElement('span');
	element.className = className;
	return element;
}

test('keeps badges in a fixed order whichever arrives first, once each', () => {
	document.body.innerHTML = '<div><h3>PR</h3></div>';
	const title = document.querySelector('h3')!;

	addTitleBadge(title, 'github-power-stale', badge('github-power-stale'));
	addTitleBadge(title, 'github-power-diff-stats', badge('github-power-diff-stats'));
	addTitleBadge(title, 'github-power-review-status', badge('github-power-review-status'));
	addTitleBadge(title, 'github-power-diff-stats', badge('github-power-diff-stats'));

	expect([...title.querySelector('.github-power-title-badges')!.children].map((child) => child.className)).toEqual([
		'github-power-diff-stats',
		'github-power-review-status',
		'github-power-stale',
	]);
});
