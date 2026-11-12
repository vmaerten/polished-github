import {showNotice} from './github-helpers/toast.js';
import {t} from './helpers/i18n.js';

const changelogUrl = 'https://polished-github.vmaerten.fr/changelog/';

function majorMinor(version: string): string {
	return version.split('.').slice(0, 2).join('.');
}

/**
 * Announces a minor or major release only: a patch has no new feature to show. Without a `previous` version, which
 * versions up to 0.3 didn't save, stored data tells an update from a fresh install.
 */
// TODO: remove `hasStoredData` after 0.5, once every user has a `lastSeenVersion`
export function shouldAnnounce(previous: string | undefined, current: string, hasStoredData: boolean): boolean {
	if (previous === undefined) {
		return hasStoredData;
	}

	return majorMinor(previous) !== majorMinor(current);
}

/** Shows a toast linking to the changelog on the first github.com page after an update that brings features. */
export async function announceUpdate(): Promise<void> {
	const {version} = chrome.runtime.getManifest();
	const [synced, local] = await Promise.all([chrome.storage.sync.get(null), chrome.storage.local.get(null)]);
	const lastSeenVersion = local.lastSeenVersion as string | undefined;
	if (lastSeenVersion === version) {
		return;
	}

	// Saved before showing, so a second tab opened meanwhile doesn't show it again
	await chrome.storage.local.set({lastSeenVersion: version});
	const hasStoredData = Object.keys(synced).length > 0 || Object.keys(local).length > 0;
	if (shouldAnnounce(lastSeenVersion, version, hasStoredData)) {
		showNotice(t('whatsNew_updated', version), {label: t('whatsNew_link'), url: changelogUrl});
	}
}
