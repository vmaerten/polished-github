# Publishing

`task release VERSION=1.2.0` bumps the version, tags it and pushes. The tag starts `.github/workflows/release.yml`: it creates the GitHub release with both zips, then submits them for review, the Chrome package from the `Chrome` environment and the Firefox package from the `Firefox` environment. The listings themselves stay in each store's dashboard, filled from [`listing.md`](listing.md).

Each store job reads its credentials from its GitHub environment (Settings › Environments). A lost or revoked key only breaks that store's job: create new credentials below and replace the secrets.

## Chrome Web Store

| Name                | Kind     | Where it comes from                                           |
| ------------------- | -------- | ------------------------------------------------------------- |
| `CWS_PUBLISHER_ID`  | Variable | Chrome Web Store developer dashboard › Account › Publisher ID |
| `CWS_CLIENT_ID`     | Secret   | The OAuth client below                                        |
| `CWS_CLIENT_SECRET` | Secret   | The OAuth client below                                        |
| `CWS_REFRESH_TOKEN` | Secret   | Generated with the OAuth client, signed in as the publisher   |

1. In the [Google Cloud console](https://console.cloud.google.com), create a project and enable the **Chrome Web Store API**.
2. Set up the OAuth consent screen as **External**, then publish it to **In production**: while it is in testing, Google expires the refresh token after 7 days.
3. Create an OAuth client ID of type **Desktop app**: it gives the client ID and the client secret.
4. Run `npx chrome-webstore-upload-keys` and sign in with the Google account that owns the extension: it prints the refresh token. The [chrome-webstore-upload-keys](https://github.com/fregante/chrome-webstore-upload-keys) readme walks through the same steps.
5. Save them:

```sh
gh variable set CWS_PUBLISHER_ID --env Chrome
gh secret set CWS_CLIENT_ID --env Chrome
gh secret set CWS_CLIENT_SECRET --env Chrome
gh secret set CWS_REFRESH_TOKEN --env Chrome
```

## Firefox Add-ons

| Name             | Kind   | Where it comes from                                 |
| ---------------- | ------ | --------------------------------------------------- |
| `AMO_JWT_ISSUER` | Secret | AMO API key, the "JWT issuer" (`user:12345678:123`) |
| `AMO_JWT_SECRET` | Secret | AMO API key, the "JWT secret"                       |

1. Sign in to [addons.mozilla.org](https://addons.mozilla.org) with an account that is a developer of the add-on, and open [Manage API Keys](https://addons.mozilla.org/developers/addon/api/key/).
2. Generate new credentials. AMO shows the secret only once, and generating a new pair revokes the previous one.
3. Save them:

```sh
gh secret set AMO_JWT_ISSUER --env Firefox
gh secret set AMO_JWT_SECRET --env Firefox
```

AMO reviews each listed version by hand and asks for the source code, since the package is bundled: the job uploads a `git archive` of the tag. For a version submitted by hand, upload `git archive --format=zip --output source.zip v1.2.0` along with the build steps in [`listing.md`](listing.md#firefox-add-ons-amo).
