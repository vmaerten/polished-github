---
title: Review status
summary: Where each PR stands for you, on every row of the list.
group: Triage
appearsIn: PR list
order: 1
lede: Where each pull request stands for you, on every row of the PR list. You stop opening PRs just to find out whether you already reviewed them.
needsToken: true
featured: true
---

<figure class="prlist" style="margin: 0; box-shadow: none" aria-label="PR rows with a review status badge">
	<div class="pr-row" style="border-top: 0">
		<div class="pr-main">
			<span class="pr-title">feat: OpenTelemetry tracing for task execution</span
			><span class="pr-meta">#3077 opened last week by caseycs</span>
		</div>
		<span class="status s-requested" style="width: 190px; font-size: 13px"
			><span class="dot" aria-hidden="true"></span>Review requested</span
		>
	</div>
	<div class="pr-row">
		<div class="pr-main">
			<span class="pr-title">fix: preserve dotenv declaration order</span
			><span class="pr-meta">#3078 opened last week by satya-sudo</span>
		</div>
		<span class="status s-rereview" style="width: 190px; font-size: 13px"
			><span class="dot" aria-hidden="true"></span>Re-review</span
		>
	</div>
	<div class="pr-row">
		<div class="pr-main">
			<span class="pr-title">feat(input): add search and scrolling to choice prompts</span
			><span class="pr-meta">#3071 opened 2 weeks ago by vmaerten</span>
		</div>
		<span class="status s-changes" style="width: 190px; font-size: 13px"
			><span class="dot" aria-hidden="true"></span>Changes requested</span
		>
	</div>
	<div class="pr-row">
		<div class="pr-main">
			<span class="pr-title">refactor(watch): detect filesystem changes with fsbroker</span
			><span class="pr-meta">#3064 opened last month by andreynering</span>
		</div>
		<span class="status s-outdated" style="width: 190px; font-size: 13px"
			><span class="dot" aria-hidden="true"></span>Approved · new commits</span
		>
	</div>
</figure>

## What each status means

<dl class="meanings">
	<dt class="s-requested">Review requested</dt>
	<dd>You are asked and have not reviewed yet.</dd>
	<dt class="s-rereview">Re-review</dt>
	<dd>You reviewed, then the author pushed or asked you again.</dd>
	<dt class="s-changes">Changes requested</dt>
	<dd>You asked for changes and nothing has moved since.</dd>
	<dt class="s-outdated">Approved · new commits</dt>
	<dd>You approved, and commits landed after your approval.</dd>
</dl>

<p class="muted" style="font-size: 15px">A plain approval gets no badge: GitHub already shows it.</p>

## Settings

<div class="panel settings">
	<div>
		<span style="font-weight: 600">Badge placement</span
		><span>Right column (default) or the grey line under the title. Shared by all PR list badges.</span>
	</div>
	<div><span style="font-weight: 600">Turn off</span><span>Options › Features › Review status</span></div>
</div>

## Good to know

- Statuses are fetched again on every visit, so they are never stale.
- A review you started but did not submit counts as no review.
- Needs a token with read access to <i>Pull requests</i>.
