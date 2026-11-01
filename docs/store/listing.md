# Store listings

Texts and answers for the Chrome Web Store and Firefox Add-ons (AMO). Every public text says the extension is not affiliated with GitHub, Inc.

## Shared

| Field                                                                                                   | Value                                                                                                |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Name                                                                                                    | Polished GitHub                                                                                      |
| Short description (from `source/_locales/en/messages.json`, 132 characters max on the Chrome Web Store) | Polishes the GitHub you use every day, starting with pull requests. Not affiliated with GitHub, Inc. |
| Homepage                                                                                                | https://github.com/vmaerten/polished-github                                                          |
| Support                                                                                                 | https://github.com/vmaerten/polished-github/issues                                                   |

### Long description

```text
Polished GitHub adds small, careful improvements to github.com, starting with pull requests. It is free and open source, and changes nothing else: every feature can be turned off in the options.

Not affiliated with, endorsed or sponsored by GitHub, Inc. GitHub is a trademark of GitHub, Inc.

📋 In the PR list
• Review status: where each PR stands for you, review requested, re-review, changes requested, or approved with commits pushed since.
• Diff stats: lines added and removed, files changed and a size from XS to XL.
• Idle PRs: days since the last activity, past a threshold you choose.
The badges go in a right-hand column aligned from row to row, or in the grey line under the title.

👥 In the reviewers picker
• Reviewer load: how many reviews each person already has waiting, so you pick someone who has room.

💬 In comments and READMEs
• Quick comments: your usual replies as one-click buttons above the comment box.
• Image modal: images open in a zoomable modal instead of a new tab, arrow keys go through them.

🔒 Your token stays with you
The PR list badges and the reviewer load need a read-only GitHub token (a fine-grained token with read access to Pull requests). It is stored in your browser only and sent only to api.github.com. The extension has no server and no analytics.

Open source under the MIT license. Code and issues: https://github.com/vmaerten/polished-github
```

## Chrome Web Store

| Field                                    | Value                                                                                                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Category                                 | Developer Tools                                                                                                                                           |
| Language                                 | English                                                                                                                                                   |
| Single purpose                           | Improve github.com pages with information and shortcuts, each of which the user can turn off.                                                             |
| `storage` justification                  | Saves the user's settings and, on this device only, the GitHub token they enter in the options.                                                           |
| Content script on `https://github.com/*` | The features run on github.com pages: PR list badges, reviewers picker counts, quick comment buttons and the image modal.                                 |
| No host permission for `api.github.com`  | The API allows cross-origin requests, so reading review status, diff stats, last activity and pending review counts with the user's own token needs none. |
| Remote code                              | No. Everything ships in the package.                                                                                                                      |

**Data usage.** Check _Authentication information_: the token is handled by the extension, even though it only goes to the GitHub API. Check _Website content_ too: the API requests carry what the extension reads from the page, the repository, the PR numbers and the reviewers' logins. Leave _Web history_ unchecked: the extension keeps no list of visited pages. Then certify that the data is not sold, not used for anything but the single purpose, and not used for creditworthiness or lending.

**Privacy policy.** Required once user data is declared: https://polished-github.vmaerten.fr/privacy/, rendered from [privacy-policy.md](privacy-policy.md).

**Assets.**

| Asset              | Size               | Status                                                                                         |
| ------------------ | ------------------ | ---------------------------------------------------------------------------------------------- |
| Icon               | 128 × 128          | `source/icons/icon-128.png`: a 96 px icon in 16 px of transparent padding                      |
| Screenshots        | 1280 × 800, 1 to 5 | `assets/1-pr-list.png` to `assets/5-options.png`, captured on github.com with the extension    |
| Small promo tile   | 440 × 280          | `assets/promo-small-440x280.png`, from `assets/promo.html`; optional, but listed lower without |
| Marquee promo tile | 1400 × 560         | `assets/promo-marquee-1400x560.png`, optional                                                  |

## Firefox Add-ons (AMO)

| Field                        | Value                                                                                                                                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Summary (250 characters max) | Polishes the GitHub you use every day, starting with pull requests: review status, PR size and idle time in the PR list, reviewer load in the reviewers picker, quick comments and an image modal. Not affiliated with GitHub, Inc. |
| Categories                   | Web Development                                                                                                                                                                                                                     |
| Support site                 | https://github.com/vmaerten/polished-github/issues                                                                                                                                                                                  |
| License                      | MIT                                                                                                                                                                                                                                 |
| Description                  | The Markdown version below: AMO joins lines that follow each other, so headings and bullets need blank lines around them.                                                                                                           |

