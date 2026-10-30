import type {Feature} from '../feature-manager.js';
import imageModal from './image-modal/index.js';
import powerIndicator from './power-indicator.js';
import prListDiffStats from './pr-list-diff-stats.js';
import quickComments from './quick-comments.js';

export const features: Feature[] = [imageModal, powerIndicator, prListDiffStats, quickComments];
