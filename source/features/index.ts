import type {Feature} from '../feature-manager.js';
import imageModal from './image-modal/index.js';
import diffStats from './diff-stats.js';
import reviewStatus from './review-status.js';
import idlePrs from './idle-prs.js';
import quickComments from './quick-comments.js';
import quickApprovals from './quick-approvals.js';
import reviewerLoad from './reviewer-load.js';
import mergeEmail from './merge-email.js';
import unresolvedComments from './unresolved-comments.js';

export const features: Feature[] = [
	imageModal,
	diffStats,
	reviewStatus,
	idlePrs,
	quickComments,
	quickApprovals,
	reviewerLoad,
	mergeEmail,
	unresolvedComments,
];
