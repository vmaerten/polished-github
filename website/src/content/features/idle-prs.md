---
title: Idle PRs
summary: Days since the last activity, past a threshold you set.
group: Triage
appearsIn: PR list
order: 3
lede: Days since the last activity on an open PR, once it passes a threshold you set. The PRs everyone forgot stand out in the list.
needsToken: true
featured: true
---

<figure class="prlist" style="margin: 0; box-shadow: none" aria-label="PR rows flagged as idle">
	<div class="pr-row" style="border-top: 0">
		<div class="pr-main">
			<span class="pr-title">feat: OpenTelemetry tracing for task execution</span
			><span class="pr-meta">#3077 opened last week by caseycs</span>
		</div>
		<span class="idle" style="font-size: 13px"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.25"></circle><path d="M8 4.5V8l2.5 1.5"></path></svg>9d</span>
	</div>
	<div class="pr-row">
		<div class="pr-main">
			<span class="pr-title">feat(input): add search and scrolling to choice prompts</span
			><span class="pr-meta">#3071 opened 2 weeks ago by vmaerten</span>
		</div>
		<span class="idle" style="font-size: 13px"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.25"></circle><path d="M8 4.5V8l2.5 1.5"></path></svg>16d</span>
	</div>
	<div class="pr-row">
		<div class="pr-main">
			<span class="pr-title">refactor(watch): detect filesystem changes with fsbroker</span
			><span class="pr-meta">#3064 opened last month by andreynering</span>
		</div>
		<span class="idle" style="font-size: 13px"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.25"></circle><path d="M8 4.5V8l2.5 1.5"></path></svg>17d</span>
	</div>
</figure>

## When a PR counts as idle

- It is open, and nothing happened on it for 7 days or more. Any update counts as activity: a comment, a push, a review, a label.
- Draft PRs are left alone unless you ask for them.
- The count is fetched again on every visit, so activity resets it right away.

## Settings

<div class="panel settings">
	<div><span style="font-weight: 600">Threshold</span><span>7 days by default.</span></div>
	<div><span style="font-weight: 600">Drafts</span><span>Off by default: draft PRs are never flagged.</span></div>
	<div><span style="font-weight: 600">Badge placement</span><span>Right column (default) or the grey line under the title. Shared by all PR list badges.</span></div>
	<div><span style="font-weight: 600">Turn off</span><span>Options › Features › pr-list-stale</span></div>
</div>

## Good to know

- Shown on the pull request list of a repository.
- Needs a token with read access to <i>Pull requests</i>.
