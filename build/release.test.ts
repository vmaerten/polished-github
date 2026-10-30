import {expect, test} from 'vitest';

import {getReleaseNotes, releaseChangelog} from './release.js';

const changelog = `# Changelog

## Unreleased

### Added

- Image modal

## 0.1.0 - 2026-10-01

### Fixed

- Something
`;

test('moves unreleased notes under the new version', () => {
	const released = releaseChangelog(changelog, '0.2.0', '2026-10-30');
	expect(released).toContain('## Unreleased\n\n## 0.2.0 - 2026-10-30\n\n### Added\n\n- Image modal\n\n## 0.1.0');
	expect(getReleaseNotes(released, '0.2.0')).toBe('### Added\n\n- Image modal');
	expect(getReleaseNotes(released, '0.1.0')).toBe('### Fixed\n\n- Something');
});

test('refuses to release without notes', () => {
	const released = releaseChangelog(changelog, '0.2.0', '2026-10-30');
	expect(() => releaseChangelog(released, '0.3.0', '2026-10-31')).toThrow('nothing under');
	expect(() => getReleaseNotes(changelog, '9.9.9')).toThrow('no notes for 9.9.9');
});
