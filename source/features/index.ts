import type {Feature} from '../feature-manager.js';
import imageModal from './image-modal/index.js';
import powerIndicator from './power-indicator.js';
import prListDiffStats from './pr-list-diff-stats.js';
import prListReviewStatus from './pr-list-review-status.js';
import prListStale from './pr-list-stale.js';
import quickComments from './quick-comments.js';

export const features: Feature[] = [
	imageModal,
	powerIndicator,
	prListDiffStats,
	prListReviewStatus,
	prListStale,
	quickComments,
];
