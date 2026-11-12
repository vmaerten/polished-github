# Changelog

All notable changes to Polished GitHub. Versions follow [Semantic Versioning](https://semver.org/).

## Unreleased

### ✨ Features

- An Approve button next to the review button approves the pull request with one of your predefined messages from its menu, which shows their emoji as GitHub does, or without a message on a ⌘ or Ctrl-click. A toast confirms the approval, or explains why GitHub refused it. Off by default, it needs a token with read and write access to Pull requests (`quick-approvals`).

  <img width="415" alt="The Approve button and its menu of predefined messages" src="https://github.com/user-attachments/assets/bba5750a-b5fa-4531-9105-3519645e2ff4">

- The review status, diff stats, idle time and unresolved conversations badges also show in your pull request list at github.com/pulls, for the repositories your token can read (`review-status`, `diff-stats`, `idle-prs`, `unresolved-comments`).
- After an update that brings new features, a toast on github.com links to what's new.

  <img width="318" alt="The toast after an update, with a link to what's new" src="https://github.com/user-attachments/assets/122a1bc4-7743-47ba-8654-3e0c1ad31722">

- In the changelog and the release notes, each feature id links to the page that explains the feature.
- The options flag the features you see there for the first time as new.

  <img width="862" alt="The new badge next to quick-approvals in the options" src="https://github.com/user-attachments/assets/4d58c63b-b9b7-4af0-b56f-1aa2bc58044d">

- The quick comment buttons show the emoji of their label, and their tooltip those of the comment, as GitHub does (`quick-comments`).

### 🐛 Fixes

- The token check in the options shows the GitHub API quota the features spend, the GraphQL one, instead of the REST quota none of them uses.

## 0.3.1 - 2026-11-11

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
