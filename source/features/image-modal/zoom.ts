export type View = {scale: number; x: number; y: number};

const minScale = 0.2;
const maxScale = 20;

/** Scales by `factor` around `point`, relative to the viewport centre, so what's under it stays put. */
export function zoomAt(view: View, factor: number, point = {x: 0, y: 0}): View {
	const scale = Math.min(maxScale, Math.max(minScale, view.scale * factor));
	const ratio = scale / view.scale;
	return {
		scale,
		x: point.x - ratio * (point.x - view.x),
		y: point.y - ratio * (point.y - view.y),
	};
}
