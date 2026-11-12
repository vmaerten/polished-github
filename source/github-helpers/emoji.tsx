import React from 'dom-chef';

import {v3} from './api.js';

/** GitHub's emoji shortcodes, without colons, and the URL of their image. */
export type Emojis = Record<string, string>;

/** GitHub's emojis, fetched once per version of the extension. */
export async function getEmojis(): Promise<Emojis> {
	const {version} = chrome.runtime.getManifest();
	const {emojis} = (await chrome.storage.local.get('emojis')) as {emojis?: {version: string; urls: Emojis}};
	if (emojis?.version === version) {
		return emojis.urls;
	}

	const urls = await v3<Emojis>('/emojis');
	await chrome.storage.local.set({emojis: {version, urls}});
	return urls;
}

// A standard emoji has its code points in its URL, like unicode/1f1eb-1f1f7.png; GitHub's own, like :octocat:, only an image
const codePointsPattern = /\/unicode\/([\da-f-]+)\.png/;

function emoji(shortcode: string, url: string): string | JSX.Element {
	const codePoints = codePointsPattern
		.exec(url)?.[1]
		?.split('-')
		.map((hex) => Number.parseInt(hex, 16));
	if (!codePoints) {
		return <img src={url} alt={shortcode} title={shortcode} style={{height: '1.2em', verticalAlign: 'text-bottom'}} />;
	}

	// Without the emoji variation selector, a code point like ❤ can render as a plain text glyph
	return String.fromCodePoint(...codePoints, ...(codePoints.length === 1 ? [0xfe_0f] : []));
}

/** `text` with each `:shortcode:` GitHub knows replaced by its emoji, as GitHub renders it in a comment. */
export function renderEmoji(text: string, emojis: Emojis): Array<string | JSX.Element> {
	return text.split(/(:[\w+-]+:)/).map((part) => {
		const name = /^:([\w+-]+):$/.exec(part)?.[1];
		return name && Object.hasOwn(emojis, name) ? emoji(part, emojis[name]) : part;
	});
}
