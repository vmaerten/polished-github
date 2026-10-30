import {mount, unmount} from 'svelte';

import type {Feature} from '../../feature-manager.js';
import {getOptions} from '../../options-storage.js';
import {getGallery} from './gallery.js';
import ImageModal from './ImageModal.svelte';

const imageModal: Feature = {
	id: 'image-modal',
	description: 'Opens images from issues, PRs, comments and READMEs in a zoomable modal instead of a new tab.',
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
			const modal = mount(ImageModal, {
				target: document.body,
				props: {...gallery, zoomable: settings.zoom, onclose: () => void unmount(modal)},
			});
		};

		// Capture phase, to act before GitHub's handlers
		document.addEventListener('click', onClick, {signal, capture: true});
	},
};

export default imageModal;
