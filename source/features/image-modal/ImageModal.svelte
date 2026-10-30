<script lang="ts">
	import {onMount} from 'svelte';

	import type {ModalImage} from './gallery.js';
	import {type View, zoomAt} from './zoom.js';

	const zoomStep = 1.25;
	const initialView: View = {scale: 1, x: 0, y: 0};

	let {images, start, onclose}: {images: ModalImage[]; start: number; onclose: () => void} = $props();

	// `start` only seeds the index: the modal is mounted once per click
	// svelte-ignore state_referenced_locally
	let index = $state(start);
	let view = $state(initialView);
	let drag = $state<{x: number; y: number}>();
	let dialog: HTMLDialogElement;
	const image = $derived(images[index]);

	onMount(() => {
		dialog.showModal();
		// Svelte registers wheel listeners as passive, which forbids preventDefault
		dialog.addEventListener('wheel', onwheel, {passive: false});
	});

	function fromCenter(event: MouseEvent): {x: number; y: number} {
		return {x: event.clientX - innerWidth / 2, y: event.clientY - innerHeight / 2};
	}

	function zoom(factor: number, point?: {x: number; y: number}): void {
		view = zoomAt(view, factor, point);
	}

	function show(step: number): void {
		index = (index + step + images.length) % images.length;
		view = initialView;
	}

	function onwheel(event: WheelEvent): void {
		event.preventDefault();
		zoom(Math.exp(-event.deltaY * 0.002), fromCenter(event));
	}

	const shortcuts: Record<string, () => void> = {
		ArrowLeft: () => show(-1),
		ArrowRight: () => show(1),
		'+': () => zoom(zoomStep),
		'=': () => zoom(zoomStep),
		'-': () => zoom(1 / zoomStep),
		'0': () => (view = initialView),
	};

	function onkeydown(event: KeyboardEvent): void {
		const action = shortcuts[event.key];
		if (action) {
			event.preventDefault();
			// Keeps GitHub's own hotkeys from firing behind the modal
			event.stopPropagation();
			action();
		}
	}

	function onclick(event: MouseEvent): void {
		// The dialog covers the viewport: a click on it rather than its content is a click on the backdrop
		if (event.target === dialog) {
			dialog.close();
		}
	}

	function onpointerdown(event: PointerEvent): void {
		event.preventDefault();
		drag = {x: event.clientX - view.x, y: event.clientY - view.y};
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onpointermove(event: PointerEvent): void {
		if (drag) {
			view = {...view, x: event.clientX - drag.x, y: event.clientY - drag.y};
		}
	}
</script>

<!-- Mouse-only handlers have keyboard equivalents: Escape, arrows, + - 0 -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} aria-label="Image viewer" {onclick} {onkeydown} {onclose}>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<img
		src={image.src}
		alt={image.alt}
		draggable="false"
		class:dragging={drag}
		style:transform="translate({view.x}px, {view.y}px) scale({view.scale})"
		{onpointerdown}
		{onpointermove}
		onpointerup={() => (drag = undefined)}
	>
	<div class="toolbar">
		{#if images.length > 1}
			<button type="button" aria-label="Previous image" onclick={() => show(-1)}>‹</button>
			<span class="counter">{index + 1} / {images.length}</span>
			<button type="button" aria-label="Next image" onclick={() => show(1)}>›</button>
		{/if}
		<button type="button" aria-label="Zoom out" onclick={() => zoom(1 / zoomStep)}>−</button>
		<button type="button" aria-label="Reset zoom" class="scale" onclick={() => (view = initialView)}>
			{Math.round(view.scale * 100)}%
		</button>
		<button type="button" aria-label="Zoom in" onclick={() => zoom(zoomStep)}>+</button>
		<a href={image.src} target="_blank" rel="noopener noreferrer">Open original</a>
		<button type="button" aria-label="Close" onclick={() => dialog.close()}>×</button>
	</div>
</dialog>

<style>
	dialog {
		width: 100vw;
		height: 100vh;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		overflow: hidden;
		cursor: zoom-out;
	}

	dialog[open] {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 85%);
	}

	img {
		max-width: 95vw;
		max-height: 95vh;
		object-fit: contain;
		user-select: none;
		cursor: grab;
	}

	img.dragging {
		cursor: grabbing;
	}

	.toolbar {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: default;
		font: 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		color: #fff;
	}

	.toolbar button,
	.toolbar a {
		min-width: 32px;
		padding: 4px 12px;
		border: 0;
		border-radius: 6px;
		background: rgb(255 255 255 / 15%);
		color: inherit;
		font: inherit;
		font-size: 16px;
		text-decoration: none;
		cursor: pointer;
	}

	.toolbar a {
		font-size: 14px;
		white-space: nowrap;
	}

	.toolbar .scale {
		min-width: 64px;
	}

	.counter {
		font-variant-numeric: tabular-nums;
	}
</style>
