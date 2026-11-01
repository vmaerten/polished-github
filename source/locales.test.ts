import {expect, test} from 'vitest';

import english from './_locales/en/messages.json';
import french from './_locales/fr/messages.json';

const placeholders = (catalog: Record<string, {message: string}>): Record<string, string[]> =>
	Object.fromEntries(
		Object.entries(catalog).map(([key, {message}]) => [key, message.match(/\$\d/g)?.toSorted() ?? []]),
	);

test('the French catalog translates every English message, with the same placeholders', () => {
	expect(placeholders(french)).toEqual(placeholders(english));
});
