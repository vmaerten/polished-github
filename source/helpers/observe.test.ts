import {expect, test, vi} from 'vitest';
import {observe} from './observe.js';

test('does nothing once the navigation that started it is over', async () => {
	const controller = new AbortController();
	controller.abort();
	const callback = vi.fn<(elements: Element[]) => void>();
	observe('p', callback, {signal: controller.signal});
	document.body.append(document.createElement('p'));
	await new Promise((resolve) => setTimeout(resolve, 0));
	expect(callback).not.toHaveBeenCalled();
});
