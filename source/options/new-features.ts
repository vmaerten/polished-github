// TODO: remove after 0.5, once every user has a `seenFeatures` list
// The features of 0.3, the last version without the list: what the users who installed it have already seen
const featuresUpTo03 = [
	'image-modal',
	'diff-stats',
	'review-status',
	'idle-prs',
	'quick-comments',
	'reviewer-load',
	'merge-email',
	'unresolved-comments',
];

/** The features to flag as new. Without a `seen` list, stored data tells an update from a fresh install, which flags none. */
export function newFeatures(
	ids: readonly string[],
	seen: readonly string[] | undefined,
	hasStoredData: boolean,
): Set<string> {
	const known = seen ?? (hasStoredData ? featuresUpTo03 : ids);
	return new Set(ids.filter((id) => !known.includes(id)));
}

/** The features the user sees in the options for the first time; they all count as seen from the next visit. */
export async function takeNewFeatures(ids: readonly string[]): Promise<Set<string>> {
	const [synced, local] = await Promise.all([chrome.storage.sync.get(null), chrome.storage.local.get(null)]);
	const hasStoredData = Object.keys(synced).length > 0 || Object.keys(local).length > 0;
	await chrome.storage.local.set({seenFeatures: ids});
	return newFeatures(ids, local.seenFeatures as string[] | undefined, hasStoredData);
}
