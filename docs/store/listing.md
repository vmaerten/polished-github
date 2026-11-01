# Store listings

Texts and answers for the Chrome Web Store and Firefox Add-ons (AMO). Every public text says the extension is not affiliated with GitHub, Inc.

## Shared

| Field                                                                                | Value                                                                   |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Name                                                                                 | Polished GitHub                                                         |
| Short description (from `manifest.json`, 132 characters max on the Chrome Web Store) | Review pull requests faster on GitHub. Not affiliated with GitHub, Inc. |
| Homepage                                                                             | https://github.com/vmaerten/polished-github                             |
| Support                                                                              | https://github.com/vmaerten/polished-github/issues                      |

### Long description

```text
Polished GitHub adds what is missing when you review pull requests on github.com. It changes nothing else: every feature can be turned off in the options.

Not affiliated with, endorsed or sponsored by GitHub, Inc. GitHub is a trademark of GitHub, Inc.

IN THE PR LIST
• Review status: where each PR stands for you, review requested, re-review, changes requested, or approved with commits pushed since.
• Diff stats: lines added and removed, files changed and a size from XS to XL.
• Idle PRs: days since the last activity, past a threshold you choose.
The badges go in a right-hand column aligned from row to row, or in the grey line under the title.

IN THE REVIEWERS PICKER
• Reviewer load: how many reviews each person already has waiting, so you pick someone who has room.

IN COMMENTS AND READMES
• Quick comments: your usual replies as one-click buttons above the comment box.
• Image modal: images open in a zoomable modal instead of a new tab, arrow keys go through them.

YOUR TOKEN STAYS WITH YOU
The PR list badges and the reviewer load need a read-only GitHub token (a fine-grained token with read access to Pull requests). It is stored in your browser only and sent only to api.github.com. The extension has no server and no analytics.

Source code and issues: https://github.com/vmaerten/polished-github
```

## Chrome Web Store

| Field                                      | Value                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Category                                   | Developer Tools                                                                                                           |
| Language                                   | English                                                                                                                   |
| Single purpose                             | Speed up pull request reviews on github.com by adding review information and shortcuts to GitHub pages.                   |
| `storage` justification                    | Saves the user's settings and, on this device only, the GitHub token they enter in the options.                           |
| Host permission `https://github.com/*`     | The features run on github.com pages: PR list badges, reviewers picker counts, quick comment buttons and the image modal. |
| Host permission `https://api.github.com/*` | Reads review status, diff stats and pending review counts from the GitHub API with the user's own token.                  |
| Remote code                                | No. Everything ships in the package.                                                                                      |

**Data usage.** The token is sent to api.github.com to authenticate the user's own requests, so declare _Authentication information_, then certify that the data is not sold, not used for anything but the single purpose, and not used for creditworthiness or lending. Nothing else is collected. Check the wording of the form at submission time, it changes.

**Privacy policy.** Required once user data is declared. The text is in [privacy-policy.md](privacy-policy.md); it needs a public URL, for example a page on the website.

**Assets.**

| Asset              | Size               | Status                                                                        |
| ------------------ | ------------------ | ----------------------------------------------------------------------------- |
| Icon               | 128 × 128          | `source/icons/icon-128.png`                                                   |
| Screenshots        | 1280 × 800, 1 to 5 | To make: PR list, reviewers picker, quick comments, image modal, options page |
| Small promo tile   | 440 × 280          | To make from the branding board's Boost tile                                  |
| Marquee promo tile | 1400 × 560         | Optional                                                                      |

## Firefox Add-ons (AMO)

| Field                        | Value                                                                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Summary (250 characters max) | Review pull requests faster on GitHub: review status, PR size and idle time in the PR list, reviewer load in the reviewers picker, quick comments and an image modal. Not affiliated with GitHub, Inc. |
| Categories                   | Web Development                                                                                                                                                                                        |
| Support site                 | https://github.com/vmaerten/polished-github/issues                                                                                                                                                     |
| License                      | MIT                                                                                                                                                                                                    |
| Description                  | The long description above. AMO renders a subset of Markdown, so the bullets and capital headings can stay as they are.                                                                                |

**Before submitting.**

- **Source code.** The package is bundled by tsdown, so AMO asks for the source and the build steps: `pnpm install --frozen-lockfile` then `pnpm exec tsdown`, with Node and pnpm versions from `package.json`.
- **Data collection.** `manifest.json` declares `data_collection_permissions: none`. Check whether sending the token to api.github.com counts as `authenticationInfo` under Mozilla's current definition, and update the manifest if it does.
- **Screenshots.** Same set as the Chrome Web Store, 1280 × 800.
