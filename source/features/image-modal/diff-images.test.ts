import {expect, test} from 'vitest';

import {getDiffImage} from './diff-images.js';

const raw = 'https://raw.githubusercontent.com/o/r';
const hex = (text: string): string => Buffer.from(text).toString('hex');

function frame(kind: string, parameters: Record<string, string>): HTMLIFrameElement {
	const element = document.createElement('iframe');
	element.src = `https://viewscreen.githubusercontent.com/${kind}?${new URLSearchParams({path: 'shots/a.png', ...parameters})}`;
	return element;
}

test('reads the old and new versions of a changed image', () => {
	expect(
		getDiffImage(
			frame('diff/img', {enc_url1: hex(`${raw}/base/shots/a.png`), enc_url2: hex(`${raw}/head/shots/a.png`)}),
		),
	).toEqual({
		src: `${raw}/head/shots/a.png`,
		before: `${raw}/base/shots/a.png`,
		alt: 'shots/a.png',
		path: 'shots/a.png',
	});
});

test('reads an added image', () => {
	expect(getDiffImage(frame('added/img', {enc_url: hex(`${raw}/head/shots/a.png`)}))?.src).toBe(
		`${raw}/head/shots/a.png`,
	);
});

test('leaves other renderers and malformed URLs alone', () => {
	expect(getDiffImage(frame('diff/svg', {enc_url: hex(`${raw}/head/a.svg`)}))).toBeUndefined();
	expect(getDiffImage(frame('added/img', {enc_url: 'not hex'}))).toBeUndefined();
	expect(getDiffImage(frame('added/img', {enc_url: hex('javascript:alert(1)')}))).toBeUndefined();
});
