import {expect, test} from 'vitest';

import {addPullRequestBadge, type BadgeClass, type BadgeOptions, removePullRequestBadge} from './pr-list.js';

const right: BadgeOptions = {prListBadges: 'right', disabledFeatures: [], enabledFeatures: []};
const metadata: BadgeOptions = {prListBadges: 'metadata', disabledFeatures: [], enabledFeatures: []};

function badge(className: BadgeClass): HTMLElement {
	const element = document.createElement('span');
	element.className = className;
	return element;
}

function setUpRow(): HTMLElement {
	document.body.innerHTML = `<ul><li>
		<div><h3>PR</h3></div>
		<div style="grid-area: main-content"><div style="display: flex; flex-direction: column">
			<div class="metadata-line" style="display: flex"><span>#1</span><span>opened</span></div>
			<div class="labels" style="display: flex"><span>bug</span><span>ui</span></div>
		</div></div>
		<div style="grid-area: metadata"><span class="comments">1</span></div>
	</li></ul>`;
	return document.querySelector('h3')!;
}

test('puts badges in their own column of the right column, the latest replacing the previous one', () => {
	const title = setUpRow();
	addPullRequestBadge(title, 'polished-github-stale', badge('polished-github-stale'), right);
	addPullRequestBadge(title, 'polished-github-review-status', badge('polished-github-review-status'), right);
	addPullRequestBadge(title, 'polished-github-stale', badge('polished-github-stale'), right);

	const rightColumn = document.querySelector('[style*="metadata"]')!;
	const container = rightColumn.firstElementChild as HTMLElement;
	expect(container.className).toBe('polished-github-badges');
	const columns = (): string[] => [...container.children].map((slot) => (slot as HTMLElement).style.gridArea);
	// A missing diff-stats badge leaves its column empty, so the next rows still line up
	expect(columns()).toEqual(['1 / 1', '1 / 3']);

	removePullRequestBadge(title, 'polished-github-review-status');
	expect(columns()).toEqual(['1 / 3']);
});

test('leaves out the columns of disabled features', () => {
	const title = setUpRow();
	addPullRequestBadge(title, 'polished-github-stale', badge('polished-github-stale'), {
		...right,
		disabledFeatures: ['diff-stats'],
	});

	const container = document.querySelector<HTMLElement>('.polished-github-badges')!;
	expect(container.style.gridTemplateColumns).toBe('minmax(168px, max-content) minmax(44px, max-content)');
	expect((container.firstElementChild as HTMLElement).style.gridArea).toBe('1 / 2');
});

test('appends badges to the metadata line, in a fixed order', () => {
	const title = setUpRow();
	addPullRequestBadge(title, 'polished-github-stale', badge('polished-github-stale'), metadata);
	addPullRequestBadge(title, 'polished-github-diff-stats', badge('polished-github-diff-stats'), metadata);

	const container = document.querySelector('.metadata-line > .polished-github-badges')!;
	expect([...container.children].map((slot) => [(slot as HTMLElement).style.order, slot.textContent])).toEqual([
		['2', '· '],
		['1', '· '],
	]);
});

test('falls back to the title when the row layout is unknown', () => {
	document.body.innerHTML = '<ul><li><div><h3>PR</h3></div></li></ul>';
	const title = document.querySelector('h3')!;
	addPullRequestBadge(title, 'polished-github-diff-stats', badge('polished-github-diff-stats'), right);

	expect(title.querySelector('.polished-github-badges .polished-github-diff-stats')).not.toBeNull();
});
