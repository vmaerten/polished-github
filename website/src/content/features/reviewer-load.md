---
title: Reviewer load
summary: Pending reviews per person, where you pick reviewers.
group: Triage
appearsIn: Reviewers picker
order: 4
lede: Next to each name in the reviewers picker, how many open PRs already wait for that person's review. You spread reviews instead of piling them on the same people.
needsToken: true
featured: true
---

<div class="center">
<figure class="panel picker" style="margin: 0" aria-label="Reviewers picker with a pending review count next to each person">
	<div class="picker-title">Request up to 15 reviewers</div>
	<div class="picker-search">Find a user</div>
	<div class="picker-section"><span>Suggestions</span><span>Pending reviews</span></div>
	<div class="person">
		<span class="avatar" style="background: #a5d6ff" aria-hidden="true">AN</span
		><span class="who"><b>andreynering</b> <span>Andrey Nering</span></span
		><span class="load load-high">8</span>
	</div>
	<div class="person">
		<span class="avatar" style="background: #d2a8ff" aria-hidden="true">PD</span
		><span class="who"><b>pd93</b> <span>Pete Davison</span></span
		><span class="load load-mid">5</span>
	</div>
	<div class="picker-section"><span>Everyone else</span><span>Pending reviews</span></div>
	<div class="person">
		<span class="avatar" style="background: #ffa198" aria-hidden="true">VM</span
		><span class="who"><b>vmaerten</b> <span>Valentin Maerten</span></span
		><span class="load load-low">2</span>
	</div>
	<div class="person">
		<span class="avatar" style="background: #7ee2b8" aria-hidden="true">TB</span
		><span class="who"><b>task-bot</b></span
		><span class="load load-low">0</span>
	</div>
</figure>
</div>

## What the colors mean

<dl class="meanings">
	<dt><span class="load load-low">0–2</span></dt>
	<dd>A normal load.</dd>
	<dt><span class="load load-mid">3–5</span></dt>
	<dd>Busy: think twice before adding one more.</dd>
	<dt><span class="load load-high">6+</span></dt>
	<dd>Overloaded: pick someone else if you can.</dd>
</dl>

## What is counted

- Open PRs where that person's review is requested, across every repository of the organization or user that owns the current one.
- For a team, the PRs where the team's review is requested.
- Counts load when you open the picker, and again for the new names when you filter it.

## Settings

<div class="panel settings">
	<div><span style="font-weight: 600">Turn off</span><span>Options › Features › reviewer-load</span></div>
</div>

## Good to know

- Needs a token. Private repositories are counted only if the token can read them.
