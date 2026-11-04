import type {ModalImage} from './gallery.js';

/** GitHub renders each image of a diff in an iframe from this host, out of reach of the page's click handlers. */
export const diffImageFrames = 'iframe[src^="https://viewscreen.githubusercontent.com/"]';

// The renderer gets the image URLs hex-encoded: `enc_url` for an added or deleted image, `enc_url1` and `enc_url2`
// for the old and new versions of a changed one
function decode(hex: string | null): string | undefined {
	if (!hex || !/^(?:[\da-f]{2})+$/i.test(hex)) {
		return undefined;
	}

	const url = new TextDecoder().decode(Uint8Array.from(hex.match(/../g)!, (byte) => Number.parseInt(byte, 16)));
	return url.startsWith('https://') ? url : undefined;
}

/** The image a diff frame renders, with its previous version when it changed. */
export function getDiffImage(frame: HTMLIFrameElement): ModalImage | undefined {
	const url = new URL(frame.src);
	if (!url.pathname.endsWith('/img')) {
		return undefined;
	}

	const parameters = url.searchParams;
	const path = parameters.get('path') ?? undefined;
	const alt = path ?? '';
	const single = decode(parameters.get('enc_url'));
	if (single) {
		return {src: single, alt, path};
	}

	const before = decode(parameters.get('enc_url1'));
	const after = decode(parameters.get('enc_url2'));
	return before && after ? {src: after, alt, path, before} : undefined;
}
