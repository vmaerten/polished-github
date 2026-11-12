import React from 'dom-chef';

/** GitHub's emoji shortcodes, without colons, and the URL of their image. */
export type Emojis = Record<string, string>;

/**
 * GitHub's emojis, fetched once per version of the extension. Resolves to none when the list can't load, which leaves the
 * shortcodes as text.
 */
export async function getEmojis(): Promise<Emojis> {
	try {
		const {version} = chrome.runtime.getManifest();
		const {emojis} = (await chrome.storage.local.get('emojis')) as {emojis?: {version: string; urls: Emojis}};
		if (emojis?.version === version) {
			return emojis.urls;
		}

		// A public endpoint: no token, so that the features which need none can use it
		const response = await fetch('https://api.github.com/emojis');
		if (!response.ok) {
			throw new Error(`GitHub API ${response.status}`);
		}

		const urls = (await response.json()) as Emojis;
		await chrome.storage.local.set({emojis: {version, urls}});
		return urls;
	} catch (error) {
		console.error('polished-github: could not load the emojis', error);
		return {};
	}
}

// A standard emoji has its code points in its URL, like unicode/1f1eb-1f1f7.png; GitHub's own, like :octocat:, only an image
const codePointsPattern = /\/unicode\/([\da-f-]+)\.png/;

function urlOf(name: string, emojis: Emojis): string | undefined {
	return Object.hasOwn(emojis, name) ? emojis[name] : undefined;
}

function character(url: string): string | undefined {
	const codePoints = codePointsPattern
		.exec(url)?.[1]
		?.split('-')
		.map((hex) => Number.parseInt(hex, 16));
	// Without the emoji variation selector, a code point like ❤ can render as a plain text glyph
	return codePoints && String.fromCodePoint(...codePoints, ...(codePoints.length === 1 ? [0xfe_0f] : []));
}

/** `text` with each `:shortcode:` GitHub knows replaced by its emoji, as GitHub renders it in a comment. */
export function renderEmoji(text: string, emojis: Emojis): Array<string | JSX.Element> {
	return text.split(/(:[\w+-]+:)/).map((part) => {
		const url = urlOf(/^:([\w+-]+):$/.exec(part)?.[1] ?? '', emojis);
		if (!url) {
			return part;
		}

		return (
			character(url) ?? (
				<img src={url} alt={part} title={part} style={{height: '1.2em', verticalAlign: 'text-bottom'}} />
			)
		);
	});
}

/** Like `renderEmoji`, for plain text such as a tooltip: GitHub's own emojis, which are only images, keep their shortcode. */
export function renderEmojiText(text: string, emojis: Emojis): string {
	return text.replaceAll(/:([\w+-]+):/g, (shortcode, name: string) => {
		const url = urlOf(name, emojis);
		return (url && character(url)) ?? shortcode;
	});
}
