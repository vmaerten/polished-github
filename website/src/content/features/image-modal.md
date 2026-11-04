---
title: Image modal
summary: Zoom images in place, arrow keys between them.
group: Reading
appearsIn: Images
order: 2
lede: Images in issues, PRs, comments, READMEs and diffs open over the page instead of in a new tab. Zoom, pan, and move to the next image with the arrow keys.
---

## Controls

<dl class="meanings">
	<dt>Click an image</dt>
	<dd>Opens it over the page.</dd>
	<dt>← and →</dt>
	<dd>Previous and next image of the same comment, or of the diff.</dd>
	<dt>S</dt>
	<dd>Switches a changed image between its old and new versions, keeping the zoom and position.</dd>
	<dt>Scroll wheel, + and −</dt>
	<dd>Zoom in and out. 0 resets the zoom.</dd>
	<dt>Drag</dt>
	<dd>Moves around a zoomed image.</dd>
	<dt>Escape</dt>
	<dd>Closes it, like a click outside the image.</dd>
</dl>

## What opens

- Images in rendered Markdown: issue and PR descriptions, comments, READMEs.
- Images that link elsewhere, like CI badges, keep their link unless you change it in the settings.
- Emoji never open, and a click with ⌘, Ctrl, Shift or Alt keeps the browser's behavior.
- Images in a diff, in a pull request's changes or a commit: GitHub draws them in a frame the page can't listen to, so they open from the magnifier button in their top-right corner. A changed image opens on its new version, with Before and After to compare.

## Settings

<div class="panel settings">
	<div><span style="font-weight: 600">Cycle through images</span><span>On by default: ← and → move between the images of a comment.</span></div>
	<div><span style="font-weight: 600">Zoom</span><span>On by default: scroll wheel to zoom, drag to pan.</span></div>
	<div><span style="font-weight: 600">Linked images</span><span>Off by default: images that link elsewhere keep their link.</span></div>
	<div><span style="font-weight: 600">Turn off</span><span>Options › Features › image-modal</span></div>
</div>

## Good to know

- No token needed.
- In a diff, ← and → go through the images GitHub has rendered when the viewer opens: on a long pull request, those near the part you're reading.
