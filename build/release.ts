import {readFileSync, writeFileSync} from 'node:fs';
import process from 'node:process';

import {featuresWithPage, linkFeatureIds} from './feature-links.ts';

// From a section heading to the next one, or the end of the file
function sectionPattern(heading: string): RegExp {
	return new RegExp(`^## ${heading.replaceAll('.', String.raw`\.`)}\\b.*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm');
}

/** Turns the Unreleased section into a section for `version` and opens a new, empty Unreleased one. */
export function releaseChangelog(changelog: string, version: string, date: string): string {
	const notes = sectionPattern('Unreleased').exec(changelog)?.[1];
	if (!notes?.trim()) {
		throw new Error('CHANGELOG.md has nothing under "## Unreleased"');
	}

	return changelog.replace(sectionPattern('Unreleased'), `## Unreleased\n\n## ${version} - ${date}\n${notes}`);
}

export function getReleaseNotes(changelog: string, version: string): string {
	const notes = sectionPattern(version).exec(changelog)?.[1];
	if (!notes?.trim()) {
		throw new Error(`CHANGELOG.md has no notes for ${version}`);
	}

	return notes.trim();
}

function setVersion(file: string, version: string): void {
	const json = JSON.parse(readFileSync(file, 'utf8')) as {version: string};
	json.version = version;
	writeFileSync(file, `${JSON.stringify(json, null, '\t')}\n`);
}

if (import.meta.main) {
	const [command, version] = process.argv.slice(2);
	if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
		throw new Error('Usage: node build/release.ts <bump|notes> <major.minor.patch>');
	}

	const changelog = readFileSync('CHANGELOG.md', 'utf8');
	if (command === 'bump') {
		const today = new Date().toISOString().slice(0, 10);
		writeFileSync('CHANGELOG.md', releaseChangelog(changelog, version, today));
		setVersion('package.json', version);
		setVersion('source/manifest.json', version);
	} else if (command === 'notes') {
		console.log(linkFeatureIds(getReleaseNotes(changelog, version), featuresWithPage()));
	} else {
		throw new Error(`Unknown command: ${command}`);
	}
}
