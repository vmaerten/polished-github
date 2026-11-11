---
title: Quick approvals
summary: Approve a PR with one of your messages, from its header.
group: Reviewing code
appearsIn: PR header
order: 1
lede: An Approve button next to the review button of a pull request. Its menu approves with one of your messages, and a ⌘ or Ctrl-click approves without a message.
needsToken: true
onByDefault: false
---

<figure class="panel cbox" style="margin: 0" aria-label="The Approve button and its menu next to the review button">
	<div class="editor-actions" aria-hidden="true"><span>Merge status</span><span>✓ Approve ▾</span><span>Submit review ▾</span></div>
	<div style="display: flex; justify-content: flex-end">
		<div class="panel picker">
			<div class="picker-title">Approve with</div>
			<div class="person"><div class="who">LGTM<br /><span>LGTM :rocket:</span></div></div>
			<div class="person"><div class="who">Ship it<br /><span>Ship it :ship:</span></div></div>
			<div class="person"><div class="who"><span>Without a message</span></div></div>
		</div>
	</div>
</figure>

## How the button behaves

- A click on Approve opens the menu: pick one of your messages, or an approval without a message. A click alone never approves.
- A ⌘-click, or Ctrl-click outside macOS, approves right away without a message.
- The button then reads Approved. GitHub records the approval under your account, as if you had approved from its page.
- It does not show on your own pull requests, which GitHub does not let you approve, nor on closed or merged ones.

## Default messages

<dl class="meanings">
	<dt>LGTM</dt>
	<dd>Approves with “LGTM :rocket:”.</dd>
	<dt>Ship it</dt>
	<dd>Approves with “Ship it :ship:”.</dd>
</dl>

## Settings

<div class="panel settings">
	<div><span style="font-weight: 600">Turn on</span><span>Off by default: Options › Features › quick-approvals</span></div>
	<div><span style="font-weight: 600">Messages</span><span>Add, edit, reorder or remove them. Each one has a label and a message.</span></div>
</div>

## Good to know

- Works on every tab of a pull request, in the new overview and in the classic conversation page.
- Needs a token with read and write access to <i>Pull requests</i>, unlike the other features. The options link to a form that creates one.
