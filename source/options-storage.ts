export type QuickComment = {
	label: string;
	body: string;
	on: 'issues' | 'prs' | 'both';
};

export type DiffStatsSettings = {
	showChangedFiles: boolean;
	showSizeLabel: boolean;
	/** Largest number of changed lines for XS, S, M and L; anything bigger is XL. */
	sizeThresholds: [number, number, number, number];
};

export type Options = {
	// Stored as an opt-out list so new features are on by default
	disabledFeatures: string[];
	quickComments: QuickComment[];
	diffStats: DiffStatsSettings;
};

const defaults: Options = {
	disabledFeatures: [],
	quickComments: [
		{label: 'LGTM', body: 'LGTM :rocket:', on: 'prs'},
		{label: 'Rebase', body: '@dependabot rebase', on: 'prs'},
		{label: 'Thanks', body: 'Thanks for the contribution!', on: 'both'},
	],
	diffStats: {showChangedFiles: true, showSizeLabel: true, sizeThresholds: [10, 50, 250, 1000]},
};

export async function getOptions(): Promise<Options> {
	return (await chrome.storage.sync.get(defaults)) as Options;
}

export async function setFeatureEnabled(id: string, enabled: boolean): Promise<void> {
	const {disabledFeatures} = await getOptions();
	const others = disabledFeatures.filter((disabledId) => disabledId !== id);
	await chrome.storage.sync.set({disabledFeatures: enabled ? others : [...others, id]});
}

// The token lives in local storage: sync storage would upload it to the browser vendor's servers
export async function getToken(): Promise<string> {
	const {token} = (await chrome.storage.local.get({token: ''})) as {token: string};
	return token;
}

export async function setToken(token: string): Promise<void> {
	await chrome.storage.local.set({token: token.trim()});
}
