# Privacy policy

Polished GitHub is a browser extension for github.com. It is not affiliated with, endorsed or sponsored by GitHub, Inc.

## What the extension stores

- **Your settings**, such as which features are on and the commit email you chose for each organization, saved in your browser's extension storage. If browser sync is on, your browser syncs them across your own devices.
- **Your GitHub token**, if you enter one, saved in your browser's local extension storage on this device only. It is never synced.
- **Pending review counts** shown in the reviewers picker, saved in the same local storage for five minutes so they show at once on the next pages, then dropped.
- **The emails and owners seen in merge boxes**: the verified emails GitHub offers in the last merge box you opened, and the owners of the pull requests where one showed up, saved in the same local storage so the options page can suggest them in the commit email rules.

## What the extension sends

Only when you have entered a token, and only to `api.github.com`:

- **Your GitHub token**, to authenticate the requests.
- **What the features need to look up**: the owner and name of the repository you are viewing, the numbers of the pull requests listed on the page, and the logins of the people and teams in the reviewers picker. GitHub answers with review status, diff stats, last activity and pending review counts.
- When you open the options page, a check of the token: your login and how many API requests you have left. If the token allows it, the options page also asks for your organizations and verified emails, to suggest them in the commit email rules.

Nothing is sent to the developer or to any other party. The extension has no server, no analytics and no tracking.

## What the extension reads

On github.com pages, the extension reads the page to add its badges and buttons. Apart from the lookups above, what it reads stays in your browser.

## Removing your data

To delete the token, empty the token field in the options page and save. "Reset to defaults" restores the settings and keeps the token. Uninstalling the extension deletes everything it stored. You can also revoke the token on GitHub at any time.

## Contact

Questions and requests: https://github.com/vmaerten/polished-github/issues
