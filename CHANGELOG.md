# Changelog

All notable changes to Polished GitHub. Versions follow [Semantic Versioning](https://semver.org/).

## Unreleased

### 🐛 Fixes

- The quick comment buttons and the pending reviews of each reviewer work again on GitHub's new pull request overview page, as well as on the classic one (`quick-comments`, `reviewer-load`).

## 0.3.0 - 2026-11-05

### ✨ Features

- The commit email rules suggest your organizations and verified emails, from the merge boxes you opened or, when the token can read them, from your account (`merge-email`).
- Images in a pull request's changes open in the image viewer from a button in their corner, and a changed image switches between its old and new versions at the same zoom (`image-modal`).
- The arrow keys keep the zoom and position from one image to the next (`image-modal`).
- An option counts only the reviews requested from each person directly, leaving out those requested from one of their teams (`reviewer-load`).
- See how many review conversations are still unresolved on each open PR of the list. Off by default: turn it on in the options (`unresolved-comments`).

### 🐛 Fixes

- The diff stats of a large pull request no longer run over its review status in the right-hand column (`diff-stats`).
- A PR list feature you turn off no longer keeps its empty column in the right-hand column of every row.

## 0.2.0 - 2026-11-03

### ✨ Features

- Merge with the right email for each organization: set an email per owner, and the merge box picks it when you merge or squash (`merge-email`).
- The options page is in French when your browser is.
- The token form opens pre-filled with the permissions the features need.

### 🐛 Fixes

- The reviewers picker no longer jumps while the review counts load (`reviewer-load`).
- After the extension updates, tabs left open stop quietly instead of throwing "Extension context invalidated" errors.

## 0.1.0 - 2026-11-01

The first release, for Chrome and Firefox.

### ✨ Features

- See where each PR stands for you in the repository PR list: review requested, re-review, changes requested, or approved with commits pushed since (`review-status`).
- See the lines added and removed, the changed files and a size from XS to XL for each PR in the list (`diff-stats`).
- Spot the PRs with no activity for a number of days you choose, drafts left out unless you ask (`idle-prs`).
- Pick a reviewer who has room: the reviewers picker shows how many reviews each person already has waiting (`reviewer-load`).
- Post your usual replies in one click with buttons above the comment box, or Shift-click to insert them instead (`quick-comments`).
- Open images from issues, PRs, comments and READMEs in a zoomable modal instead of a new tab, and go through them with the arrow keys (`image-modal`).
- Put the PR list badges in an aligned right-hand column or in the grey line under the title.
- Turn each feature on or off and set it up in the options page, where the GitHub token is stored on your device only.

### 🔒 Privacy

- In Firefox, saving a token first asks for your consent to send it, with the repositories and PRs you browse, to the GitHub API. Withdrawing that consent in the add-ons manager removes the token.
