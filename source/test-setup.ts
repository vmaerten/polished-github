import {vi} from 'vitest';

// Tests run outside the browser, so they read the English catalog directly
vi.mock('./helpers/i18n.js', async () => {
	const {default: english} = (await import('./_locales/en/messages.json')) as {
		default: Record<string, {message: string}>;
	};
	return {
		t: (key: string, ...substitutions: Array<string | number>) =>
			english[key].message.replaceAll(/\$(\d)/g, (_, index: string) => String(substitutions[Number(index) - 1])),
	};
});
