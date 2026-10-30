export type ModalImage = {src: string; alt: string};
export type Gallery = {images: ModalImage[]; start: number};

// Rendered Markdown wraps each image in a link to itself; READMEs link the /blob/ page of the /raw/ file instead
function linksToItself(link: HTMLAnchorElement, img: HTMLImageElement): boolean {
	if (link.href === img.src) {
		return true;
	}

	const href = new URL(link.href);
	return href.origin === location.origin && href.pathname.replace('/blob/', '/raw/') === new URL(img.src).pathname;
}

// Badges and images linking elsewhere keep their link
function isZoomable(img: HTMLImageElement): boolean {
	const link = img.closest('a');
	return !img.classList.contains('emoji') && (!link || linksToItself(link, img));
}

/** The zoomable images of the clicked comment, or nothing when the click should behave natively. */
export function getGallery(event: MouseEvent): Gallery | undefined {
	const clicked = event.target;
	const isPlainClick =
		!event.defaultPrevented &&
		event.button === 0 &&
		!event.metaKey &&
		!event.ctrlKey &&
		!event.shiftKey &&
		!event.altKey;
	if (!isPlainClick || !(clicked instanceof HTMLImageElement)) {
		return undefined;
	}

	const body = clicked.closest('.markdown-body');
	if (!body || !isZoomable(clicked)) {
		return undefined;
	}

	const images = [...body.querySelectorAll('img')].filter((img) => isZoomable(img));
	return {
		images: images.map((img) => ({src: img.currentSrc || img.src, alt: img.alt})),
		start: images.indexOf(clicked),
	};
}
