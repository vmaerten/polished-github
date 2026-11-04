import React from 'dom-chef';
import {mount, unmount} from 'svelte';

import type {Feature} from '../../feature-manager.js';
import {t} from '../../helpers/i18n.js';
import {observe} from '../../helpers/observe.js';
import {getOptions, type ImageModalSettings} from '../../options-storage.js';
import {diffImageFrames, getDiffImage} from './diff-images.js';
import {getGallery, type Gallery} from './gallery.js';
import ImageModal from './ImageModal.svelte';

const zoomButtonClass = 'polished-github-diff-image-zoom';

function open(gallery: Gallery, settings: ImageModalSettings): void {
	const modal = mount(ImageModal, {
		target: document.body,
		props: {...gallery, zoomable: settings.zoom, onclose: () => void unmount(modal)},
	});
}

// Clicks inside the frame never reach the page, so each diff image gets a button instead
function addZoomButton(frame: HTMLIFrameElement, settings: ImageModalSettings): void {
	const container = frame.parentElement;
	if (!getDiffImage(frame) || !container || container.querySelector(`.${zoomButtonClass}`)) {
		return;
	}

	const onClick = (): void => {
		// The diff only renders the files near the viewport: the gallery is the images rendered when it opens
		const frames = settings.cycleImages ? [...document.querySelectorAll<HTMLIFrameElement>(diffImageFrames)] : [frame];
		const shown = frames.filter((each) => getDiffImage(each));
		open({images: shown.map((each) => getDiffImage(each)!), start: shown.indexOf(frame)}, settings);
	};

	container.append(
		<button
			type="button"
			className={`${zoomButtonClass} btn btn-sm`}
			aria-label="Open in the image viewer"
			title="Open in the image viewer"
			style={{position: 'absolute', top: '8px', right: '8px', zIndex: '1'}}
			onClick={onClick}
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				aria-hidden="true"
				style={{verticalAlign: 'text-bottom'}}
			>
				<circle cx="11" cy="11" r="7" />
				<path d="M20 20l-4-4M8 11h6M11 8v6" />
			</svg>
		</button>,
	);
}

const imageModal: Feature = {
	id: 'image-modal',
	description: t('feature_imageModal'),
	async init(signal) {
		const settings = (await getOptions()).imageModal;
		const onClick = (event: MouseEvent): void => {
			const gallery = getGallery(event, settings);
			if (!gallery) {
				return;
			}

			event.preventDefault();
			// Keeps GitHub's own link handlers from opening the image anyway
			event.stopPropagation();
			open(gallery, settings);
		};

		// Capture phase, to act before GitHub's handlers
		document.addEventListener('click', onClick, {signal, capture: true});
		observe(
			diffImageFrames,
			(frames) => {
				for (const frame of frames as HTMLIFrameElement[]) {
					addZoomButton(frame, settings);
				}
			},
			{signal},
		);
	},
};

export default imageModal;
