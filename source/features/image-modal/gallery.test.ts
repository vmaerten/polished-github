import {beforeEach, describe, expect, test} from 'vitest';

import {getGallery} from './gallery.js';

const attachment = 'https://github.com/user-attachments/assets/1';
const defaults = {cycleImages: true, includeLinkedImages: false};

beforeEach(() => {
	document.body.innerHTML = `
		<div class="markdown-body">
			<a href="${attachment}"><img id="attachment" src="${attachment}" alt="screenshot"></a>
			<a href="https://github.com/o/r/actions"><img id="badge" src="https://camo.githubusercontent.com/badge"></a>
			<img id="emoji" class="emoji" src="https://github.githubassets.com/smile.png">
			<a href="/o/r/blob/main/media/demo.png"><img id="readme" src="/o/r/raw/main/media/demo.png"></a>
			<img id="unlinked" src="https://example.com/plain.png">
		</div>
		<img id="outside" src="https://example.com/outside.png">
	`;
});

function click(id: string, init: MouseEventInit = {}): MouseEvent {
	const event = new MouseEvent('click', {bubbles: true, cancelable: true, ...init});
	document.querySelector(`#${id}`)!.dispatchEvent(event);
	return event;
}

describe('getGallery', () => {
	test('collects the zoomable images of the clicked comment', () => {
		expect(getGallery(click('readme'), defaults)).toEqual({
			images: [
				{src: attachment, alt: 'screenshot'},
				{src: 'https://github.com/o/r/raw/main/media/demo.png', alt: ''},
				{src: 'https://example.com/plain.png', alt: ''},
			],
			start: 1,
		});
	});

	test('leaves badges, emoji and images outside Markdown alone', () => {
		expect(getGallery(click('badge'), defaults)).toBeUndefined();
		expect(getGallery(click('emoji'), defaults)).toBeUndefined();
		expect(getGallery(click('outside'), defaults)).toBeUndefined();
	});

	test('leaves modified clicks to the browser', () => {
		expect(getGallery(click('attachment', {metaKey: true}), defaults)).toBeUndefined();
		expect(getGallery(click('attachment', {button: 1}), defaults)).toBeUndefined();
	});

	test('opens badges too when linked images are included', () => {
		const gallery = getGallery(click('badge'), {...defaults, includeLinkedImages: true});
		expect(gallery?.images).toHaveLength(4);
		expect(gallery?.start).toBe(1);
	});

	test('shows only the clicked image when cycling is off', () => {
		expect(getGallery(click('readme'), {...defaults, cycleImages: false})).toEqual({
			images: [{src: 'https://github.com/o/r/raw/main/media/demo.png', alt: ''}],
			start: 0,
		});
	});
});
