# Contributing

## Development

Needs [pnpm](https://pnpm.io) and [Task](https://taskfile.dev). `task` lists every command.

```sh
task install
task dev                  # rebuilds distribution/ (Chrome) on change
task start                # opens Chromium with the extension loaded; TARGET=firefox-desktop for Firefox
```

To use your everyday browser instead, run `task build` and load `distribution/` as an unpacked extension (`chrome://extensions`, developer mode), or `distribution-firefox/` as a temporary add-on (`about:debugging` in Firefox). The Firefox package also declares the background script that drops the token when the data consent is withdrawn; Chrome would flag it. In Firefox, grant the github.com permission from the extension's page in `about:addons`: Manifest V3 makes host permissions opt-in.

The website lives in `website/` (Astro, a pnpm workspace package): `task website:dev` serves it with live reload.

## Layout

- `source/content-script.ts` starts the feature manager on every github.com page.
- `source/feature-manager.ts` runs each feature on matching pages, again after every in-app navigation, and skips features the user disabled or that need a missing token.
- `source/features/` holds one file per feature (a folder for bigger ones), registered in `features/index.ts`.
- `source/github-helpers/api.ts` calls the GitHub REST (`v3`) and GraphQL (`v4`) APIs with the user's token.
- `source/options/` is the options page (Svelte).

## Adding a feature

1. Create `source/features/<feature-id>.tsx` exporting a `Feature`: `id`, `description`, optional `include` page detectors from [`github-url-detection`](https://github.com/refined-github/github-url-detection), `requiresToken` if it calls the API, and `init(signal)`.
2. Add it to `source/features/index.ts`.

`init` runs again after each in-app navigation: check the element isn't already there before injecting, and pass `signal` to listeners and to `observe` (`source/helpers/observe.ts`) so they stop on the next navigation. Use [`dom-chef`](https://github.com/vadimdemedes/dom-chef) JSX for small injections, a Svelte component for anything stateful.

## Pull requests

- Every pull request closes an issue. Open one first, a [bug report or a feature request](https://github.com/vmaerten/polished-github/issues/new/choose), so the change is agreed on before anyone writes code, then write `Closes #123` in the description.
- One change per pull request, titled as a conventional commit: `fix(review-status): keep the badge after a force push`.
- List user-facing changes under `## Unreleased` in `CHANGELOG.md`.
- For anything visible, add a screenshot and a real github.com URL where you checked it.
- Run `task check` before pushing: it runs what CI runs, and `task format` fixes formatting.
