---
title: Diff stats
summary: Lines added and removed, files and a size label.
group: Triage
appearsIn: PR list
order: 2
lede: Lines added and removed, the number of files and a size label, on every row of the PR list. You know how big a review is before opening it.
needsToken: true
featured: true
---

<figure class="prlist" style="margin: 0; box-shadow: none" aria-label="PR rows with their diff stats">
	<div class="pr-row" style="border-top: 0">
		<div class="pr-main">
			<span class="pr-title">golangci-lint: add prealloc as a linter</span
			><span class="pr-meta">#3085 opened 2 days ago by christiandins</span>
		</div>
		<span class="diff" style="font-size: 13px"><span class="a">+189</span> <span class="d">−8</span> <span class="f">· 4 files</span> <b>M</b></span>
	</div>
	<div class="pr-row">
		<div class="pr-main">
			<span class="pr-title">feat: OpenTelemetry tracing for task execution</span
			><span class="pr-meta">#3077 opened last week by caseycs</span>
		</div>
		<span class="diff" style="font-size: 13px"><span class="a">+643</span> <span class="d">−28</span> <span class="f">· 12 files</span> <b>L</b></span>
	</div>
	<div class="pr-row">
		<div class="pr-main">
			<span class="pr-title">feat(input): add search and scrolling to choice prompts</span
			><span class="pr-meta">#3071 opened 2 weeks ago by vmaerten</span>
		</div>
		<span class="diff" style="font-size: 13px"><span class="a">+125</span> <span class="d">−16</span> <span class="f">· 1 file</span> <b>M</b></span>
	</div>
</figure>

## Size labels

<dl class="meanings">
	<dt>XS</dt>
	<dd>Up to 10 changed lines.</dd>
	<dt>S</dt>
	<dd>Up to 50.</dd>
	<dt>M</dt>
	<dd>Up to 250.</dd>
	<dt>L</dt>
	<dd>Up to 1,000.</dd>
	<dt>XL</dt>
	<dd>More than 1,000.</dd>
</dl>

<p class="muted" style="font-size: 15px">Changed lines are lines added plus lines removed. The four thresholds are yours to change.</p>

## Settings

<div class="panel settings">
	<div><span style="font-weight: 600">Files count</span><span>Show or hide “· 4 files”.</span></div>
	<div><span style="font-weight: 600">Size label</span><span>Show or hide it, and set its thresholds.</span></div>
	<div><span style="font-weight: 600">Badge placement</span><span>Right column (default) or the grey line under the title. Shared by all PR list badges.</span></div>
	<div><span style="font-weight: 600">Turn off</span><span>Options › Features › pr-list-diff-stats</span></div>
</div>

## Good to know

- Shown on the pull request list of a repository.
- The numbers are fetched once per tab: reload the page to refresh them.
- Needs a token with read access to <i>Pull requests</i>.
