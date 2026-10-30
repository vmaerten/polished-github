import {expect, test} from 'vitest';

import {zoomAt} from './zoom.js';

test('keeps the point under the cursor in place', () => {
	const before = {scale: 2, x: 30, y: -10};
	const point = {x: 100, y: 50};
	const after = zoomAt(before, 1.5, point);
	// Image coordinates under the cursor, before and after
	expect((point.x - after.x) / after.scale).toBeCloseTo((point.x - before.x) / before.scale);
	expect((point.y - after.y) / after.scale).toBeCloseTo((point.y - before.y) / before.scale);
});

test('clamps the scale', () => {
	expect(zoomAt({scale: 1, x: 0, y: 0}, 1000).scale).toBe(20);
	expect(zoomAt({scale: 1, x: 0, y: 0}, 0.001).scale).toBe(0.2);
});
