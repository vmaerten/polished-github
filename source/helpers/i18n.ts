import type english from '../_locales/en/messages.json';

export type MessageKey = keyof typeof english;

/** The text of `key` in the browser's language, with `$1`, `$2`… replaced by `substitutions`. */
export function t(key: MessageKey, ...substitutions: Array<string | number>): string {
	return chrome.i18n.getMessage(key, substitutions.map(String));
}
