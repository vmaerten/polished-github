import {expect, test} from 'vitest';

import {addPullRequestBadge, type BadgeClass} from './pr-list.js';

function badge(className: BadgeClass): HTMLElement {
	const element = document.createElement('span');
	element.className = className;
	return element;
}

function setUpRow(): HTMLElement {
	document.body.innerHTML = `<ul><li>
		<div><h3>PR</h3></div>
		<div style="grid-area: main-content"><div class="metadata-line">#1 · opened</div></div>
		<div style="grid-area: metadata"><span class="comments">1</span></div>
	</li></ul>`;
	return document.querySelector('h3')!;
}

test('puts badges in their own column of the right column, once each', () => {
	const title = setUpRow();
	addPullRequestBadge(title, 'github-power-stale', badge('github-power-stale'), 'right');
	addPullRequestBadge(title, 'github-power-review-status', badge('github-power-review-status'), 'right');
	addPullRequestBadge(title, 'github-power-stale', badge('github-power-stale'), 'right');

	const rightColumn = document.querySelector('[style*="metadata"]')!;
	const container = rightColumn.firstElementChild as HTMLElement;
	expect(container.className).toBe('github-power-badges');
	// A missing diff-stats badge leaves its column empty, so the next rows still line up
	expect([...container.children].map((slot) => (slot as HTMLElement).style.gridArea)).toEqual(['1 / 3', '1 / 1']);
});

test('appends badges to the metadata line, in a fixed order', () => {
	const title = setUpRow();
	addPullRequestBadge(title, 'github-power-stale', badge('github-power-stale'), 'metadata');
	addPullRequestBadge(title, 'github-power-diff-stats', badge('github-power-diff-stats'), 'metadata');

	const container = document.querySelector('.metadata-line > .github-power-badges')!;
	expect([...container.children].map((slot) => [(slot as HTMLElement).style.order, slot.textContent])).toEqual([
		['2', '· '],
		['1', '· '],
	]);
});

test('falls back to the title when the row layout is unknown', () => {
	document.body.innerHTML = '<ul><li><div><h3>PR</h3></div></li></ul>';
	const title = document.querySelector('h3')!;
	addPullRequestBadge(title, 'github-power-diff-stats', badge('github-power-diff-stats'), 'right');

	expect(title.querySelector('.github-power-badges .github-power-diff-stats')).not.toBeNull();
});
