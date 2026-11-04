<script lang="ts">
	import {onMount} from 'svelte';

	import type {ModalImage} from './gallery.js';
	import {type View, zoomAt} from './zoom.js';

	const zoomStep = 1.25;
	const initialView: View = {scale: 1, x: 0, y: 0};

	let {
		images,
		start,
		zoomable,
		onclose,
	}: {images: ModalImage[]; start: number; zoomable: boolean; onclose: () => void} = $props();

	// `start` only seeds the index: the modal is mounted once per click
	// svelte-ignore state_referenced_locally
	let index = $state(start);
	let view = $state(initialView);
	let drag = $state<{x: number; y: number}>();
	let dialog: HTMLDialogElement;
	// A changed image of a diff opens on its new version
	let showBefore = $state(false);
	const image = $derived(images[index]);
	const src = $derived(showBefore && image.before ? image.before : image.src);

	onMount(() => {
		dialog.showModal();
		if (zoomable) {
			// Svelte registers wheel listeners as passive, which forbids preventDefault
			dialog.addEventListener('wheel', onwheel, {passive: false});
		}
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
		showBefore = false;
	}

	function onwheel(event: WheelEvent): void {
		event.preventDefault();
		zoom(Math.exp(-event.deltaY * 0.002), fromCenter(event));
	}

	// The version switch keeps the zoom and position, so the change shows in place
	const navigationShortcuts: Record<string, () => void> = {
		ArrowLeft: () => show(-1),
		ArrowRight: () => show(1),
		s: () => (showBefore = image.before ? !showBefore : false),
	};
	const zoomShortcuts: Record<string, () => void> = {
		'+': () => zoom(zoomStep),
		'=': () => zoom(zoomStep),
		'-': () => zoom(1 / zoomStep),
		'0': () => (view = initialView),
	};

	function onkeydown(event: KeyboardEvent): void {
		const action = navigationShortcuts[event.key] ?? (zoomable ? zoomShortcuts[event.key] : undefined);
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
		if (!zoomable) {
			return;
		}

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
		{src}
		alt={image.alt}
		draggable="false"
		class:zoomable
		class:dragging={drag}
		style:transform="translate({view.x}px, {view.y}px) scale({view.scale})"
		{onpointerdown}
		{onpointermove}
		onpointerup={() => (drag = undefined)}
	>
	{#if image.path}
		<div class="path">{image.path}</div>
	{/if}
	<div class="toolbar">
		{#if images.length > 1}
			<button type="button" aria-label="Previous image" onclick={() => show(-1)}>‹</button>
			<span class="counter">{index + 1} / {images.length}</span>
			<button type="button" aria-label="Next image" onclick={() => show(1)}>›</button>
		{/if}
		{#if image.before}
			<span class="versions" title="Switch with S">
				<button type="button" aria-pressed={showBefore} onclick={() => (showBefore = true)}>Before</button>
				<button type="button" aria-pressed={!showBefore} onclick={() => (showBefore = false)}>After</button>
			</span>
		{/if}
		{#if zoomable}
			<button type="button" aria-label="Zoom out" onclick={() => zoom(1 / zoomStep)}>−</button>
			<button type="button" aria-label="Reset zoom" class="scale" onclick={() => (view = initialView)}>
				{Math.round(view.scale * 100)}%
			</button>
			<button type="button" aria-label="Zoom in" onclick={() => zoom(zoomStep)}>+</button>
		{/if}
		<a href={src} target="_blank" rel="noopener noreferrer">Open original</a>
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
	}

	img.zoomable {
		cursor: grab;
	}

	img.dragging {
		cursor: grabbing;
	}

	.path {
		position: absolute;
		top: 16px;
		left: 50%;
		max-width: 90vw;
		transform: translateX(-50%);
		overflow: hidden;
		padding: 4px 12px;
		border-radius: 6px;
		background: rgb(0 0 0 / 60%);
		color: #fff;
		font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: default;
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

	.versions {
		display: flex;
		gap: 2px;
	}

	.toolbar .versions button {
		font-size: 14px;
	}

	.toolbar .versions button[aria-pressed='true'] {
		background: rgb(255 255 255 / 35%);
	}

	.counter {
		font-variant-numeric: tabular-nums;
	}
</style>
