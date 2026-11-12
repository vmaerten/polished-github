import {expect, test} from 'vitest';
import {renderEmoji} from './emoji.js';

const emojis = {
	rocket: 'https://github.githubassets.com/images/icons/emoji/unicode/1f680.png?v8',
	fr: 'https://github.githubassets.com/images/icons/emoji/unicode/1f1eb-1f1f7.png?v8',
	octocat: 'https://github.githubassets.com/images/icons/emoji/octocat.png?v8',
};

test('replaces the shortcodes GitHub knows by their emoji', () => {
	// A lone code point gets the emoji variation selector
	const rocket = String.fromCodePoint(0x1_f6_80, 0xfe_0f);
	expect(renderEmoji('LGTM :rocket: from :fr:', emojis)).toEqual(['LGTM ', rocket, ' from ', '🇫🇷', '']);
});

test("shows GitHub's own emojis as their image", () => {
	const [, image] = renderEmoji('Ship :octocat:', emojis);
	expect(image).toBeInstanceOf(HTMLImageElement);
	expect(image).toHaveProperty('src', emojis.octocat);
});

test('leaves unknown shortcodes and lookalikes of object keys as they are', () => {
	const text = 'a :nope: or :constructor: at 10:30:00';
	expect(renderEmoji(text, emojis)).toEqual([
		text.slice(0, 2),
		':nope:',
		' or ',
		':constructor:',
		' at 10',
		':30:',
		'00',
	]);
});
