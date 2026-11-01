# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

## Unreleased

## 0.1.0 - 2026-11-01

### Added

- `image-modal`: images in issues, PRs, comments and READMEs open in a zoomable modal instead of a new tab. Cycling, zoom and badges can be turned on or off in the options.
- `quick-comments`: buttons above the comment box post a predefined comment in one click.
- `diff-stats`: the repository PR list shows lines added and removed, changed files and a size label for each PR.
- `review-status`: the repository PR list shows where each PR stands for you: review requested, re-review, changes requested, or approved with commits pushed since.
- `idle-prs`: the repository PR list flags PRs with no activity for a configurable number of days, drafts excluded unless asked.
- `reviewer-load`: the reviewers picker of a PR shows how many reviews each person already has pending in the repository owner's account.
- Options page with the GitHub token, feature switches and per-feature settings.
- The PR list badges go in the right column, aligned from row to row, or in the grey line under the title, as set in the options.
- The extension is named Polished GitHub and has its own icon.
- The options page takes the Polished GitHub look: Boost palette, Manrope and JetBrains Mono, and the logo in the header.
- In Firefox, saving a token first asks for your consent to send it, with the repositories and PRs you browse, to the GitHub API. Withdrawing that consent in the add-ons manager removes the token.
