# github-power

Browser extension (Chrome & Firefox) that adds superpowers to GitHub. Architecture inspired by [Refined GitHub](https://github.com/refined-github/refined-github).

## Development

```sh
pnpm install
pnpm watch                # rebuilds distribution/ on change
pnpm start:chrome         # or start:firefox: opens a browser with the extension loaded
```

To use your everyday browser instead, load `distribution/` as an unpacked extension (`chrome://extensions`, developer mode) or as a temporary add-on (`about:debugging` in Firefox). In Firefox, grant the github.com permission from the extension's page in `about:addons`: Manifest V3 makes host permissions opt-in.

Before pushing: `pnpm lint && pnpm typecheck && pnpm test`. `pnpm format` fixes formatting.

## Layout

- `source/content-script.ts` starts the feature manager on every github.com page.
- `source/feature-manager.ts` runs each feature on matching pages, again after every in-app navigation, and skips features the user disabled or that need a missing token.
- `source/features/` holds one file per feature, registered in `features/index.ts`.
- `source/github-helpers/api.ts` calls the GitHub REST (`v3`) and GraphQL (`v4`) APIs with the user's token.
- `source/options/` is the options page (Svelte).

## Adding a feature

1. Create `source/features/<feature-id>.tsx` exporting a `Feature`: `id`, `description`, optional `include`/`exclude` page detectors from [`github-url-detection`](https://github.com/refined-github/github-url-detection), `requiresToken` if it calls the API, and `init(signal)`.
2. Add it to `source/features/index.ts`.

`init` runs again after each in-app navigation: check the element isn't already there before injecting, and pass `signal` to listeners and `element-ready` so they stop on the next navigation. Use [`dom-chef`](https://github.com/vadimdemedes/dom-chef) JSX for small injections, a Svelte component for anything stateful.
