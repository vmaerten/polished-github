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

export type ImageModalSettings = {
	cycleImages: boolean;
	zoom: boolean;
	/** Also open images that link elsewhere, like CI badges, instead of following their link. */
	includeLinkedImages: boolean;
};

export type StaleSettings = {
	/** Days without activity before a PR is flagged. */
	days: number;
	includeDrafts: boolean;
};

export type MergeEmail = {
	/** Organization or user that owns the repository. */
	owner: string;
	email: string;
};

export type BadgePlacement = 'right' | 'metadata';

export type Options = {
	// Stored as an opt-out list so new features are on by default
	disabledFeatures: string[];
	quickComments: QuickComment[];
	diffStats: DiffStatsSettings;
	imageModal: ImageModalSettings;
	stale: StaleSettings;
	/** Where the PR list features put their badges in each row. */
	prListBadges: BadgePlacement;
	mergeEmails: MergeEmail[];
};

const defaults: Options = {
	disabledFeatures: [],
	quickComments: [
		{label: 'LGTM', body: 'LGTM :rocket:', on: 'prs'},
		{label: 'Rebase', body: '@dependabot rebase', on: 'prs'},
		{label: 'Thanks', body: 'Thanks for the contribution!', on: 'both'},
	],
	diffStats: {showChangedFiles: true, showSizeLabel: true, sizeThresholds: [10, 50, 250, 1000]},
	imageModal: {cycleImages: true, zoom: true, includeLinkedImages: false},
	stale: {days: 7, includeDrafts: false},
	prListBadges: 'right',
	mergeEmails: [],
};

export async function getOptions(): Promise<Options> {
	const stored = (await chrome.storage.sync.get(defaults)) as Options;
	// storage.sync.get only fills missing top-level keys, and an emptied number field is saved as null
	const stale = {...defaults.stale, ...stored.stale};
	const diffStats = {...defaults.diffStats, ...stored.diffStats};
	return {
		...stored,
		imageModal: {...defaults.imageModal, ...stored.imageModal},
		stale: {...stale, days: isPositiveInteger(stale.days) ? stale.days : defaults.stale.days},
		diffStats: {
			...diffStats,
			sizeThresholds: areAscending(diffStats.sizeThresholds)
				? diffStats.sizeThresholds
				: defaults.diffStats.sizeThresholds,
		},
	};
}

function isPositiveInteger(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) > 0;
}

function areAscending(thresholds: unknown[]): boolean {
	return (
		thresholds.length === 4 &&
		thresholds.every(
			(value, index) => isPositiveInteger(value) && (index === 0 || value > (thresholds[index - 1] as number)),
		)
	);
}

export async function setOptions(changes: Partial<Options>): Promise<void> {
	await chrome.storage.sync.set(changes);
}

/** Restores every setting; the token survives since it lives in local storage. */
export async function resetOptions(): Promise<void> {
	await chrome.storage.sync.clear();
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

export type MergeBoxesSeen = {
	/** The owners of the pull requests where a merge box showed up. */
	owners: string[];
	/** The verified emails the last merge box offered. */
	emails: string[];
};

export async function getMergeBoxesSeen(): Promise<MergeBoxesSeen> {
	const {mergeBoxesSeen} = (await chrome.storage.local.get({mergeBoxesSeen: {owners: [], emails: []}})) as {
		mergeBoxesSeen: MergeBoxesSeen;
	};
	return mergeBoxesSeen;
}

/** Keeps what a merge box shows, for the options page to suggest: its owner joins the others, its emails replace the previous ones. */
export async function rememberMergeBox(owner: string, emails: string[]): Promise<void> {
	const seen = await getMergeBoxesSeen();
	const owners = seen.owners.some((known) => known.toLowerCase() === owner.toLowerCase())
		? seen.owners
		: [...seen.owners, owner];
	await chrome.storage.local.set({mergeBoxesSeen: {owners, emails}});
}
