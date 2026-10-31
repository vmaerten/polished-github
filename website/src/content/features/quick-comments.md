---
title: Quick comments
summary: Your usual replies as one-click buttons above the comment box.
group: Discussing
appearsIn: Comment box
order: 1
lede: Your usual replies as buttons above the comment box. One click posts the comment; Shift-click inserts it so you can add to it.
featured: true
---

<figure class="panel cbox" style="margin: 0" aria-label="Quick comment buttons above the comment box">
	<div class="quick" aria-hidden="true"><span>LGTM</span><span>Rebase</span><span>Thanks</span></div>
	<b>Add a comment</b>
	<div class="editor">
		<div class="editor-tabs"><span>Write</span><span>Preview</span></div>
		<div class="editor-body">LGTM :rocket:</div>
	</div>
	<div class="editor-actions" aria-hidden="true"><span>Close pull request</span><span>Comment</span></div>
</figure>

## How a button behaves

- A click posts the comment right away.
- A Shift-click inserts the text in the box without posting.
- With text already in the box, a click inserts instead of posting: a draft is never sent by accident.

## Default buttons

<dl class="meanings">
	<dt>LGTM</dt>
	<dd>Posts “LGTM :rocket:” on pull requests.</dd>
	<dt>Rebase</dt>
	<dd>Posts “@dependabot rebase” on pull requests.</dd>
	<dt>Thanks</dt>
	<dd>Posts “Thanks for the contribution!” on issues and pull requests.</dd>
</dl>

## Settings

<div class="panel settings">
	<div><span style="font-weight: 600">Buttons</span><span>Add, edit, reorder or remove them. Each one has a label, a comment, and shows on issues, pull requests or both.</span></div>
	<div><span style="font-weight: 600">Turn off</span><span>Options › Features › quick-comments</span></div>
</div>

## Good to know

- Works on issues and on the conversation tab of pull requests.
- No token needed.
