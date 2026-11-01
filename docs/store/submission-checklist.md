# Store submission checklist

Texts, answers and assets live in [listing.md](listing.md) and [assets/](assets/).

## Before the release

- [x] Install Firefox, then `task build && task start TARGET=firefox-desktop`, and check:
  - [x] Saving a token asks for consent; declining saves nothing and says why.
  - [x] Withdrawing the consent in `about:addons` empties the token field in the options.
  - [x] With a token, the PR list badges and the reviewer load show up (no host permission any more).
- [ ] In Chrome, load `distribution/` unpacked and check that it loads without errors and that every feature works with a token.
- [x] On a PR page, go elsewhere then back: the quick comment buttons still post.
- [ ] Decide on Firefox for Android: `manifest.json` declares `gecko_android`, but nothing was tested there. Keep it or remove it.
- [ ] Make the repository public: the homepage, support and source links in the listings point to it, and AMO reviews the source.
- [ ] Have a developer account on the Chrome Web Store (one-time fee) and on addons.mozilla.org.

## Release

- [ ] From an up-to-date `main`: `task release VERSION=0.1.0`.
- [ ] The release workflow publishes `polished-github-chrome-0.1.0.zip` and `polished-github-firefox-0.1.0.zip` on GitHub.

## Chrome Web Store

- [ ] Upload `polished-github-chrome-0.1.0.zip`.
- [ ] Store listing: description, Developer Tools category, English, the 5 screenshots, the small promo tile, the marquee (optional).
- [ ] Privacy practices: single purpose, `storage` justification, content script on github.com, remote code: no.
- [ ] Data usage: _Authentication information_ and _Web browsing activity_, then the three certifications.
- [ ] Privacy policy: https://polished-github.vmaerten.fr/privacy/
- [ ] Distribution: public, every region.

## Firefox Add-ons (AMO)

- [ ] Upload `polished-github-firefox-0.1.0.zip`, listed on the site.
- [ ] Source code: an archive of the repository, with `pnpm install --frozen-lockfile && pnpm exec tsdown && node build/firefox.ts` and the Node and pnpm versions from `package.json`.
- [ ] Reviewer notes: the 4 `UNSAFE_VAR_ASSIGNMENT` warnings come from Svelte's compiled templates and dom-chef, never with page data. Firefox's consent labels say data is shared "with extension developer": it only goes to api.github.com, never to us.
- [ ] Listing: summary, description, Web Development category, support site, MIT license, privacy policy, screenshots.

## After publication

- [ ] Point the website's "Add to Chrome" and "Add to Firefox" buttons, and its install section, at the store pages.
- [ ] Replace the manual install in the README with the store links.
