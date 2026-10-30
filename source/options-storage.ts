export type Options = {
	// Stored as an opt-out list so new features are on by default
	disabledFeatures: string[];
};

const defaults: Options = {disabledFeatures: []};

export async function getOptions(): Promise<Options> {
	return await chrome.storage.sync.get(defaults) as Options;
}

export async function setFeatureEnabled(id: string, enabled: boolean): Promise<void> {
	const {disabledFeatures} = await getOptions();
	const others = disabledFeatures.filter(disabledId => disabledId !== id);
	await chrome.storage.sync.set({disabledFeatures: enabled ? others : [...others, id]});
}

// The token lives in local storage: sync storage would upload it to the browser vendor's servers
export async function getToken(): Promise<string> {
	const {token} = await chrome.storage.local.get({token: ''}) as {token: string};
	return token;
}

export async function setToken(token: string): Promise<void> {
	await chrome.storage.local.set({token: token.trim()});
}