### AMO description

```markdown
Polished GitHub adds small, careful improvements to github.com, starting with pull requests. It is free and open source, and changes nothing else: every feature can be turned off in the options.

Not affiliated with, endorsed or sponsored by GitHub, Inc. GitHub is a trademark of GitHub, Inc.

**📋 In the PR list**

- Review status: where each PR stands for you, review requested, re-review, changes requested, or approved with commits pushed since.
- Diff stats: lines added and removed, files changed and a size from XS to XL.
- Idle PRs: days since the last activity, past a threshold you choose.

The badges go in a right-hand column aligned from row to row, or in the grey line under the title.

**👥 In the reviewers picker**

- Reviewer load: how many reviews each person already has waiting, so you pick someone who has room.

**💬 In comments and READMEs**

- Quick comments: your usual replies as one-click buttons above the comment box.
- Image modal: images open in a zoomable modal instead of a new tab, arrow keys go through them.

**🔒 Your token stays with you**

The PR list badges and the reviewer load need a read-only GitHub token (a fine-grained token with read access to Pull requests). It is stored in your browser only and sent only to api.github.com. The extension has no server and no analytics.

Open source under the MIT license. Code and issues: https://github.com/vmaerten/polished-github
```

### AMO, French

AMO stores one version of the listing per language. The English one is the default; this French one is for French-speaking users.

Summary (238 characters):

```text
Peaufine le GitHub que vous utilisez chaque jour, à commencer par les pull requests : statut de review, taille et inactivité des PR dans la liste, charge des reviewers, réponses rapides et visionneuse d'images. Sans lien avec GitHub, Inc.
```

Description:

```markdown
Polished GitHub apporte de petites améliorations soignées à github.com, à commencer par les pull requests. Il est gratuit et open source, et ne change rien d'autre : chaque fonctionnalité peut être désactivée dans les options.

Sans lien avec GitHub, Inc., ni approuvé ou soutenu par GitHub, Inc. GitHub est une marque de GitHub, Inc.

**📋 Dans la liste des PR**

- Statut de review : où en est chaque PR pour vous, review demandée, nouvelle review, modifications demandées, ou approuvée avec des commits poussés depuis.
- Statistiques du diff : lignes ajoutées et supprimées, fichiers modifiés et une taille de XS à XL.
- PR inactives : le nombre de jours depuis la dernière activité, au-delà d'un seuil que vous choisissez.

Les badges se placent dans une colonne à droite, alignée d'une ligne à l'autre, ou dans la ligne grise sous le titre.

**👥 Dans le choix des reviewers**

- Charge des reviewers : combien de reviews chaque personne a déjà en attente, pour choisir quelqu'un de disponible.

**💬 Dans les commentaires et les README**

- Réponses rapides : vos réponses habituelles en boutons, publiées en un clic au-dessus de la zone de commentaire.
- Visionneuse d'images : les images s'ouvrent dans une fenêtre zoomable au lieu d'un nouvel onglet, et les flèches du clavier passent de l'une à l'autre.

**🔒 Votre token reste chez vous**

Les badges de la liste des PR et la charge des reviewers nécessitent un token GitHub en lecture seule (un token fine-grained avec l'accès en lecture aux Pull requests). Il est stocké uniquement dans votre navigateur et envoyé uniquement à api.github.com. L'extension n'a ni serveur ni outil d'analyse.

Open source sous licence MIT. Code et issues : https://github.com/vmaerten/polished-github
```

**Before submitting.**

- **Source code.** The package is bundled by tsdown, so AMO asks for the source and the build steps: `pnpm install --frozen-lockfile`, `pnpm exec tsdown`, then `node build/firefox.ts`, which writes the Firefox package to `distribution-firefox/`. Node and pnpm versions come from `package.json`.
- **Data collection.** Mozilla counts the token sent to api.github.com as `authenticationInfo`, and the repositories, PRs and reviewers it looks up as `browsingActivity`. `manifest.json` declares both as optional data: the options page asks for consent when the user saves a token in Firefox, and `background.ts`, declared in the Firefox package only, removes the token when the consent is withdrawn.
- **Screenshots.** Same set as the Chrome Web Store, in `assets/`.
