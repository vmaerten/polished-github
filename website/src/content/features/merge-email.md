---
title: Merge email
summary: The right commit email for each organization when you merge.
group: Merging
appearsIn: Merge box
order: 1
lede: GitHub merges with one default email everywhere. Tell it which email goes with which organization, and the merge box picks it for you.
---

<figure class="panel cbox" style="margin: 0" aria-label="The merge box with the organization's commit email selected">
	<b>Commit message</b>
	<div class="editor"><div class="editor-body" style="height: auto">feat: export the report as CSV (#42)</div></div>
	<b>Commit email</b>
	<div class="editor"><div class="editor-body" style="height: auto; display: flex; justify-content: space-between">me@work.example <span aria-hidden="true">⌄</span></div></div>
	<span class="muted" style="font-size: 13px; margin-top: -6px">Set by Polished GitHub for work-org.</span>
	<div class="editor-actions" aria-hidden="true"><span>Cancel</span><span>Confirm squash and merge</span></div>
</figure>

## How it picks the email

- One rule per owner, organization or user: on its repositories, merges and squashes use that email.
- Owners without a rule keep GitHub's default email.
- A note under the field says the extension chose it. Pick another email by hand and it stays your choice for that merge.
- The email must be a verified email of your GitHub account: otherwise the field is left as is, and the note says so.

## Settings

<div class="panel settings">
	<div><span style="font-weight: 600">Rules</span><span>Options › Features › merge-email: an owner and an email per row.</span></div>
	<div><span style="font-weight: 600">Turn off</span><span>Options › Features › merge-email</span></div>
</div>

## Good to know

- GitHub only offers the choice when the commit is yours: squashing someone else's pull request, a Renovate update for instance, authors the commit as them, and the extension has nothing to pick.
- Covers merges and squashes from the pull request page. Commits made elsewhere in GitHub, and on your machine, keep their own email: for local commits, git's `includeIf` does the same per directory.
- No token needed. The rules are saved with your settings, and the extension sends them nowhere.
