---
title: Unresolved comments
summary: How many review conversations are still open on each PR.
group: Triage
appearsIn: PR list
order: 4
lede: How many review conversations are still unresolved on each open PR, on every row of the PR list. You see which PRs still wait on an answer before opening them.
needsToken: true
onByDefault: false
---

## What counts

- Review conversations, the threads started on a line of the diff, that nobody marked as resolved. Outdated threads count as long as they are unresolved.
- Only open PRs show a count, and only when it is above zero.
- Past 100 conversations on a PR, the count reads `100+`.
- The count is fetched again on every visit, so a thread resolved a moment ago drops out right away.

## Settings

<div class="panel settings">
	<div><span style="font-weight: 600">Turn on</span><span>Off by default: Options › Features › unresolved-comments</span></div>
	<div><span style="font-weight: 600">Badge placement</span><span>Right column (default) or the grey line under the title. Shared by all PR list badges.</span></div>
</div>

## Good to know

- Shown on the pull request list of a repository and on your own, at github.com/pulls. There, PRs from repositories your token cannot read stay without a badge.
- Needs a token with read access to <i>Pull requests</i>.
