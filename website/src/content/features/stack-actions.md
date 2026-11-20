---
title: Stack actions
summary: Mark a whole stack ready for review, and request the same reviewers on all of it.
group: Reviewing code
appearsIn: Merge box, reviewers picker
order: 2
lede: A stack of pull requests is reviewed as one piece of work. Mark all its drafts ready for review from the merge box of one of them, and the reviewers you add on one PR get requested on the others too.
needsToken: true
onByDefault: false
---

<figure class="panel cbox" style="margin: 0" aria-label="The Ready for review button with its menu, in the merge box of a draft">
	<b>This pull request is still a work in progress</b>
	<div class="editor-actions" aria-hidden="true"><span>Ready for review ▾</span></div>
	<div style="display: flex; justify-content: flex-end">
		<div class="panel picker">
			<div class="person"><div class="who">This pull request<br /><span>#7297</span></div></div>
			<div class="person"><div class="who">The whole stack<br /><span>5 drafts, from #7293 up to #7297</span></div></div>
		</div>
	</div>
</figure>

## Ready for review

- In the merge box of a draft that sits in a stack, the Ready for review button gets a menu: this pull request, or the whole stack.
- The whole stack opens a list of its PRs with the drafts checked. Uncheck the ones that should stay drafts, then confirm.
- The PRs are marked one by one from the bottom of the stack up, so the review requests reach your reviewers in the order of the stack.
- PRs already ready for review, merged, closed, or that you can't edit stay unchecked.
- The menu shows only when at least two PRs of the stack are drafts.

## Reviewers

- The reviewers picker of a PR in a stack gets a checkbox: also request them on the rest of the stack. It starts unchecked.
- When the picker closes, the reviewers you added there are requested on the other open PRs of the stack, on top of those already requested. Removing a reviewer only applies to the PR of the page.

## Settings

<div class="panel settings">
	<div><span style="font-weight: 600">Turn on</span><span>Off by default: Options › Features › stack-actions</span></div>
</div>

## Good to know

- Works with GitHub's stacked pull requests, on the overview of a pull request in the new PR pages.
- A toast follows the progress PR by PR. If some PRs fail, the others still go through, and the toast lists what failed.
- Needs a token with read and write access to <i>Pull requests</i>, like quick-approvals.
