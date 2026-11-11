import {expect, test, vi} from 'vitest';
import {observe} from './observe.js';

const runtime: {id?: string} = {id: 'extension'};
vi.stubGlobal('chrome', {runtime});

test('does nothing once the navigation that started it is over', async () => {
	const controller = new AbortController();
	controller.abort();
	const callback = vi.fn<(elements: Element[]) => void>();
	observe('p', callback, {signal: controller.signal});
	document.body.append(document.createElement('p'));
	await new Promise((resolve) => setTimeout(resolve, 0));
	expect(callback).not.toHaveBeenCalled();
});

test('stops once a reload of the extension cut this script off from it', async () => {
	document.body.innerHTML = '';
	const callback = vi.fn<(elements: Element[]) => void>();
	observe('p', callback, {signal: new AbortController().signal});
	delete runtime.id;
	document.body.append(document.createElement('p'));
	await new Promise((resolve) => setTimeout(resolve, 0));
	runtime.id = 'extension';
	expect(callback).not.toHaveBeenCalled();
});
