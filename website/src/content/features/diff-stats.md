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
			<span class="pr-title">feat(cmd): add ask option to commands</span
			><span class="pr-meta">#2701 opened on Feb 21 by vmaerten</span>
		</div>
		<span class="diff" style="font-size: 13px"><span class="a">+61</span> <span class="d">−0</span> <span class="f">· 4 files</span> <b>S</b></span>
	</div>
	<div class="pr-row">
		<div class="pr-main">
			<span class="pr-title">refactor(watch): detect filesystem changes with fsbroker</span
			><span class="pr-meta">#3064 opened 3 weeks ago by andreynering</span>
		</div>
		<span class="diff" style="font-size: 13px"><span class="a">+323</span> <span class="d">−103</span> <span class="f">· 11 files</span> <b>L</b></span>
	</div>
	<div class="pr-row">
		<div class="pr-main">
			<span class="pr-title">feat: split executor and reader</span
			><span class="pr-meta">#2366 opened on Aug 11, 2025 by pd93</span>
		</div>
		<span class="diff" style="font-size: 13px"><span class="a">+2,700</span> <span class="d">−2,645</span> <span class="f">· 27 files</span> <b>XL</b></span>
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

<p class="muted">Changed lines are lines added plus lines removed. The four thresholds are yours to change.</p>

## Settings

<div class="panel settings">
	<div><span style="font-weight: 600">Files count</span><span>Show or hide “· 4 files”.</span></div>
	<div><span style="font-weight: 600">Size label</span><span>Show or hide it, and set its thresholds.</span></div>
	<div><span style="font-weight: 600">Badge placement</span><span>Right column (default) or the grey line under the title. Shared by all PR list badges.</span></div>
	<div><span style="font-weight: 600">Turn off</span><span>Options › Features › diff-stats</span></div>
</div>

## Good to know

- Shown on the pull request list of a repository.
- The numbers are fetched once per tab: reload the page to refresh them.
- Needs a token with read access to <i>Pull requests</i>.
